import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

DATASET_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "datasets")


HERO_ID = "29HERO9999X1Z5"
GHOST_ID = "27GHOST4444Y2Z1"
LAUNDERER_ID = "07FRAUD1111Z9Z9"
NODE_B_ID = "07NODEB2222A1Z1"
NODE_C_ID = "07NODEC3333B1Z2"
NODE_D_ID = "07NODED4444C1Z3"

BASE_DATE = datetime(2026, 4, 1)

def _return_periods(n_months: int = 6) -> list:
    periods = []
    for m in range(n_months):
        dt = BASE_DATE - timedelta(days=30 * (n_months - m))
        periods.append(dt)
    return periods

def _return_periods_12(n_months: int = 12) -> list:
    periods = []
    for m in range(n_months):
        dt = BASE_DATE - timedelta(days=30 * (n_months - m))
        periods.append(dt)
    return periods


def inject_hero_master(master_df: pd.DataFrame) -> pd.DataFrame:
    hero_row = {
        "entity_id": HERO_ID,
        "name": "Hero Manufacturing Pvt Ltd",
        "gstin": HERO_ID,
        "industry_code": 5065,
        "vintage_months": 14,
        "bureau_score_cibil": 620,
        "credit_limit_requested": 40_000_00.0,
        "industry_risk_factor": 0.30,
    }
    master_df = master_df[master_df["entity_id"] != HERO_ID]
    master_df = pd.concat([master_df, pd.DataFrame([hero_row])], ignore_index=True)
    return master_df

def inject_hero_gst(gst_df: pd.DataFrame) -> pd.DataFrame:
    gst_df = gst_df[gst_df["entity_id"] != HERO_ID]
    periods = _return_periods_12(12)
    rows = []
    for rp_dt in periods:
        tax_period = rp_dt.strftime("%m%Y")
        for return_type in ["GSTR1", "GSTR3B"]:
            due_day = 15 if return_type == "GSTR1" else 20
            due_date_dt = (rp_dt.replace(day=1) + timedelta(days=32)).replace(day=due_day)
            due_date = due_date_dt.strftime("%Y-%m-%d")
            

            filing_date = (due_date_dt - timedelta(days=2)).strftime("%Y-%m-%d")
            
            sales_declared = round(np.random.uniform(15_00_000, 20_00_000), 2)
            tax_total = round(np.random.uniform(2_50_000, 4_00_000), 2)
            itc_ratio = np.random.uniform(0.7, 0.95)
            tax_paid_itc = round(tax_total * itc_ratio, 2)
            tax_paid_cash = round(tax_total - tax_paid_itc, 2)
            
            rows.append({
                "return_type": return_type,
                "entity_id": HERO_ID,
                "tax_period": tax_period,
                "filing_date": filing_date,
                "due_date": due_date,
                "delay_days": 0,
                "total_sales_declared": sales_declared,
                "tax_paid_cash": tax_paid_cash,
                "tax_paid_itc": tax_paid_itc,
            })
    gst_df = pd.concat([gst_df, pd.DataFrame(rows)], ignore_index=True)
    return gst_df

def inject_hero_upi(upi_df: pd.DataFrame) -> pd.DataFrame:
    upi_df = upi_df[upi_df["entity_id"] != HERO_ID]
    rows = []
    tx_counter = 900_000_000

    counterparty_vpas = [f"supplier{i}@okaxis" for i in range(15)] + \
                        [f"customer{i}@oksbi" for i in range(15)]
    
    seen_vp = set()

    for month_offset in range(6):
        month_start = BASE_DATE - timedelta(days=30 * (6 - month_offset))
        for day in range(28):
            current_date = month_start + timedelta(days=day)
            num_tx = np.random.randint(40, 50)  # ~45/day
            for _ in range(num_tx):
                tx_counter += 1
                cp_vpa = np.random.choice(counterparty_vpas)
                is_repeated = cp_vpa in seen_vp
                seen_vp.add(cp_vpa)

                txn_type = "CREDIT" if np.random.random() < 0.75 else "DEBIT"

                ts = current_date + timedelta(hours=np.random.randint(8, 21), minutes=np.random.randint(0, 60))

                rows.append({
                    "entity_id": HERO_ID,
                    "txn_id": f"TXN{tx_counter:012d}",
                    "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                    "amount_inr": round(np.random.uniform(5000, 50000), 2),
                    "txn_type": txn_type,
                    "counterparty_vpa": cp_vpa,
                    "counterparty_mcc": np.random.choice(["5411", "5812", "5200"]),
                    "geo_location": "Bengaluru",
                    "is_repeated_counterparty": is_repeated
                })

    upi_df = pd.concat([upi_df, pd.DataFrame(rows)], ignore_index=True)
    return upi_df

def inject_hero_eway(eway_df: pd.DataFrame) -> pd.DataFrame:
    eway_df = eway_df[eway_df["entity_id"] != HERO_ID]
    rows = []
    bill_counter = 800_000_000

    for month_offset in range(6):
        month_start = BASE_DATE - timedelta(days=30 * (6 - month_offset))
        num_bills = [8, 12, 16, 20, 25, 32][month_offset]

        for i in range(num_bills):
            bill_counter += 1
            generation_date = month_start + timedelta(days=np.random.randint(0, 28))
            
            rows.append({
                "eway_bill_no": f"EWB{bill_counter:012d}",
                "generation_date": generation_date.strftime("%Y-%m-%d"),
                "valid_until": (generation_date + timedelta(days=5)).strftime("%Y-%m-%d"),
                "origin_pincode": "560001",
                "dest_pincode": np.random.choice(["400001", "110001", "600001"]),
                "hsn_code": "84",
                "invoice_value_inr": round(np.random.uniform(2_00_000, 8_00_000), 2),
                "vehicle_no": f"KA01AB{np.random.randint(1000, 9999)}",
                "entity_id": HERO_ID,
                "linked_upi_txn_id": None,
                "is_anomaly": False
            })

    eway_df = pd.concat([eway_df, pd.DataFrame(rows)], ignore_index=True)
    return eway_df

def inject_ghost_master(master_df: pd.DataFrame) -> pd.DataFrame:
    ghost_row = {
        "entity_id": GHOST_ID,
        "name": "Ghost Trading Enterprises",
        "gstin": GHOST_ID,
        "industry_code": 5045,
        "vintage_months": 18,
        "bureau_score_cibil": 710,
        "credit_limit_requested": 15_00_000.0,
        "industry_risk_factor": 0.45,
    }
    master_df = master_df[master_df["entity_id"] != GHOST_ID]
    master_df = pd.concat([master_df, pd.DataFrame([ghost_row])], ignore_index=True)
    return master_df


def inject_ghost_gst(gst_df: pd.DataFrame) -> pd.DataFrame:
    gst_df = gst_df[gst_df["entity_id"] != GHOST_ID]
    periods = _return_periods(6)
    rows = []

    for i, rp_dt in enumerate(periods):
        tax_period = rp_dt.strftime("%m%Y")
        for return_type in ["GSTR1", "GSTR3B"]:
            due_day = 15 if return_type == "GSTR1" else 20
            due_date_dt = (rp_dt.replace(day=1) + timedelta(days=32)).replace(day=due_day)
            due_date = due_date_dt.strftime("%Y-%m-%d")

            if i < 5:
                delay_days = 0
                filing_date = (due_date_dt - timedelta(days=1)).strftime("%Y-%m-%d")
                sales = round(np.random.uniform(8_00_000, 12_00_000), 2)
                tax_total = round(np.random.uniform(1_50_000, 2_50_000), 2)
                itc_ratio = 0.8
            else:
                delay_days = 45
                filing_date = (due_date_dt + timedelta(days=45)).strftime("%Y-%m-%d")
                sales = round(np.random.uniform(50_000, 1_00_000), 2)
                tax_total = round(np.random.uniform(10_000, 20_000), 2)
                itc_ratio = 0.2
            
            tax_itc = round(tax_total * itc_ratio, 2)
            tax_cash = round(tax_total - tax_itc, 2)

            rows.append({
                "return_type": return_type,
                "entity_id": GHOST_ID,
                "tax_period": tax_period,
                "filing_date": filing_date,
                "due_date": due_date,
                "delay_days": delay_days,
                "total_sales_declared": sales,
                "tax_paid_cash": tax_cash,
                "tax_paid_itc": tax_itc,
            })

    gst_df = pd.concat([gst_df, pd.DataFrame(rows)], ignore_index=True)
    return gst_df


def inject_ghost_upi(upi_df: pd.DataFrame) -> pd.DataFrame:
    upi_df = upi_df[upi_df["entity_id"] != GHOST_ID]
    rows = []
    tx_counter = 800_000_000

    seen_vp = set()
    counterparty_vpas = [f"gclient{i}@okaxis" for i in range(20)]

    for month_offset in range(6):
        month_start = BASE_DATE - timedelta(days=30 * (6 - month_offset))

        if month_offset < 5:
            num_tx = np.random.randint(25, 35)  
        else:
            num_tx = np.random.randint(8, 12)

        for _ in range(num_tx):
            tx_counter += 1
            cp_vpa = np.random.choice(counterparty_vpas)

            is_repeat = cp_vpa in seen_vp
            seen_vp.add(cp_vpa)

            txn_type = "CREDIT" if np.random.random() < 0.7 else "DEBIT"
            ts = month_start + timedelta(days=np.random.randint(0, 28), hours=np.random.randint(8, 20))

            if month_offset < 5:
                amount = round(np.random.uniform(10_000, 80_000), 2)
            else:
                amount = round(np.random.uniform(2_000, 20_000), 2)

            rows.append({
                "entity_id": GHOST_ID,
                "txn_id": f"TXN{tx_counter:012d}",
                "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                "amount_inr": amount,
                "txn_type": txn_type,
                "counterparty_vpa": cp_vpa,
                "counterparty_mcc": "5411",
                "geo_location": "Mumbai",
                "is_repeated_counterparty": is_repeat
            })

    upi_df = pd.concat([upi_df, pd.DataFrame(rows)], ignore_index=True)
    return upi_df


def inject_ghost_eway(eway_df: pd.DataFrame) -> pd.DataFrame:
    eway_df = eway_df[eway_df["entity_id"] != GHOST_ID]
    rows = []
    bill_counter = 700_000_000

    for month_offset in range(6):
        month_start = BASE_DATE - timedelta(days=30 * (6 - month_offset))

        if month_offset < 5:
            num_bills = np.random.randint(8, 14)
        else:
            num_bills = max(1, int(10 * 0.15))

        for _ in range(num_bills):
            bill_counter += 1
            generation_date = month_start + timedelta(days=np.random.randint(0, 28))

            rows.append({
                "eway_bill_no": f"EWB{bill_counter:012d}",
                "generation_date": generation_date.strftime("%Y-%m-%d"),
                "valid_until": (generation_date + timedelta(days=5)).strftime("%Y-%m-%d"),
                "origin_pincode": "400001",
                "dest_pincode": "411001",
                "hsn_code": "39",
                "invoice_value_inr": round(np.random.uniform(1_00_000, 5_00_000), 2),
                "vehicle_no": f"MH01AB{np.random.randint(1000, 9999)}",
                "entity_id": GHOST_ID,
                "linked_upi_txn_id": None,
                "is_anomaly": month_offset >= 5 
            })

    eway_df = pd.concat([eway_df, pd.DataFrame(rows)], ignore_index=True)
    return eway_df



def inject_launderer_master(master_df: pd.DataFrame) -> pd.DataFrame:
    ring_nodes = [
        {
            "entity_id": LAUNDERER_ID,
            "name": "Fraud Shell Corp",
            "gstin": LAUNDERER_ID,
            "industry_code": 7372,
            "vintage_months": 8,
            "bureau_score_cibil": 580,
            "credit_limit_requested": 1_00_00_000.0,
            "industry_risk_factor": 0.75,
        },
        {
            "entity_id": NODE_B_ID,
            "name": "Node B Trading",
            "gstin": NODE_B_ID,
            "industry_code": 5045,
            "vintage_months": 8,
            "bureau_score_cibil": 580,
            "credit_limit_requested": 5_00_000.0,
            "industry_risk_factor": 0.80,
        },
        {
            "entity_id": NODE_C_ID,
            "name": "Node C Exports",
            "gstin": NODE_C_ID,
            "industry_code": 5045,
            "vintage_months": 8,
            "bureau_score_cibil": 580,
            "credit_limit_requested": 5_00_000.0,
            "industry_risk_factor": 0.82,
        },
        {
            "entity_id": NODE_D_ID,
            "name": "Node D Services",
            "gstin": NODE_D_ID,
            "industry_code": 7372,
            "vintage_months": 8,
            "bureau_score_cibil": 580,
            "credit_limit_requested": 5_00_000.0,
            "industry_risk_factor": 0.78,
        },
    ]

    for node_id in [LAUNDERER_ID, NODE_B_ID, NODE_C_ID, NODE_D_ID]:
        master_df = master_df[master_df["entity_id"] != node_id]

    master_df = pd.concat([master_df, pd.DataFrame(ring_nodes)], ignore_index=True)
    return master_df


def inject_launderer_upi(upi_df: pd.DataFrame) -> pd.DataFrame:
    ring_ids = [LAUNDERER_ID, NODE_B_ID, NODE_C_ID, NODE_D_ID]
    upi_df = upi_df[~upi_df["entity_id"].isin(ring_ids)]

    vpas = {
        LAUNDERER_ID: "fraudshellcorp@okaxis",
        NODE_B_ID: "nodebtrading@oksbi",
        NODE_C_ID: "nodecexports@ybl",
        NODE_D_ID: "nodedservices@paytm",
    }

    ring_date = BASE_DATE - timedelta(days=15)
    ring_rows = []

    transfers = [
        (LAUNDERER_ID, NODE_B_ID),
        (NODE_B_ID, NODE_C_ID),
        (NODE_C_ID, NODE_D_ID),
        (NODE_D_ID, LAUNDERER_ID),
    ]

    for i, (sender, receiver) in enumerate(transfers):
        ts = ring_date + timedelta(hours=2 * i + 1)
        
        ring_rows.append({
            "entity_id": sender,
            "txn_id": f"TXNRING{i+1:08d}",
            "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
            "amount_inr": 500000.00,
            "txn_type": "DEBIT",
            "counterparty_vpa": vpas[receiver],
            "counterparty_mcc": "5999",
            "geo_location": "Delhi",
            "is_repeated_counterparty": False,
        })
        
        # Receiver CREDIT row
        ring_rows.append({
            "entity_id": receiver,
            "txn_id": f"TXNRING{i+1:08d}",
            "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
            "amount_inr": 500000.00,
            "txn_type": "CREDIT",
            "counterparty_vpa": vpas[sender],
            "counterparty_mcc": "5999",
            "geo_location": "Delhi",
            "is_repeated_counterparty": False,
        })

    tx_counter = 950_000_000
    for month_offset in range(6):
        month_start = BASE_DATE - timedelta(days=30 * (6 - month_offset))
        for _ in range(5):
            tx_counter += 1
            ts = month_start + timedelta(days=np.random.randint(0, 28), hours=np.random.randint(8, 20))
            amount = round(np.random.uniform(10_000, 30_000), 2)
            cp_vpa = f"randomcp{np.random.randint(0, 100)}@okaxis"

            ring_rows.append({
                "entity_id": LAUNDERER_ID,
                "txn_id": f"TXN{tx_counter:012d}",
                "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                "amount_inr": amount,
                "txn_type": "CREDIT",
                "counterparty_vpa": cp_vpa,
                "counterparty_mcc": "5999",
                "geo_location": "Delhi",
                "is_repeated_counterparty": False
            })
            tx_counter += 1
            ring_rows.append({
                "entity_id": LAUNDERER_ID,
                "txn_id": f"TXN{tx_counter:012d}",
                "timestamp": (ts + timedelta(minutes=30)).strftime("%Y-%m-%d %H:%M:%S"),
                "amount_inr": amount,
                "txn_type": "DEBIT",
                "counterparty_vpa": cp_vpa,
                "counterparty_mcc": "5999",
                "geo_location": "Delhi",
                "is_repeated_counterparty": True
            })

    upi_df = pd.concat([upi_df, pd.DataFrame(ring_rows)], ignore_index=True)
    return upi_df


def inject_launderer_gst(gst_df: pd.DataFrame) -> pd.DataFrame:
    ring_ids = [LAUNDERER_ID, NODE_B_ID, NODE_C_ID, NODE_D_ID]
    gst_df = gst_df[~gst_df["entity_id"].isin(ring_ids)]

    periods = _return_periods(6)
    rows = []
    for node_id in ring_ids:
        for rp_dt in periods:
            tax_period = rp_dt.strftime("%m%Y")
            for return_type in ["GSTR1", "GSTR3B"]:
                due_day = 15 if return_type == "GSTR1" else 20
                due_date_dt = (rp_dt.replace(day=1) + timedelta(days=32)).replace(day=due_day)
                due_date = due_date_dt.strftime("%Y-%m-%d")

                delay_days = int(np.random.poisson(15))
                filing_date = (due_date_dt + timedelta(days=delay_days)).strftime("%Y-%m-%d")
                
                sales = round(np.random.uniform(10_000, 50_000), 2)
                tax_total = round(np.random.uniform(2_000, 10_000), 2)
                itc_ratio = 0.5
                tax_itc = round(tax_total * itc_ratio, 2)
                tax_cash = round(tax_total - tax_itc, 2)

                rows.append({
                    "return_type": return_type,
                    "entity_id": node_id,
                    "tax_period": tax_period,
                    "filing_date": filing_date,
                    "due_date": due_date,
                    "delay_days": delay_days,
                    "total_sales_declared": sales,
                    "tax_paid_cash": tax_cash,
                    "tax_paid_itc": tax_itc,
                })

    gst_df = pd.concat([gst_df, pd.DataFrame(rows)], ignore_index=True)
    return gst_df


def inject_launderer_eway(eway_df: pd.DataFrame) -> pd.DataFrame:
    ring_ids = [LAUNDERER_ID, NODE_B_ID, NODE_C_ID, NODE_D_ID]
    eway_df = eway_df[~eway_df["entity_id"].isin(ring_ids)]

    rows = []
    bill_counter = 600_000_000
    for node_id in ring_ids:
        for month_offset in range(6):
            month_start = BASE_DATE - timedelta(days=30 * (6 - month_offset))
            num_bills = np.random.randint(0, 2)
            for _ in range(num_bills):
                bill_counter += 1
                generation_date = month_start + timedelta(days=np.random.randint(0, 28))
                rows.append({
                    "eway_bill_no": f"EWB{bill_counter:012d}",
                    "generation_date": generation_date.strftime("%Y-%m-%d"),
                    "valid_until": (generation_date + timedelta(days=3)).strftime("%Y-%m-%d"),
                    "origin_pincode": "110001",
                    "dest_pincode": "110002",
                    "hsn_code": "99",
                    "invoice_value_inr": round(np.random.uniform(5_000, 30_000), 2),
                    "vehicle_no": f"DL01AB{np.random.randint(1000, 9999)}",
                    "entity_id": node_id,
                    "linked_upi_txn_id": None,
                    "is_anomaly": True
                })

    eway_df = pd.concat([eway_df, pd.DataFrame(rows)], ignore_index=True)
    return eway_df


def main():
    print("=" * 60)
    print("MSME Persona Injector (Schema Updated)")
    print("=" * 60)

    print("\nLoading existing datasets...")
    master_df = pd.read_csv(os.path.join(DATASET_DIR, "msme_master.csv"))
    gst_df = pd.read_csv(os.path.join(DATASET_DIR, "gst_history.csv"))
    upi_df = pd.read_csv(os.path.join(DATASET_DIR, "upi_stream.csv"))
    eway_df = pd.read_csv(os.path.join(DATASET_DIR, "eway_bill_stream.csv"))

    print("\n[1/3] Injecting Hero persona (29HERO9999X1Z5)...")
    master_df = inject_hero_master(master_df)
    gst_df = inject_hero_gst(gst_df)
    upi_df = inject_hero_upi(upi_df)
    eway_df = inject_hero_eway(eway_df)

    print("[2/3] Injecting Ghost persona (27GHOST4444Y2Z1)...")
    master_df = inject_ghost_master(master_df)
    gst_df = inject_ghost_gst(gst_df)
    upi_df = inject_ghost_upi(upi_df)
    eway_df = inject_ghost_eway(eway_df)

    print("[3/3] Injecting Launderer persona (07FRAUD1111Z9Z9)...")
    master_df = inject_launderer_master(master_df)
    gst_df = inject_launderer_gst(gst_df)
    upi_df = inject_launderer_upi(upi_df)
    eway_df = inject_launderer_eway(eway_df)

    print("\nSaving updated datasets...")
    master_df.to_csv(os.path.join(DATASET_DIR, "msme_master.csv"), index=False)
    gst_df.to_csv(os.path.join(DATASET_DIR, "gst_history.csv"), index=False)
    upi_df.to_csv(os.path.join(DATASET_DIR, "upi_stream.csv"), index=False)
    eway_df.to_csv(os.path.join(DATASET_DIR, "eway_bill_stream.csv"), index=False)

    print("\n All personas injected successfully!")

if __name__ == "__main__":
    main()
