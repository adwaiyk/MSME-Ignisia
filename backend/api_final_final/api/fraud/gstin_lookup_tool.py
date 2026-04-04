import json
import sys
import importlib.util
from pathlib import Path


api_path = Path("Project\backend\api_final_final\api\api.py")

spec = importlib.util.spec_from_file_location("msme_api", str(api_path))
msme_api = importlib.util.module_from_spec(spec)
sys.modules["msme_api"] = msme_api
spec.loader.exec_module(msme_api)
score_gstin_combined = msme_api.score_gstin_combined

def verify_gstin(target_gstin):
    """
    Scans the mathematically proven fraud rings for a specific GSTIN.
    """
    try:
        with open("detected_fraud_rings.json", "r") as f:
            fraud_data = json.load(f)
    except FileNotFoundError:
        print("ERROR: 'detected_fraud_rings.json' not found. Run the engine first.")
        return

    
    for ring in fraud_data:
        for node in ring["nodes_involved"]:
            
            if isinstance(node, dict) and node.get("gstin") == target_gstin:
                
                
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

    print("\n" + "="*60)
    print("STATUS CLEAR".center(60))
    print("="*60)
    print(f"TARGET GSTIN   : {target_gstin}")
    print("DETAILS        : No circular topology or accommodation bill")
    print("                 patterns detected for this entity.")
    print("="*60 + "\n")

    result = score_gstin_combined(target_gstin)
    print(result)

if __name__ == "__main__":
    print("\nMSME COMPLIANCE LOOKUP TOOL 🔍")
    
    if len(sys.argv) > 1:
        search_query = sys.argv[1]
    else:
        search_query = input("Enter GSTIN to verify: ").strip()
        
    verify_gstin(search_query)
