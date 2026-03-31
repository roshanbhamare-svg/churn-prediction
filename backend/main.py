import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

sys.path.insert(0, os.path.dirname(__file__))
from data.generate_dataset import load_churn_dataset
from ml.train import train_all, preprocess, MODELS_DIR
from database import init_db, get_db, Prediction
from sqlalchemy.orm import Session
from fastapi import Depends

app = FastAPI(
    title="Customer Churn Prediction API",
    description="Predict customer churn using Logistic Regression, Random Forest, and XGBoost.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


_models: dict = {}
_encoders = None
_scaler = None
_feature_names: list = []
_metrics: dict = {}
_dataset_stats: dict = {}
_training_status: str = "idle" 


def _load_artifacts():
    global _models, _encoders, _scaler, _feature_names, _metrics, _dataset_stats

    model_files = {
        "logistic_regression": "logistic_regression.pkl",
        "random_forest": "random_forest.pkl",
        "xgboost": "xgboost.pkl",
    }
    for name, fname in model_files.items():
        path = os.path.join(MODELS_DIR, fname)
        if os.path.exists(path):
            _models[name] = joblib.load(path)

    enc_path = os.path.join(MODELS_DIR, "encoders.pkl")
    if os.path.exists(enc_path):
        _encoders = joblib.load(enc_path)

    scaler_path = os.path.join(MODELS_DIR, "scaler.pkl")
    if os.path.exists(scaler_path):
        _scaler = joblib.load(scaler_path)

    fn_path = os.path.join(MODELS_DIR, "feature_names.json")
    if os.path.exists(fn_path):
        with open(fn_path) as f:
            _feature_names = json.load(f)

    m_path = os.path.join(MODELS_DIR, "metrics.json")
    if os.path.exists(m_path):
        with open(m_path) as f:
            _metrics = json.load(f)


    stats_path = os.path.join(MODELS_DIR, "dataset_stats.json")
    if os.path.exists(stats_path):
        with open(stats_path) as f:
            _dataset_stats = json.load(f)


def _is_ready():
    return bool(_models and _encoders and _scaler and _feature_names)


@app.on_event("startup")
def on_startup():
    init_db()
    _load_artifacts()
    if not _is_ready():
        print("Models not found. Training now on startup...")
        try:
            train_all()
            _load_artifacts()
        except Exception as e:
            print(f"Startup training failed: {e}")

class CustomerInput(BaseModel):
    customer_id: Optional[str] = Field(None, example="CUST-1234")
    customer_name: Optional[str] = Field(None, example="John Doe")
    gender: str = Field(..., example="Male")
    SeniorCitizen: int = Field(..., ge=0, le=1, example=0)
    Partner: str = Field(..., example="Yes")
    Dependents: str = Field(..., example="No")
    tenure: int = Field(..., ge=0, le=72, example=12)
    PhoneService: str = Field(..., example="Yes")
    MultipleLines: str = Field(..., example="No")
    InternetService: str = Field(..., example="Fiber optic")
    OnlineSecurity: str = Field(..., example="No")
    OnlineBackup: str = Field(..., example="Yes")
    DeviceProtection: str = Field(..., example="No")
    TechSupport: str = Field(..., example="No")
    StreamingTV: str = Field(..., example="Yes")
    StreamingMovies: str = Field(..., example="Yes")
    Contract: str = Field(..., example="Month-to-month")
    PaperlessBilling: str = Field(..., example="Yes")
    PaymentMethod: str = Field(..., example="Electronic check")
    MonthlyCharges: float = Field(..., ge=0, le=200, example=65.50)
    TotalCharges: float = Field(..., ge=0, example=786.0)
    model_name: Optional[str] = Field("logistic_regression", example="logistic_regression")


class PredictionResponse(BaseModel):
    churn: bool
    probability: float
    risk_level: str
    model_used: str


@app.get("/health", tags=["System"])
def health():
    return {
        "status": "ok",
        "models_loaded": list(_models.keys()),
        "ready": _is_ready(),
        "training_status": _training_status,
    }


@app.get("/models", tags=["Models"])
def get_models():
    if not _models:
        raise HTTPException(status_code=503, detail="Models not loaded yet.")
    return {
        "available_models": list(_models.keys()),
        "metrics": _metrics,
        "dataset_stats": _dataset_stats,
    }


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict(customer: CustomerInput, db: Session = Depends(get_db)):
    global _models, _encoders, _scaler

    if not _is_ready():
        raise HTTPException(status_code=503, detail="Models are not ready. Please wait or trigger /train.")

    model_name = customer.model_name or "logistic_regression"
    if model_name not in _models:
        raise HTTPException(status_code=400, detail=f"Model '{model_name}' not found. Choose from: {list(_models.keys())}")

    input_dict = customer.dict(exclude={"model_name"})
    df = pd.DataFrame([input_dict])

    X, _, _ = preprocess(df, encoders=_encoders, scaler=_scaler, fit=False)
    model = _models[model_name]

    prob = float(model.predict_proba(X.values)[0][1])
    churn = prob >= 0.5

    if prob >= 0.7:
        risk = "High"
    elif prob >= 0.4:
        risk = "Medium"
    else:
        risk = "Low"

    res = PredictionResponse(
        churn=churn,
        probability=round(prob, 4),
        risk_level=risk,
        model_used=model_name,
    )

    try:
        db_prediction = Prediction(
            customer_id=customer.customer_id,
            customer_name=customer.customer_name,
            model_used=model_name,
            prediction="Churn" if churn else "No Churn",
            churn_probability=round(prob, 4),
            risk_level=risk,
            monthly_charges=customer.MonthlyCharges,
            input_features=json.dumps(customer.dict(exclude={"model_name"}))
        )
        db.add(db_prediction)
        db.commit()
    except Exception as e:
        print(f"Error saving prediction to DB: {e}")
        db.rollback()

    return res


@app.post("/train", tags=["System"])
def trigger_training(background_tasks: BackgroundTasks):
    global _training_status

    if _training_status == "training":
        return {"message": "Training already in progress."}

    def run_training():
        global _training_status
        _training_status = "training"
        try:
            train_all()
            _load_artifacts()
            _training_status = "done"
        except Exception as e:
            _training_status = "error"
            print(f"Training error: {e}")

    _training_status = "training"
    background_tasks.add_task(run_training)
    return {"message": "Training started in background. Poll /health for status."}


@app.get("/revenue-at-risk", tags=["Dashboard"])
def get_revenue_at_risk():
    global _models, _encoders, _scaler

    if not _is_ready():
        raise HTTPException(status_code=503, detail="Models are not ready. Please wait or trigger /train.")

    try:
        df = load_churn_dataset(keep_customer_id=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load dataset: {str(e)}")

    model_name = "logistic_regression"
    if model_name not in _models.keys():
        model_name = list(_models.keys())[0] if _models else None
    
    if not model_name:
        raise HTTPException(status_code=500, detail="No models found.")

    model = _models[model_name]

    X, _, _ = preprocess(df, encoders=_encoders, scaler=_scaler, fit=False)

    probs = model.predict_proba(X.values)[:, 1]

    results = []
    total_revenue_at_risk = 0.0
    high_risk_customers = 0
    
    revenue_by_risk = {"High": 0.0, "Medium": 0.0, "Low": 0.0}
    revenue_by_contract = {}
    revenue_by_tenure = {"0-12 months": 0.0, "13-24 months": 0.0, "25+ months": 0.0}

    for i, row in df.iterrows():
        customer_id = row.get("customerID", f"CUST-{i+1000}")
        monthly_charges = float(row.get("MonthlyCharges", 0.0))
        contract = row.get("Contract", "Unknown")
        tenure = int(row.get("tenure", 0))

        prob = float(probs[i])
        rev_risk = monthly_charges * prob

        if prob >= 0.7:
            risk = "High"
            action = "Retention Call"
        elif prob >= 0.4:
            risk = "Medium"
            action = "Discount Offer"
        else:
            risk = "Low"
            action = "Monitor"

        total_revenue_at_risk += rev_risk
        if risk == "High":
            high_risk_customers += 1

        revenue_by_risk[risk] += rev_risk
        
        revenue_by_contract[contract] = revenue_by_contract.get(contract, 0.0) + rev_risk

        if tenure <= 12:
            t_group = "0-12 months"
        elif tenure <= 24:
            t_group = "13-24 months"
        else:
            t_group = "25+ months"
        revenue_by_tenure[t_group] += rev_risk

        results.append({
            "customer_id": customer_id,
            "monthly_charges": round(monthly_charges, 2),
            "churn_probability": round(prob, 4),
            "risk_level": risk,
            "revenue_at_risk": round(rev_risk, 2),
            "contract": contract,
            "tenure": tenure,
            "suggested_action": action
        })

    results.sort(key=lambda x: x["revenue_at_risk"], reverse=True)

    top_segment_key = max(revenue_by_contract.items(), key=lambda x: x[1])[0] if revenue_by_contract else "Unknown"
    avg_revenue_at_risk = total_revenue_at_risk / len(results) if results else 0.0

    chart_risk = [{"name": k, "value": round(v, 2)} for k, v in revenue_by_risk.items()]
    chart_contract = [{"name": k, "value": round(v, 2)} for k, v in revenue_by_contract.items()]
    chart_tenure = [{"name": k, "value": round(v, 2)} for k, v in revenue_by_tenure.items()]

    return {
        "summary": {
            "total_revenue_at_risk": round(total_revenue_at_risk, 2),
            "high_risk_customers": high_risk_customers,
            "avg_revenue_at_risk": round(avg_revenue_at_risk, 2),
            "top_revenue_risk_segment": f"{top_segment_key} Contract"
        },
        "chart_data": {
            "revenue_by_risk": chart_risk,
            "revenue_by_contract": chart_contract,
            "revenue_by_tenure": chart_tenure
        },
        "top_customers": results[:100]  
    }

@app.get("/predictions", tags=["History"])
def get_predictions(
    customer_id: Optional[str] = None,
    customer_name: Optional[str] = None,
    model_used: Optional[str] = None,
    risk_level: Optional[str] = None,
    prediction: Optional[str] = None,
    sort_by: str = "created_at",
    order: str = "desc",
    page: int = 1,
    page_size: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Prediction)

    if customer_id:
        query = query.filter(Prediction.customer_id.contains(customer_id))
    if customer_name:
        query = query.filter(Prediction.customer_name.contains(customer_name))
    if model_used:
        query = query.filter(Prediction.model_used == model_used)
    if risk_level:
        query = query.filter(Prediction.risk_level == risk_level)
    if prediction:
        query = query.filter(Prediction.prediction == prediction)

    if sort_by == "risk_level":
        pass
    
    if hasattr(Prediction, sort_by):
        col = getattr(Prediction, sort_by)
        if order == "desc":
            query = query.order_by(col.desc())
        else:
            query = query.order_by(col.asc())

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    results = []
    for item in items:
        results.append({
            "id": item.id,
            "customer_id": item.customer_id,
            "customer_name": item.customer_name,
            "model_used": item.model_used,
            "prediction": item.prediction,
            "churn_probability": item.churn_probability,
            "risk_level": item.risk_level,
            "monthly_charges": item.monthly_charges,
            "created_at": item.created_at
        })

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": results
    }


@app.get("/predictions/{prediction_id}", tags=["History"])
def get_prediction_detail(prediction_id: int, db: Session = Depends(get_db)):
    pred = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    data = {
        "id": pred.id,
        "customer_id": pred.customer_id,
        "customer_name": pred.customer_name,
        "model_used": pred.model_used,
        "prediction": pred.prediction,
        "churn_probability": pred.churn_probability,
        "risk_level": pred.risk_level,
        "monthly_charges": pred.monthly_charges,
        "created_at": pred.created_at,
        "input_features": json.loads(pred.input_features) if pred.input_features else {}
    }
    return data


@app.delete("/predictions/{prediction_id}", tags=["History"])
def delete_prediction(prediction_id: int, db: Session = Depends(get_db)):
    pred = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    db.delete(pred)
    db.commit()
    return {"message": "Prediction deleted successfully"}
