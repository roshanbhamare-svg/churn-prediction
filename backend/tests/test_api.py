import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from main import app


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

SAMPLE_CUSTOMER = {
    "tenure": 12,
    "MonthlyCharges": 65.5,
    "TotalCharges": 786.0,
    "SeniorCitizen": 0,
    "gender": "Male",
    "Partner": "Yes",
    "Dependents": "No",
    "PhoneService": "Yes",
    "MultipleLines": "No",
    "InternetService": "Fiber optic",
    "OnlineSecurity": "No",
    "OnlineBackup": "Yes",
    "DeviceProtection": "No",
    "TechSupport": "No",
    "StreamingTV": "Yes",
    "StreamingMovies": "Yes",
    "Contract": "Month-to-month",
    "PaperlessBilling": "Yes",
    "PaymentMethod": "Electronic check",
    "model_name": "logistic_regression",
}

def test_health(client):
    
    max_retries = 30
    ready = False
    for _ in range(max_retries):
        r = client.get("/health")
        assert r.status_code == 200
        if r.json().get("ready"):
            ready = True
            break
        import time
        time.sleep(1)
    
    assert ready, "Models failed to load/train within timeout"

def test_models(client):
    r = client.get("/models")
    assert r.status_code == 200
    data = r.json()
    assert "available_models" in data
    assert len(data["available_models"]) == 3

def test_predict_logistic(client):
    r = client.post("/predict", json={**SAMPLE_CUSTOMER, "model_name": "logistic_regression"})
    assert r.status_code == 200
    data = r.json()
    assert "churn" in data
    assert "probability" in data
    assert 0 <= data["probability"] <= 1

def test_predict_random_forest(client):
    r = client.post("/predict", json={**SAMPLE_CUSTOMER, "model_name": "random_forest"})
    assert r.status_code == 200

def test_predict_xgboost(client):
    r = client.post("/predict", json={**SAMPLE_CUSTOMER, "model_name": "xgboost"})
    assert r.status_code == 200

def test_feature_importance(client):
    for model in ["logistic_regression", "random_forest", "xgboost"]:
        r = client.get(f"/feature-importance/{model}")
        assert r.status_code == 200
        assert "importances" in r.json()

def test_metrics(client):
    r = client.get("/metrics")
    assert r.status_code == 200

def test_history_flow(client):

    payload = {**SAMPLE_CUSTOMER, "customer_id": "TEST-001", "customer_name": "Test User"}
    r = client.post("/predict", json=payload)
    assert r.status_code == 200
    
   
    r = client.get("/predictions")
    assert r.status_code == 200
    data = r.json()
    assert data["total"] >= 1
    

    item = next((i for i in data["items"] if i["customer_id"] == "TEST-001"), None)
    assert item is not None
    pred_id = item["id"]
    

    r = client.get(f"/predictions/{pred_id}")
    assert r.status_code == 200
    detail = r.json()
    assert detail["customer_name"] == "Test User"
    assert "input_features" in detail
    

    r = client.delete(f"/predictions/{pred_id}")
    assert r.status_code == 200

    r = client.get(f"/predictions/{pred_id}")
    assert r.status_code == 404
