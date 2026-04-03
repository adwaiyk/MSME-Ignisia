import json
import sys
import importlib.util

MSME_API_PATH = "/media/aditya/3C4F8EAC3C229A1D/college/Hackthon/Ignisia2026/pipeline/api/pipelining/fast_api/msme_credit_api.py"
spec = importlib.util.spec_from_file_location("msme_credit_api", MSME_API_PATH)
msme_api = importlib.util.module_from_spec(spec)
spec.loader.exec_module(msme_api)

def verify_gstin(target_gstin):
    """
    Scans the mathematically proven fraud rings for a specific GSTIN.
    """
    try:
        with open("/media/aditya/3C4F8EAC3C229A1D/college/Hackthon/Ignisia2026/pipeline/api/fraud/detected_fraud_rings.json", "r") as f:
            fraud_data = json.load(f)
    except FileNotFoundError:
        print("ERROR: 'detected_fraud_rings.json' not found. Run the engine first.")
        return

    # Scan the JSON for the target GSTIN
    for ring in fraud_data:
        for node in ring["nodes_involved"]:
            # Ensure we are handling the enriched dictionary format
            if isinstance(node, dict) and node.get("gstin") == target_gstin:
                
                # If found, format a critical alert
                print("\n" + "="*60)
                print("🚨 CRITICAL FRAUD MATCH DETECTED 🚨".center(60))
                print("="*60)
                print(f"TARGET GSTIN   : {target_gstin}")
                print(f"ASSOCIATED ID  : {node.get('msme_id')}")
                print(f"ENTITY NAME    : {node.get('name')}")
                print("-" * 60)
                print(f"FRAUD TYPE     : {ring['fraud_type']}")
                print(f"RING EXPOSURE  : INR {ring['total_laundered_inr']:,.2f}")
                print(f"DETAILS        : Entity is part of a mathematically proven")
                print(f"                 circular transaction network comprising")
                print(f"                 {len(ring['nodes_involved'])} linked accounts.")
                print("="*60 + "\n")
                return

    # If the loop finishes without returning, the GSTIN is clear of graph fraud
    print("\n" + "="*60)
    print("✅ STATUS CLEAR".center(60))
    print("="*60)
    print(f"TARGET GSTIN   : {target_gstin}")
    print("DETAILS        : No circular topology or accommodation bill")
    print("                 patterns detected for this entity.")
    print("="*60 + "\n")
    result = msme_api.score_gstin(target_gstin)
    print(result)
    return result

if __name__ == "__main__":
    print("\n🔍 MSME COMPLIANCE LOOKUP TOOL 🔍")
    
    # Allow passing the GSTIN as a command line argument, or ask for input
    if len(sys.argv) > 1:
        search_query = sys.argv[1]
    else:
        search_query = input("Enter GSTIN to verify: ").strip()
        
    verify_gstin(search_query)