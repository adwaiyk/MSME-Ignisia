# ==============================
# NLP Reason Engine
# ==============================
def generate_reason(feature_name: str, shap_value: float, feature_value: float) -> str:
    # Handle near-zero SHAP values as neutral
    if abs(shap_value) < 0.001:
        return ""

    val = abs(shap_value)
    if val > 1.5:
        intensity = "Strong"
    elif val > 0.7:
        intensity = "Moderate"
    elif val > 0.3:
        intensity = "Mild"
    else:
        intensity = "Slight"

    is_positive = shap_value < 0  # SHAP < 0 means lower PD
    
    # Specific edge case: Missing Bureau
    if feature_name == "bureau_score_cibil" and feature_value <= 0:
        if not is_positive:
            return f"{intensity} penalty assessed due to undocumented bureau credit history."
        else:
            return f"{intensity} baseline offset compensates for absent bureau credit history."
            
    # Specific edge case: Immature Vintage
    if feature_name == "vintage_months" and feature_value < 6:
        if not is_positive:
            return f"{intensity} risk assigned reflecting highly immature operational vintage."
            
    # Specific edge case: Zero Activity
    if feature_value == 0:
        if not is_positive:
            clean_name = feature_name.replace('_', ' ')
            return f"{intensity} risk flagged: lack of recorded {clean_name} activity."
            
    metrics = {
        "gst_ontime_rate": ("timely GST tax compliance", "irregular GST tax compliance"),
        "gst_avg_delay": ("minimal GST tax filing delays", "protracted GST tax filing delays"),
        "sales_volume_avg": ("robust declared sales volumes", "depressed declared sales volumes"),
        "itc_utilisation_ratio": ("efficient tax credit utilisation", "deficient tax credit utilisation"),
        "upi_inflow_avg": ("stable UPI revenue inflows", "contracting UPI revenue inflows"),
        "upi_outflow_avg": ("disciplined UPI expense outflows", "elevated UPI expense outflows"),
        "upi_net_flow_ratio": ("surplus net UPI liquidity", "deficit net UPI liquidity"),
        "upi_velocity_30d": ("accelerated UPI transaction velocity", "decelerated UPI transaction velocity"),
        "upi_counterparty_diversity": ("diversified UPI counterparty exposure", "concentrated UPI counterparty exposure"),
        "geo_diversity": ("broad geographic operational footprint", "localized geographic operational footprint"),
        "repeated_counterparty_ratio": ("stable recurring commercial relationships", "sporadic commercial counterparty relationships"),
        "eway_volume_avg": ("healthy logistics transit volumes", "restricted logistics transit volumes"),
        "eway_momentum": ("expanding physical logistics momentum", "contracting physical logistics momentum"),
        "eway_anomaly_rate": ("standardised e-way bill compliance", "anomalous e-way bill declarations"),
        "vintage_months": ("mature business operational history", "insufficient business operational history"),
        "age_penalty": ("matured enterprise risk profile", "immature enterprise risk profile"),
        "industry_risk_factor": ("favorable industry risk assessment", "elevated macro industry risk"),
        "bureau_score_cibil": ("excellent legacy bureau creditworthiness", "substandard legacy bureau creditworthiness"),
    }
    
    desc_tuple = metrics.get(feature_name, ("favorable operational dynamic", "adverse operational dynamic"))
    desc = desc_tuple[0] if is_positive else desc_tuple[1]
    
    action = "bolsters holistic creditworthiness" if is_positive else "amplifies default probability"
    
    # Phrase variance to help uniqueness
    idx = len(feature_name) % 3
    if idx == 0:
        return f"{intensity} {desc} {action}."
    elif idx == 1:
        return f"{intensity} evidence of {desc} {action}."
    else:
        return f"{intensity} indicator: {desc} {action}."