"""
feature_engineering.py
Owner: ML & Risk Architect
Purpose: Reusable feature engineering module.
"""

import numpy as np
import pandas as pd

def transform(entity_id: str, gst_df: pd.DataFrame, upi_df: pd.DataFrame,
              eway_df: pd.DataFrame, master_df: pd.DataFrame) -> pd.DataFrame:
    
    gst = gst_df[gst_df["entity_id"] == entity_id].copy()
    upi = upi_df[upi_df["entity_id"] == entity_id].copy()
    eway = eway_df[eway_df["entity_id"] == entity_id].copy()
    master = master_df[master_df["entity_id"] == entity_id].copy()

    features = {"entity_id": entity_id}

    if len(gst) > 0:
        gst["delay_days"] = pd.to_numeric(gst["delay_days"], errors="coerce").fillna(0)
        gst["total_sales_declared"] = pd.to_numeric(gst["total_sales_declared"], errors="coerce").fillna(0)
        gst["tax_paid_cash"] = pd.to_numeric(gst["tax_paid_cash"], errors="coerce").fillna(0)
        gst["tax_paid_itc"] = pd.to_numeric(gst["tax_paid_itc"], errors="coerce").fillna(0)

        features["gst_ontime_rate"] = (gst["delay_days"] == 0).mean()
        features["gst_avg_delay"] = gst["delay_days"].mean()
        
        # sales_volume_avg logic
        tax_periods = gst.groupby("tax_period")
        sales_per_period = tax_periods["total_sales_declared"].sum()
        features["sales_volume_avg"] = sales_per_period.mean() if len(sales_per_period) > 0 else 0.0
        
        # itc_utilisation_ratio logic
        total_itc = gst["tax_paid_itc"].sum()
        total_cash = gst["tax_paid_cash"].sum()
        if (total_itc + total_cash) > 0:
            features["itc_utilisation_ratio"] = total_itc / (total_itc + total_cash)
        else:
            features["itc_utilisation_ratio"] = 0.0
    else:
        features["gst_ontime_rate"] = 0.0
        features["gst_avg_delay"] = 0.0
        features["sales_volume_avg"] = 0.0
        features["itc_utilisation_ratio"] = 0.0


    if len(upi) > 0:
        upi["amount_inr"] = pd.to_numeric(upi["amount_inr"], errors="coerce").fillna(0)
        upi["timestamp"] = pd.to_datetime(upi["timestamp"], errors="coerce")

        upi["month"] = upi["timestamp"].dt.to_period("M")
        n_months = max(upi["month"].nunique(), 1)

        inflows = upi[upi["txn_type"] == "CREDIT"]["amount_inr"].sum()
        outflows = upi[upi["txn_type"] == "DEBIT"]["amount_inr"].sum()

        features["upi_inflow_avg"] = inflows / n_months
        features["upi_outflow_avg"] = outflows / n_months

        if features["upi_inflow_avg"] > 0:
            features["upi_net_flow_ratio"] = np.clip(
                (features["upi_inflow_avg"] - features["upi_outflow_avg"]) / features["upi_inflow_avg"],
                -1.0, 1.0,
            )
        else:
            features["upi_net_flow_ratio"] = 0.0

        max_ts = upi["timestamp"].max()
        if pd.notna(max_ts):
            cutoff = max_ts - pd.Timedelta(days=30)
            features["upi_velocity_30d"] = int(upi[upi["timestamp"] >= cutoff].shape[0])
        else:
            features["upi_velocity_30d"] = 0

        features["upi_counterparty_diversity"] = upi["counterparty_vpa"].nunique()
        
        features["geo_diversity"] = upi["geo_location"].nunique()
        
        features["repeated_counterparty_ratio"] = upi["is_repeated_counterparty"].mean()
        if pd.isna(features["repeated_counterparty_ratio"]):
            features["repeated_counterparty_ratio"] = 0.0
    else:
        features["upi_inflow_avg"] = 0.0
        features["upi_outflow_avg"] = 0.0
        features["upi_net_flow_ratio"] = 0.0
        features["upi_velocity_30d"] = 0
        features["upi_counterparty_diversity"] = 0
        features["geo_diversity"] = 0
        features["repeated_counterparty_ratio"] = 0.0

    if len(eway) > 0:
        eway["generation_date"] = pd.to_datetime(eway["generation_date"], errors="coerce")
        eway["month"] = eway["generation_date"].dt.to_period("M")

        monthly_counts = eway.groupby("month").size()
        features["eway_volume_avg"] = monthly_counts.mean() if len(monthly_counts) > 0 else 0.0

        if len(monthly_counts) >= 2:
            sorted_months = monthly_counts.sort_index()
            mid = len(sorted_months) // 2
            first_half_avg = sorted_months.iloc[:mid].mean()
            second_half_avg = sorted_months.iloc[mid:].mean()

            if first_half_avg > 0:
                features["eway_momentum"] = (second_half_avg - first_half_avg) / first_half_avg
            else:
                features["eway_momentum"] = 0.0
        else:
            features["eway_momentum"] = 0.0
            
        features["eway_anomaly_rate"] = eway["is_anomaly"].mean()
        if pd.isna(features["eway_anomaly_rate"]):
            features["eway_anomaly_rate"] = 0.0
    else:
        features["eway_volume_avg"] = 0.0
        features["eway_momentum"] = 0.0
        features["eway_anomaly_rate"] = 0.0

    if len(master) > 0:
        master_row = master.iloc[0]

        vintage_months = float(pd.to_numeric(master_row.get("vintage_months", 0), errors="coerce"))
        features["vintage_months"] = vintage_months
        features["age_penalty"] = np.exp(-0.1 * vintage_months)

        features["industry_risk_factor"] = float(
            pd.to_numeric(master_row.get("industry_risk_factor", 0.5), errors="coerce")
        )
        features["bureau_score_cibil"] = int(
            pd.to_numeric(master_row.get("bureau_score_cibil", 500), errors="coerce")
        )

        if vintage_months < 6:
            features["data_confidence"] = "low"
        elif vintage_months <= 12:
            features["data_confidence"] = "medium"
        else:
            features["data_confidence"] = "high"
    else:
        features["vintage_months"] = 0.0
        features["age_penalty"] = 1.0
        features["industry_risk_factor"] = 0.5
        features["bureau_score_cibil"] = 500
        features["data_confidence"] = "low"

    result = pd.DataFrame([features])
    numeric_cols = result.select_dtypes(include=[np.number]).columns
    result[numeric_cols] = result[numeric_cols].fillna(0)

    return result
