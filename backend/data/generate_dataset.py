import os
import io
import urllib.request
import pandas as pd

def load_churn_dataset(keep_customer_id: bool = False) -> pd.DataFrame:
    """Download and prepare the Kaggle Telco Customer Churn dataset."""
    url = "https://raw.githubusercontent.com/IBM/telco-customer-churn-on-icp4d/master/data/Telco-Customer-Churn.csv"
    
    local_path = os.path.join(os.path.dirname(__file__), "WA_Fn-UseC_-Telco-Customer-Churn.csv")
    
    if os.path.exists(local_path):
        df = pd.read_csv(local_path)
    else:
        print("Downloading Kaggle Telco Customer Churn dataset...")
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            csv_data = response.read().decode('utf-8')
        df = pd.read_csv(io.StringIO(csv_data))
        df.to_csv(local_path, index=False)
        print("Downloaded seamlessly.")


    if not keep_customer_id and "customerID" in df.columns:
        df = df.drop(columns=["customerID"])
        
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"].replace(" ", ""), errors="coerce").fillna(0)
    
    df["Churn"] = df["Churn"].replace({"Yes": 1, "No": 0}).astype(int)
        
    return df

if __name__ == "__main__":
    df = load_churn_dataset()
    print(f"Dataset mapped and loaded: {len(df)} rows. Churn rate: {df['Churn'].mean():.2%}")
