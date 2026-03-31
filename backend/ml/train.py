import os
import sys
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix
)
from xgboost import XGBClassifier

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from data.generate_dataset import load_churn_dataset

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

CATEGORICAL_COLS = [
    "Contract", "InternetService", "PaymentMethod", "gender",
    "Partner", "Dependents", "PhoneService", "MultipleLines",
    "OnlineSecurity", "OnlineBackup", "DeviceProtection",
    "TechSupport", "StreamingTV", "StreamingMovies", "PaperlessBilling"
]
NUMERIC_COLS = ["tenure", "MonthlyCharges", "TotalCharges", "SeniorCitizen"]
FEATURE_COLS = NUMERIC_COLS + CATEGORICAL_COLS


def preprocess(df: pd.DataFrame, encoders: dict = None, scaler: StandardScaler = None, fit: bool = True):
    """Encode categoricals and scale numerics."""
    X = df[FEATURE_COLS].copy()

    if fit:
        encoders = {}
        for col in CATEGORICAL_COLS:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            encoders[col] = le
        scaler = StandardScaler()
        X[NUMERIC_COLS] = scaler.fit_transform(X[NUMERIC_COLS])
    else:
        for col in CATEGORICAL_COLS:
            le = encoders[col]
            X[col] = X[col].astype(str).map(
                lambda val, le=le: le.transform([val])[0]
                if val in le.classes_
                else le.transform([le.classes_[0]])[0]
            )
        X[NUMERIC_COLS] = scaler.transform(X[NUMERIC_COLS])

    return X, encoders, scaler


def compute_metrics(y_true, y_pred, y_prob):
    cm = confusion_matrix(y_true, y_pred).tolist()
    return {
        "accuracy": round(accuracy_score(y_true, y_pred), 4),
        "precision": round(precision_score(y_true, y_pred, zero_division=0), 4),
        "recall": round(recall_score(y_true, y_pred, zero_division=0), 4),
        "f1": round(f1_score(y_true, y_pred, zero_division=0), 4),
        "auc_roc": round(roc_auc_score(y_true, y_prob), 4),
        "confusion_matrix": cm,
    }




def train_all():
    print("Generating dataset...")
    df = load_churn_dataset()

    y = df["Churn"].values
    X, encoders, scaler = preprocess(df, fit=True)
    feature_names = list(X.columns)

    X_train, X_test, y_train, y_test = train_test_split(
        X.values, y, test_size=0.2, random_state=42, stratify=y
    )

    models = {
        "logistic_regression": LogisticRegression(max_iter=500, random_state=42),
        "random_forest": RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
        "xgboost": XGBClassifier(
            n_estimators=100, random_state=42,
            use_label_encoder=False, eval_metric="logloss", verbosity=0
        ),
    }

    all_metrics = {}

    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]
        metrics = compute_metrics(y_test, y_pred, y_prob)
        all_metrics[name] = metrics

        print(f"  Accuracy: {metrics['accuracy']:.4f}, AUC-ROC: {metrics['auc_roc']:.4f}")
        joblib.dump(model, os.path.join(MODELS_DIR, f"{name}.pkl"))

    joblib.dump(encoders, os.path.join(MODELS_DIR, "encoders.pkl"))
    joblib.dump(scaler, os.path.join(MODELS_DIR, "scaler.pkl"))

    with open(os.path.join(MODELS_DIR, "feature_names.json"), "w") as f:
        json.dump(feature_names, f)

    with open(os.path.join(MODELS_DIR, "metrics.json"), "w") as f:
        json.dump(all_metrics, f)


    churn_rate = float(y.mean())
    with open(os.path.join(MODELS_DIR, "dataset_stats.json"), "w") as f:
        json.dump({"n_samples": len(df), "churn_rate": round(churn_rate, 4)}, f)

    print("Training complete. All models and artifacts saved.")
    return all_metrics


if __name__ == "__main__":
    train_all()
