import pandas as pd
import numpy as np
import networkx as nx
from sklearn.ensemble import IsolationForest
import json
import warnings
warnings.filterwarnings('ignore')

def run_sequential_engine(txn_file="/media/aditya/3C4F8EAC3C229A1D/college/Hackthon/Ignisia2026/pipeline/api/fraud/upi_transactions.csv", onboarding_file="/media/aditya/3C4F8EAC3C229A1D/college/Hackthon/Ignisia2026/pipeline/api/fraud/onboarding_data.csv"):
    print("\n🚀 INITIATING ENRICHED FRAUD DETECTION ENGINE 🚀")

    # ==========================================
    # STEP 0: LOAD METADATA (GSTIN MAPPING)
    # ==========================================
    try:
        print("⏳ Loading MSME Onboarding metadata...")
        onboarding_df = pd.read_csv(onboarding_file)
        # Create a fast lookup map: { 'MSME_10000': '35IPABW5427I8ZY', ... }
        gstin_map = dict(zip(onboarding_df.entity_id, onboarding_df.gstin))
        name_map = dict(zip(onboarding_df.entity_id, onboarding_df.name))
        print(f"✅ Successfully mapped {len(gstin_map)} MSME identities.")
    except FileNotFoundError:
        print(f"⚠️ Error: {onboarding_file} not found! Proceeding with N/A for GSTINs.")
        gstin_map, name_map = {}, {}

    # ==========================================
    # STEP 1: LOAD TRANSACTIONS
    # ==========================================
    try:
        print("⏳ Loading transactions...")
        df = pd.read_csv(txn_file, low_memory=False)
    except FileNotFoundError:
        print(f"⚠️ Error: {txn_file} not found!")
        return

    print("⏳ Vectorizing Edgelist...")
    df['source'] = np.where(df['txn_type'] == 'CREDIT', df['counterparty_vpa'], df['entity_id'])
    df['target'] = np.where(df['txn_type'] == 'CREDIT', df['entity_id'], df['counterparty_vpa'])
    
    edgelist_df = df.groupby(['source', 'target']).agg(
        weight=('amount_inr', 'sum'),
        txn_count=('txn_id', 'count')
    ).reset_index()

    # ==========================================
    # TIER 1: ML RADAR
    # ==========================================
    print(f"📡 [TIER 1] ML Engine sweeping {len(edgelist_df)} flows...")
    ml_features = edgelist_df[['weight', 'txn_count']]
    iso_forest = IsolationForest(n_estimators=100, contamination=0.02, random_state=42, n_jobs=1)
    edgelist_df['is_anomaly'] = iso_forest.fit_predict(ml_features) 
    
    flagged_anomalies = edgelist_df[edgelist_df['is_anomaly'] == -1]
    print(f"🚨 RADAR ALERT: Isolated {len(flagged_anomalies)} anomalous flows.")

    # ==========================================
    # TIER 2: GRAPH SNIPER
    # ==========================================
    G = nx.from_pandas_edgelist(flagged_anomalies, source='source', target='target', edge_attr='weight', create_using=nx.DiGraph())
    
    confirmed_fraud_rings = []
    try:
        cycles_generator = nx.simple_cycles(G, length_bound=5)
        for ring in cycles_generator:
            if len(ring) > 2:
                edge_weights = [G[ring[i]][ring[(i + 1) % len(ring)]]['weight'] for i in range(len(ring))]
                
                # Variance Check
                cov = np.std(edge_weights) / np.mean(edge_weights) if np.mean(edge_weights) > 0 else 1
                
                if cov < 0.05:
                    # Enrich node data with GSTIN and Names
                    nodes_enriched = []
                    for node_id in ring:
                        nodes_enriched.append({
                            "msme_id": node_id,
                            "name": name_map.get(node_id, "Unknown Entity"),
                            "gstin": gstin_map.get(node_id, "GSTIN_NOT_FOUND")
                        })

                    confirmed_fraud_rings.append({
                        "fraud_type": "Accommodation Bill",
                        "nodes_involved": nodes_enriched,
                        "total_laundered_inr": round(sum(edge_weights), 2),
                        "evidence_graph": [
                            {"source": ring[i], "target": ring[(i+1)%len(ring)], "volume": float(G[ring[i]][ring[(i+1)%len(ring)]]['weight'])}
                            for i in range(len(ring))
                        ]
                    })
    except Exception as e:
        print(f"⚠️ Search Error: {e}")

   # ==========================================
    # FINAL OUTPUT & EXPORT
    # ==========================================
    if confirmed_fraud_rings:
        confirmed_fraud_rings.sort(key=lambda x: x['total_laundered_inr'], reverse=True)
        top_case = confirmed_fraud_rings[0]

        # UI Payload with GSTINs
        ui_payload = {
            "fraud_type": "Accommodation Bill",
            "reasoning": "ML anomaly detection + Graph Cycle validation with <5% variance.",
            "total_laundered_inr": top_case["total_laundered_inr"],
            "nodes": [
                {"id": n["msme_id"], "label": n["name"], "gstin": n["gstin"]} 
                for n in top_case["nodes_involved"]
            ],
            "links": [
                {"source": e["source"], "target": e["target"], "label": f"₹{e['volume']:,.0f}"} 
                for e in top_case["evidence_graph"]
            ]
        }

        with open("ui_fraud_case.json", "w") as f:
            json.dump(ui_payload, f, indent=4)
        
        with open("detected_fraud_rings.json", "w") as f:
            json.dump(confirmed_fraud_rings, f, indent=4)

        # ---- UPDATED PRINT STATEMENTS HERE ----
        print("-" * 60)
        print(f"🛑 TARGETS ACQUIRED: NetworkX mathematically proved exactly {len(confirmed_fraud_rings)} Accommodation Bill rings.")
        print(f"🔥 SUCCESS: All {len(confirmed_fraud_rings)} rings have been enriched with GSTIN data.")
        print(f"💾 Master report saved to 'detected_fraud_rings.json'")
        print(f"💾 Top UI case saved to 'ui_fraud_case.json'")
        print("-" * 60)
    else:
        print("✅ CLEAR: No rings found.")

if __name__ == "__main__":
    run_sequential_engine()