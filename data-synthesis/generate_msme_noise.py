"""
generate_msme_noise.py
Owner: ML & Risk Architect
Purpose: Generate 10,000 synthetic MSME profiles with correlated alternative data
         signals across four CSVs.
"""

import os
import string
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# ─── Configuration ───────────────────────────────────────────────────────────
NUM_COMPANIES = 10_000
NUM_GST_MONTHS = 6
SEED = 42
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "datasets")

np.random.seed(SEED)

INDUSTRY_CODES = {
    "manufacturing": 5065,
    "trading": 5045,
    "services": 7372
}

CITY_NAMES = [
    "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad",
    "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane",
    "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara"
]

COMPANY_NAME_PREFIXES = [
    "Bharat", "Desi", "Swadeshi", "Jai", "Sri", "Shri", "Namo", "Dhanush",
    "Annapurna", "Garuda", "Veda", "Kisan", "Shakti", "Pragati", "Unnati",
]

COMPANY_NAME_SUFFIXES = [
    "Enterprises", "Industries", "Solutions", "Trading Co", "Exports",
    "Impex", "Manufacturers", "Tech", "Agro", "Foods", "Textiles",
]

UPI_HANDLES = [
    "@okaxis", "@oksbi", "@okicici", "@okhdfcbank", "@okkotak",
    "@ybl", "@paytm", "@apl", "@ibl", "@axl",
]

MCC_CODES = [
    "5411", "5812", "5541", "5942", "5311", "5651", "7011",
    "4814", "5944", "5999", "5200", "5251", "5733", "5912",
]

HSN_CODES = [
    "84", "85", "39", "72", "73", "87", "90", "48", "94", "62",
]


def _generate_pan_body() -> str:
    letters = "".join(np.random.choice(list(string.ascii_uppercase), size=5))
    digits = "".join(np.random.choice(list(string.digits), size=4))
    last = np.random.choice(list(string.ascii_uppercase))
    return f"{letters}{digits}{last}"


def _generate_gstin(pan_body: str) -> str:
    state_code = np.random.choice([f"{i:02d}" for i in range(1, 38)])
    entity_code = np.random.choice(list("123456789"))
    check_char = np.random.choice(list(string.ascii_uppercase + string.digits))
    return f"{state_code}{pan_body}{entity_code}Z{check_char}"


def _generate_company_name(idx: int) -> str:
    prefix = COMPANY_NAME_PREFIXES[idx % len(COMPANY_NAME_PREFIXES)]
    suffix = COMPANY_NAME_SUFFIXES[idx % len(COMPANY_NAME_SUFFIXES)]
    unique_id = idx // (len(COMPANY_NAME_PREFIXES) * len(COMPANY_NAME_SUFFIXES)) + 1
    if unique_id > 1:
        return f"{prefix} {suffix} {unique_id}"
    return f"{prefix} {suffix}"


def _generate_vpa(name_hint: str, idx: int) -> str:
    clean = name_hint.lower().replace(" ", "").replace(".", "")[:12]
    handle = UPI_HANDLES[idx % len(UPI_HANDLES)]
    return f"{clean}{idx % 1000}{handle}"


def _generate_pincode() -> str:
    first_digit = np.random.choice(list("12345678"))
    rest_digits = "".join(np.random.choice(list(string.digits), size=5))
    return f"{first_digit}{rest_digits}"


def generate_master() -> pd.DataFrame:
    records = []
    for i in range(NUM_COMPANIES):
        pan_body = _generate_pan_body()
        gstin = _generate_gstin(pan_body)
        entity_id = gstin  # entity_id matches gstin format
        name = _generate_company_name(i)
        
        industry_type = np.random.choice(list(INDUSTRY_CODES.keys()), p=[0.35, 0.40, 0.25])
        industry_code = INDUSTRY_CODES[industry_type]

        vintage_months = int(np.random.randint(1, 25))

        raw_beta = np.random.beta(5, 5)
        bureau_score_cibil = int(np.clip(300 + raw_beta * 450, 300, 750))

        base_risk = {"manufacturing": 0.4, "trading": 0.5, "services": 0.35}
        industry_risk_factor = round(
            np.clip(base_risk[industry_type] + np.random.normal(0, 0.15), 0.1, 0.9), 3
        )
        
        credit_limit_requested = round(np.random.uniform(1_00_000, 50_00_000), 2)

        records.append({
            "entity_id": entity_id,
            "name": name,
            "gstin": gstin,
            "industry_code": industry_code,
            "vintage_months": vintage_months,
            "bureau_score_cibil": bureau_score_cibil,
            "credit_limit_requested": credit_limit_requested,
            "industry_risk_factor": industry_risk_factor,  # Kept as required feature
        })

    return pd.DataFrame(records)


def _assign_size_class(n: int) -> np.ndarray:
    return np.random.choice(["micro", "small", "medium"], size=n, p=[0.60, 0.30, 0.10])


def _monthly_turnover(size_class: str) -> float:
    if size_class == "micro":
        return np.random.uniform(50_000, 5_00_000)
    elif size_class == "small":
        return np.random.uniform(5_00_000, 50_00_000)
    else:
        return np.random.uniform(50_00_000, 5_00_00_000)


def generate_gst_history(master_df: pd.DataFrame, size_classes: np.ndarray) -> pd.DataFrame:
    records = []
    base_date = datetime(2026, 4, 1)
    
    return_periods = []
    for m in range(NUM_GST_MONTHS):
        dt = base_date - timedelta(days=30 * (NUM_GST_MONTHS - m))
        return_periods.append(dt)

    for idx, row in master_df.iterrows():
        size_class = size_classes[idx]
        on_time_propensity = np.clip((row["bureau_score_cibil"] - 300) / 450 + np.random.normal(0, 0.1), 0.1, 0.95)

        for rp_dt in return_periods:
            tax_period = rp_dt.strftime("%m%Y")
            turnover = _monthly_turnover(size_class)
            
            # GSTR1 and GSTR3B each separate row
            for return_type in ["GSTR1", "GSTR3B"]:
                is_on_time = np.random.random() < on_time_propensity
                
                # Assume due date is 15th (GSTR1) or 20th (GSTR3B) of following month
                due_day = 15 if return_type == "GSTR1" else 20
                due_date_dt = (rp_dt.replace(day=1) + timedelta(days=32)).replace(day=due_day)
                due_date = due_date_dt.strftime("%Y-%m-%d")

                if is_on_time:
                    delay_days = 0
                    filing_date = (due_date_dt - timedelta(days=np.random.randint(1, 5))).strftime("%Y-%m-%d")
                else:
                    delay_days = max(1, int(np.random.poisson(8)))
                    filing_date = (due_date_dt + timedelta(days=delay_days)).strftime("%Y-%m-%d")
                
                # Create corresponding new columns
                total_sales_declared = round(turnover, 2)
                tax_paid_total = round(total_sales_declared * np.random.uniform(0.05, 0.18), 2)
                
                # ITC ratio varies, on time filers utilize higher ITC
                itc_ratio = np.random.uniform(0.6, 0.9) if is_on_time else np.random.uniform(0.1, 0.5)
                tax_paid_itc = round(tax_paid_total * itc_ratio, 2)
                tax_paid_cash = round(tax_paid_total - tax_paid_itc, 2)

                records.append({
                    "return_type": return_type,
                    "entity_id": row["entity_id"],
                    "tax_period": tax_period,
                    "filing_date": filing_date,
                    "due_date": due_date,
                    "delay_days": delay_days,
                    "total_sales_declared": total_sales_declared,
                    "tax_paid_cash": tax_paid_cash,
                    "tax_paid_itc": tax_paid_itc
                })

    return pd.DataFrame(records)


def generate_upi_stream(master_df: pd.DataFrame, size_classes: np.ndarray) -> pd.DataFrame:
    records = []
    base_date = datetime(2026, 4, 1)
    tx_id_counter = 0

    avg_tx_per_month = {"micro": 10, "small": 30, "medium": 70}

    for idx, row in master_df.iterrows():
        size_class = size_classes[idx]
        company_city = np.random.choice(CITY_NAMES)
        monthly_avg = avg_tx_per_month[size_class]
        
        score_boost = (row["bureau_score_cibil"] - 525) / 225
        monthly_avg = max(3, int(monthly_avg * (1 + 0.2 * score_boost)))

        turnover = _monthly_turnover(size_class)
        seen_counterparties = set()

        for month_offset in range(NUM_GST_MONTHS):
            month_start = base_date - timedelta(days=30 * (NUM_GST_MONTHS - month_offset))
            num_tx = max(1, int(np.random.poisson(monthly_avg)))

            for _ in range(num_tx):
                tx_id_counter += 1
                txn_id = f"TXN{tx_id_counter:012d}"

                day_offset = np.random.randint(0, 28)
                ts = month_start + timedelta(
                    days=day_offset, hours=np.random.randint(6, 23),
                    minutes=np.random.randint(0, 60), seconds=np.random.randint(0, 60)
                )

                txn_type = np.random.choice(["CREDIT", "DEBIT"], p=[0.7, 0.3])
                
                counterparty_idx = np.random.randint(0, NUM_COMPANIES)
                counterparty_name = _generate_company_name(counterparty_idx)
                counterparty_vpa = _generate_vpa(counterparty_name, counterparty_idx + 50000)
                
                is_repeated_counterparty = counterparty_vpa in seen_counterparties
                seen_counterparties.add(counterparty_vpa)

                # Geo-location
                geo_location = company_city if np.random.random() < 0.6 else np.random.choice(CITY_NAMES)

                avg_tx_amount = turnover / max(monthly_avg, 1)
                amount_inr = round(max(10, np.random.lognormal(np.log(avg_tx_amount), 0.8)), 2)
                counterparty_mcc = np.random.choice(MCC_CODES)

                records.append({
                    "entity_id": row["entity_id"],
                    "txn_id": txn_id,
                    "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                    "amount_inr": amount_inr,
                    "txn_type": txn_type,
                    "counterparty_vpa": counterparty_vpa,
                    "counterparty_mcc": counterparty_mcc,
                    "geo_location": geo_location,
                    "is_repeated_counterparty": is_repeated_counterparty
                })

    return pd.DataFrame(records)


def generate_eway_bills(master_df: pd.DataFrame, size_classes: np.ndarray, upi_df: pd.DataFrame) -> pd.DataFrame:
    records = []
    base_date = datetime(2026, 4, 1)
    bill_counter = 0
    
    # Store Txn IDs to randomly link
    entity_txns = {}
    for entity_id, group in upi_df.groupby("entity_id"):
        entity_txns[entity_id] = group["txn_id"].tolist()

    for idx, row in master_df.iterrows():
        size_class = size_classes[idx]
        entity_id = row["entity_id"]
        monthly_avg = {"micro": 3, "small": 6, "medium": 15}[size_class]
        turnover = _monthly_turnover(size_class)

        for month_offset in range(NUM_GST_MONTHS):
            month_start = base_date - timedelta(days=30 * (NUM_GST_MONTHS - month_offset))
            num_bills = max(1, int(np.random.poisson(monthly_avg)))

            for _ in range(num_bills):
                bill_counter += 1
                eway_bill_no = f"EWB{bill_counter:012d}"

                day_offset = np.random.randint(0, 28)
                generation_date = month_start + timedelta(days=day_offset)
                valid_until = generation_date + timedelta(days=np.random.randint(1, 10))
                
                origin_pincode = _generate_pincode()
                dest_pincode = _generate_pincode()

                invoice_value_inr = round(max(500, turnover / max(monthly_avg, 1) * np.random.lognormal(0, 0.5)), 2)
                hsn_code = np.random.choice(HSN_CODES)
                vehicle_no = f"MH{np.random.randint(10, 50)}AB{np.random.randint(1000, 9999)}"

                # Linking UPI Txn ID (~40%)
                linked_upi_txn_id = None
                if entity_id in entity_txns and np.random.random() < 0.4 and len(entity_txns[entity_id]) > 0:
                    linked_upi_txn_id = np.random.choice(entity_txns[entity_id])

                # Anomaly (~10%)
                is_anomaly = np.random.random() < 0.1

                records.append({
                    "eway_bill_no": eway_bill_no,
                    "generation_date": generation_date.strftime("%Y-%m-%d"),
                    "valid_until": valid_until.strftime("%Y-%m-%d"),
                    "origin_pincode": origin_pincode,
                    "dest_pincode": dest_pincode,
                    "hsn_code": hsn_code,
                    "invoice_value_inr": invoice_value_inr,
                    "vehicle_no": vehicle_no,
                    "entity_id": entity_id,
                    "linked_upi_txn_id": linked_upi_txn_id,
                    "is_anomaly": is_anomaly
                })

    return pd.DataFrame(records)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("=" * 60)
    print("Refactored MSME Synthetic Data Generator")
    print("=" * 60)

    print("\n[1/4] Generating msme_master.csv ...")
    master_df = generate_master()
    
    size_classes = _assign_size_class(NUM_COMPANIES)

    print("[2/4] Generating gst_history.csv ...")
    gst_df = generate_gst_history(master_df, size_classes)

    print("[3/4] Generating upi_stream.csv ...")
    upi_df = generate_upi_stream(master_df, size_classes)

    print("[4/4] Generating eway_bill_stream.csv ...")
    eway_df = generate_eway_bills(master_df, size_classes, upi_df)

    master_df.to_csv(os.path.join(OUTPUT_DIR, "msme_master.csv"), index=False)
    gst_df.to_csv(os.path.join(OUTPUT_DIR, "gst_history.csv"), index=False)
    upi_df.to_csv(os.path.join(OUTPUT_DIR, "upi_stream.csv"), index=False)
    eway_df.to_csv(os.path.join(OUTPUT_DIR, "eway_bill_stream.csv"), index=False)

    print("\n" + "=" * 60)
    print("Datasets Generation Complete")


if __name__ == "__main__":
    main()
