import pandas as pd
import numpy as np
import random

print("🏦 INITIATING BANK PORTFOLIO DATA GENERATOR...")

NUM_LOANS = 5000

# Arrays for random selection
industries = ['Manufacturing', 'Retail/FMCG', 'Logistics', 'IT/Services', 'Agriculture Tech']
products = ['Working Capital Demand Loan', 'Term Loan', 'Supply Chain Finance', 'Overdraft']
states = ['Maharashtra', 'Karnataka', 'Delhi', 'Gujarat', 'Tamil Nadu']

data = []

for i in range(NUM_LOANS):
    msme_id = f"MSME_{10000 + i}"
    industry = random.choice(industries)
    product = random.choice(products)
    state = random.choice(states)
    
    vintage_years = round(random.uniform(1, 25), 1)
    
    # Financials
    sanctioned_amt = random.randint(5, 100) * 100000 # 5 Lakh to 1 Crore
    # Outstanding is a random percentage of sanctioned
    outstanding_amt = round(sanctioned_amt * random.uniform(0.1, 0.95), 2)
    
    # Alternative Data (The AI inputs)
    monthly_upi = random.randint(1, 50) * 100000
    gst_delay = random.choices([0, 5, 15, 30, 60], weights=[70, 15, 10, 4, 1])[0]
    
    # Determine Status & Traditional Score
    # If GST delay is high, chance of being a bad loan increases
    if gst_delay > 15 or vintage_years < 3:
        cibil_score = random.randint(550, 680)
        dpd = random.choices([0, 30, 60, 90], weights=[40, 30, 20, 10])[0]
    else:
        cibil_score = random.randint(680, 850)
        dpd = random.choices([0, 30, 60, 90], weights=[90, 7, 2, 1])[0]
        
    # The AI Score (Smarter than CIBIL)
    # AI rewards high UPI volume even if vintage is low
    ai_score = cibil_score
    if monthly_upi > 2000000 and dpd == 0:
        ai_score += random.randint(20, 50)
    if gst_delay > 0:
        ai_score -= random.randint(10, 40)
        
    ai_score = max(300, min(900, ai_score)) # Clamp between 300-900
    
    # Risk Banding based on AI Score
    if ai_score >= 750:
        risk_band = "Low Risk"
    elif ai_score >= 650:
        risk_band = "Medium Risk"
    elif ai_score >= 550:
        risk_band = "High Risk"
    else:
        risk_band = "Critical Risk"

    # Inject a few Fraud Rings (Our Accommodation Bills)
    fraud_flag = False
    if random.random() < 0.01: # 1% of portfolio is fraud
        fraud_flag = True
        risk_band = "Critical Risk"
        ai_score = random.randint(300, 450)
        dpd = 90 # Fraudsters usually default

    data.append({
        "msme_id": msme_id,
        "state": state,
        "industry_sector": industry,
        "vintage_years": vintage_years,
        "loan_product": product,
        "sanctioned_amount_inr": sanctioned_amt,
        "outstanding_principal_inr": outstanding_amt,
        "monthly_upi_volume_inr": monthly_upi,
        "avg_gst_delay_days": gst_delay,
        "legacy_cibil_score": cibil_score,
        "ai_blended_score": ai_score,
        "risk_band": risk_band,
        "days_past_due_dpd": dpd,
        "accommodation_fraud_flag": fraud_flag
    })

df = pd.DataFrame(data)
df.to_csv("bank_portfolio_master.csv", index=False)

print(f"✅ Generated highly realistic portfolio of {NUM_LOANS} MSME loans.")
print("📊 Data includes synthetic CIBIL vs AI Score correlations and injected fraud cases.")
print("💾 Saved to 'bank_portfolio_master.csv'")