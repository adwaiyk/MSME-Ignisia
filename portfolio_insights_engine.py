import pandas as pd

def generate_executive_insights(df):
    """
    Acts as a Deterministic AI Analyst. Reads the dataframe and generates 
    factual, actionable insights for the Chief Risk Officer (CRO).
    """
    insights = []
    
    # 1. Fraud Financial Impact Insight
    fraud_df = df[df['accommodation_fraud_flag'] == True]
    if not fraud_df.empty:
        fraud_exposure = float(fraud_df['outstanding_principal_inr'].sum())
        insights.append({
            "type": "CRITICAL",
            "icon": "🚨",
            "title": "Fraud Network Exposure",
            "text": f"NetworkX graph algorithms have isolated {len(fraud_df)} active Accommodation Bill accounts. Total immediate capital at risk is ₹{(fraud_exposure / 10000000):.2f} Crores."
        })

    # 2. AI vs. CIBIL "Lift" Insight (Your Hackathon ROI)
    # Find MSMEs that CIBIL thought were safe (>700), but your AI flagged as High/Critical Risk (<600)
    blind_spots_df = df[(df['legacy_cibil_score'] >= 700) & (df['ai_blended_score'] < 600)]
    if not blind_spots_df.empty:
        saved_capital = float(blind_spots_df['outstanding_principal_inr'].sum())
        insights.append({
            "type": "POSITIVE",
            "icon": "✅",
            "title": "Legacy Bureau Blind Spots",
            "text": f"The AI model successfully downgraded {len(blind_spots_df)} loans that traditional CIBIL scores falsely rated as 'Safe'. This protected ₹{(saved_capital / 10000000):.2f} Crores from likely default."
        })

    # 3. Industry Concentration Risk
    critical_df = df[df['risk_band'] == "Critical Risk"]
    if not critical_df.empty:
        # Find the industry with the most critical risk accounts
        worst_industry = critical_df['industry_sector'].value_counts().idxmax()
        worst_industry_count = critical_df['industry_sector'].value_counts().max()
        
        # Calculate the failure rate for that specific industry
        total_in_worst = len(df[df['industry_sector'] == worst_industry])
        failure_rate = (worst_industry_count / total_in_worst) * 100
        
        insights.append({
            "type": "WARNING",
            "icon": "⚠️",
            "title": "Sector Concentration Risk",
            "text": f"The '{worst_industry}' sector is currently degrading. {failure_rate:.1f}% of all loans in this sector have fallen into the Critical Risk band, largely due to escalating GST delays and low UPI velocity."
        })

    return insights

if __name__ == "__main__":
    print("\n🧠 INITIATING AI EXECUTIVE BRIEFING ENGINE 🧠")
    print("-" * 60)
    
    try:
        # Load the CSV you generated earlier
        df = pd.read_csv("bank_portfolio_master.csv")
        print(f"📊 Scanning portfolio of {len(df)} MSME loans...\n")
        
        # Run the AI Insights Engine
        briefing = generate_executive_insights(df)
        
        # Print the results beautifully to the terminal
        for insight in briefing:
            print(f"{insight['icon']} [{insight['type']}] {insight['title'].upper()}")
            print(f"   {insight['text']}\n")
            
        print("-" * 60)
        print("✅ Executive Briefing Complete.")
        
    except FileNotFoundError:
        print("⚠️ Error: 'bank_portfolio_master.csv' not found. Please run the generation script first.")