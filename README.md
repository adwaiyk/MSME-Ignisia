

# Ignisia 
## Real-Time MSME Credit Scoring via Alternative Business Signals

---

## Problem

Most MSMEs get rejected for loans because they don’t have enough credit history.  
Traditional systems rely on outdated data like bureau scores and financial statements.

---

## Solution

This project builds a **real-time credit scoring system** using:

- GST data (compliance)
- UPI transactions (cash flow)
- E-way bills (business activity)
- Explainable AI (SHAP)
- Fraud detection (Graph analysis)

---

##Workflow
User enters GSTIN
↓ ---
Frontend (Next.js) sends request
↓
Backend (FastAPI) processes data
↓
Feature Engineering (Pandas)
↓
ML Model (XGBoost) calculates score
↓
SHAP explains the decision
↓
Graph Engine detects fraud
↓
Final JSON response sent back
↓
Frontend shows dashboard + results
