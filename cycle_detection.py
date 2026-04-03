import networkx as nx
import numpy as np
import json

from csv_to_graph import process_upi_data

print("Initiating Banking Fraud Detection Pipeline\n")

aggregated_edges = process_upi_data("upi_transactions.csv")

print("PHASE 2: Graph Analysis Module Triggered")

G = nx.from_pandas_edgelist(
    aggregated_edges,
    source='source',
    target='target',
    edge_attr='weight',
    create_using=nx.DiGraph()
)

print(f"Graph active with {G.number_of_nodes()} MSME Nodes and {G.number_of_edges()} Edges.")

print("Scanning for Accommodation Bill Rings (Max depth: 5 nodes)...")


try:
    all_bounded_cycles = list(nx.simple_cycles(G, length_bound=5))
    

    potential_rings = [cycle for cycle in all_bounded_cycles if len(cycle) > 2]
    
except TypeError:
    print("Please run: pip install --upgrade networkx")
    print("Your version of NetworkX is too old to use length_bound. Please update it to avoid hanging.")
    exit()

print(f"Found {len(potential_rings)} potential loops of size 3-5. Running Variance Check...")

confirmed_fraud_rings = []

for ring in potential_rings:
    edge_weights = []
    
    for i in range(len(ring)):
        source_node = ring[i]
        target_node = ring[(i + 1) % len(ring)] 
        weight = G[source_node][target_node]['weight']
        edge_weights.append(weight)
        
    mean_weight = np.mean(edge_weights)
    std_dev = np.std(edge_weights)
    cov = std_dev / mean_weight if mean_weight > 0 else 1

    if cov < 0.05:
        confirmed_fraud_rings.append({
            "nodes_involved": ring,
            "average_rotated_amount": round(mean_weight, 2),
            "variance_score": round(cov, 4)
        })

if confirmed_fraud_rings:
    print(f"\nALERT: {len(confirmed_fraud_rings)} Accommodation Bill Ring(s) Detected!\n")
    
    primary_ring = confirmed_fraud_rings[0]['nodes_involved']
    edges_for_ui = []
    
    for i in range(len(primary_ring)):
        src = primary_ring[i]
        tgt = primary_ring[(i + 1) % len(primary_ring)]
        edges_for_ui.append({
            "source": src,
            "target": tgt,
            "volume": G[src][tgt]['weight']
        })
        
    api_payload = {
        "cycles_detected": True,
        "cycle_count": len(confirmed_fraud_rings),
        "nodes_involved": primary_ring,
        "edges": edges_for_ui,
        "flag_type": "Accommodation Bill Ring (Turnover Inflation)"
    }
    
    print(json.dumps(api_payload, indent=4))
    
else:
    print("\nNo fraudulent Accommodation Bill rings detected in this window.")