import pandas as pd
import joblib
import importlib.util

# ==============================
# SIMPLE PATHS TO SCRIPTS
# ==============================
FEATURE_ENGINEERING_PATH = "//media/aditya/3C4F8EAC3C229A1D/college/Hackthon/Ignisia2026/pipeline/api/pipelining/data-synthesis/feature_engineering.py"
SHAP_SERIALIZER_PATH = "/media/aditya/3C4F8EAC3C229A1D/college/Hackthon/Ignisia2026/pipeline/api/pipelining/backend-fastapi/engines/shap_serializer.py"
XGBOOST_ENGINE_PATH = "/media/aditya/3C4F8EAC3C229A1D/college/Hackthon/Ignisia2026/pipeline/api/pipelining/backend-fastapi/engines/xgboost_engine.py"

# ==============================
# LOAD MODULES FROM PATH
# ==============================
def load_module_from_path(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

feature_engineering = load_module_from_path("feature_engineering", FEATURE_ENGINEERING_PATH)
shap_serializer = load_module_from_path("shap_serializer", SHAP_SERIALIZER_PATH)
xgb_engine = load_module_from_path("xgboost_engine", XGBOOST_ENGINE_PATH)
FEATURE_COLS = xgb_engine.FEATURE_COLS

# ==============================
# MODEL AND DATA
# ==============================
MODEL_PATH = "/media/aditya/3C4F8EAC3C229A1D/college/Hackthon/Ignisia2026/pipeline/api/pipelining/models/xgboost_v1.joblib"
xgb_model = joblib.load(MODEL_PATH)

DATASETS_PATH = "/media/aditya/3C4F8EAC3C229A1D/college/Hackthon/Ignisia2026/pipeline/api/pipelining/data-synthesis/datasets"
onboarding_df = pd.read_csv(f"{DATASETS_PATH}/onboarding_data.csv")
gst_df = pd.read_csv(f"{DATASETS_PATH}/gst_filings.csv")
upi_df = pd.read_csv(f"{DATASETS_PATH}/upi_transactions.csv")
eway_df = pd.read_csv(f"{DATASETS_PATH}/eway_bills.csv")

# ==============================
# SCORE FUNCTION
# ==============================
def score_from_gstin(gstin: str) -> dict:
    gstin = gstin.strip().lower()
    onboarding_df["gstin"] = onboarding_df["gstin"].astype(str).str.lower()

    if gstin not in onboarding_df["gstin"].values:
        return {"error": f"GSTIN {gstin} not found."}

    entity_id = onboarding_df.loc[onboarding_df["gstin"] == gstin, "entity_id"].iloc[0]

    if "msme_id" in gst_df.columns:
        gst_df.rename(columns={"msme_id": "entity_id"}, inplace=True)

    # default values
    if "industry_risk_factor" not in onboarding_df.columns:
        onboarding_df["industry_risk_factor"] = 0.5
    if "is_anomaly" not in eway_df.columns:
        eway_df["is_anomaly"] = 0

    confidence = "high"
    if gst_df[gst_df["entity_id"] == entity_id].empty or upi_df[upi_df["entity_id"] == entity_id].empty:
        confidence = "medium"

    feature_df = feature_engineering.transform(str(entity_id), gst_df, upi_df, eway_df, onboarding_df)
    X = feature_df[FEATURE_COLS].fillna(0)

    pd_val = float(xgb_model.predict_proba(X)[:, 1][0])
    credit_score = int(900 - pd_val * 600)

    # Risk band
    if pd_val < 0.2:
        risk_band = "VERY_LOW_RISK_APPROVED"
        tenure_months = 36
    elif pd_val < 0.4:
        risk_band = "LOW_RISK_APPROVED"
        tenure_months = 24
    elif pd_val < 0.6:
        risk_band = "MEDIUM_RISK_REVIEW"
        tenure_months = 12
    elif pd_val <= 0.8:
        risk_band = "HIGH_RISK_REVIEW"
        tenure_months = 6
    else:
        risk_band = "HIGH_RISK_DECLINED"
        tenure_months = 0

    # Loan amount
    loan_amount = 0.0
    if risk_band != "HIGH_RISK_DECLINED":
        annual_inflow = float(feature_df["upi_inflow_avg"].iloc[0]) * 12
        loan_amount = 0.25 * annual_inflow
        if int(feature_df["bureau_score_cibil"].iloc[0]) == -1:
            loan_amount *= 0.80
        if float(feature_df["vintage_months"].iloc[0]) < 12:
            loan_amount *= 0.75

    shap_res = shap_serializer.explain(X, xgb_model)
    top_reasons = shap_res.get("top_5_reasons", [])

    return {
        "gstin": gstin,
        "credit_score": credit_score,
        "probability_of_default": round(pd_val, 6),
        "risk_band": risk_band,
        "recommended_loan_amount": round(loan_amount, 2),
        "tenure_months": tenure_months,
        "confidence": confidence,
        "top_reasons": top_reasons
    }

# ==============================
# CLI
# ==============================
def main():
    gstin = input("Enter GSTIN: ")
    result = score_from_gstin(gstin)
    print(result)

if __name__ == "__main__":
    main()