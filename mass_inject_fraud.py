import pandas as pd
import random
from datetime import datetime, timedelta, timezone

print("Initiating Enterprise Fraud Scaler")


FILE_PATH = "upi_transactions.csv"
NUM_FRAUD_RINGS = 50          
MIN_NODES_PER_RING = 3        
MAX_NODES_PER_RING = 5        
MSME_ID_START = 10000        
MSME_ID_END = 19999           


START_DATE = datetime(2026, 4, 1, 8, 0, 0, tzinfo=timezone.utc)
END_DATE = datetime(2026, 4, 7, 18, 0, 0, tzinfo=timezone.utc)

try:
    df = pd.read_csv(FILE_PATH)
    print(f"Current organic transactions in CSV: {len(df)}")
except FileNotFoundError:
    print("upi_transactions.csv not found. Please ensure it is in the same directory.")
    exit()

mass_fraud_data = []

for ring_id in range(NUM_FRAUD_RINGS):
    
    ring_size = random.randint(MIN_NODES_PER_RING, MAX_NODES_PER_RING)
   
    launderer_ids = [f"MSME_{random.randint(MSME_ID_START, MSME_ID_END)}" for _ in range(ring_size)]

    base_amount = float(random.randint(200000, 2500000))
    
    max_offset = int((END_DATE - START_DATE).total_seconds()) - (ring_size * 3600)
    random_start_offset = random.randint(0, max_offset)
    ring_start_time = START_DATE + timedelta(seconds=random_start_offset)
    
    
    for i in range(ring_size):
        source_msme = launderer_ids[i]
       
        target_msme = launderer_ids[(i + 1) % ring_size]
        
        txn_time = ring_start_time + timedelta(hours=i)
        
        slight_variance = random.uniform(0.995, 1.005)
        final_amount = round(base_amount * slight_variance, 2)
        
        mass_fraud_data.append({
            "entity_id": source_msme,
            "txn_id": f"TXN_RING{ring_id}_{i}",
            "timestamp": txn_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "amount_inr": final_amount,
            "txn_type": "DEBIT",
            "counterparty_vpa": target_msme,
            "counterparty_mcc": "5111", 
            "geo_location": f"{round(random.uniform(18.0, 19.0), 4)},{round(random.uniform(72.0, 74.0), 4)}",
            "is_repeated_counterparty": True
        })


fraud_df = pd.DataFrame(mass_fraud_data)
df = pd.concat([df, fraud_df], ignore_index=True)
df.to_csv(FILE_PATH, index=False)

print(f"\nMASS INJECTION COMPLETE")
print(f"Injected {NUM_FRAUD_RINGS} highly camouflaged Accommodation Bill rings.")
print(f"Total fraudulent transactions added: {len(mass_fraud_data)}")
print(f" New total rows in CSV: {len(df)}")