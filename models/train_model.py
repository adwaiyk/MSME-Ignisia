"""
train_model.py
Owner: ML & Risk Architect
Purpose: Train XGBoost (with Optuna HPO) and LogisticRegression on the engineered
         feature matrix built from synthetic MSME data.
"""

import os
import sys
import warnings
import numpy as np
import pandas as pd
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from xgboost import XGBClassifier

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data-synthesis"))
import feature_engineering

warnings.filterwarnings("ignore", category=UserWarning)

# ─── Configuration ───────────────────────────────────────────────────────────
DATASET_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data-synthesis", "datasets")
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
SEED = 42
OPTUNA_TRIALS = 50

FEATURE_COLS = [
    "gst_ontime_rate",
    "gst_avg_delay",
    "sales_volume_avg",
    "itc_utilisation_ratio",
    "upi_inflow_avg",
    "upi_outflow_avg",
    "upi_net_flow_ratio",
    "upi_velocity_30d",
    "upi_counterparty_diversity",
    "geo_diversity",
    "repeated_counterparty_ratio",
    "eway_volume_avg",
    "eway_momentum",
    "eway_anomaly_rate",
    "vintage_months",
    "age_penalty",
    "industry_risk_factor",
    "bureau_score_cibil",
]

def load_datasets():
    print("Loading datasets...")
    DATASET_DIR2 = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data-synthesis", "datasets")
    master_df = pd.read_csv(os.path.join(DATASET_DIR2, "onboarding_data.csv"))
    gst_df = pd.read_csv(os.path.join(DATASET_DIR2, "gst_filings.csv"))
    upi_df = pd.read_csv(os.path.join(DATASET_DIR2, "upi_transactions.csv"))
    eway_df = pd.read_csv(os.path.join(DATASET_DIR2, "eway_bills.csv"))
    
    if "msme_id" in gst_df.columns:
        gst_df.rename(columns={"msme_id": "entity_id"}, inplace=True)
    if "industry_code" in master_df.columns and "industry_risk_factor" not in master_df.columns:
        master_df["industry_risk_factor"] = 0.5
    if "is_anomaly" not in eway_df.columns:
        eway_df["is_anomaly"] = 0

    print(f"  Master: {len(master_df):,} | GST: {len(gst_df):,} | UPI: {len(upi_df):,} | E-way: {len(eway_df):,}")
    return master_df, gst_df, upi_df, eway_df

def build_feature_matrix(master_df, gst_df, upi_df, eway_df):
    print("\nBuilding feature matrix...")
    all_features = []
    entity_ids = master_df["entity_id"].unique()
    total = len(entity_ids)

    for i, entity_id in enumerate(entity_ids):
        if (i + 1) % 500 == 0 or i == 0 or (i + 1) == total:
            print(f"  Processing {i+1:,}/{total:,} ({(i+1)/total*100:.1f}%)")

        row = feature_engineering.transform(entity_id, gst_df, upi_df, eway_df, master_df)
        all_features.append(row)

    feature_matrix = pd.concat(all_features, ignore_index=True)
    print(f"  Feature matrix shape: {feature_matrix.shape}")
    return feature_matrix

def generate_risk_labels(feature_matrix):
    print("\nGenerating risk labels...")
    conditions = (
        (feature_matrix["gst_ontime_rate"] < 0.4) |
        (feature_matrix["upi_net_flow_ratio"] < -0.5) |
        (feature_matrix["eway_momentum"] < -0.3) |
        (feature_matrix["eway_anomaly_rate"] > 0.4)
    )
    labels = conditions.astype(int)

    np.random.seed(SEED)
    noise_mask = np.random.random(len(labels)) < 0.10
    labels[noise_mask] = 1 - labels[noise_mask]

    print(f"  High risk (1): {labels.sum():,} ({labels.mean()*100:.1f}%)")
    print(f"  Low risk  (0): {(1-labels).sum():,} ({(1-labels.mean())*100:.1f}%)")

    return labels

def tune_xgboost(X_train, y_train, X_val, y_val, scale_pos_weight):
    import optuna
    optuna.logging.set_verbosity(optuna.logging.WARNING)
    print(f"\nRunning Optuna HPO ({OPTUNA_TRIALS} trials)...")

    def objective(trial):
        params = {
            "n_estimators": trial.suggest_int("n_estimators", 100, 500),
            "max_depth": trial.suggest_int("max_depth", 3, 10),
            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
            "subsample": trial.suggest_float("subsample", 0.6, 1.0),
            "colsample_bytree": trial.suggest_float("colsample_bytree", 0.6, 1.0),
            "min_child_weight": trial.suggest_int("min_child_weight", 1, 10),
            "gamma": trial.suggest_float("gamma", 0.0, 5.0),
            "reg_alpha": trial.suggest_float("reg_alpha", 0.0, 5.0),
            "reg_lambda": trial.suggest_float("reg_lambda", 0.0, 5.0),
            "scale_pos_weight": scale_pos_weight,
            "eval_metric": "auc",
            "random_state": SEED,
            "use_label_encoder": False,
            "verbosity": 0,
        }
        model = XGBClassifier(**params)
        model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
        y_pred_proba = model.predict_proba(X_val)[:, 1]
        return roc_auc_score(y_val, y_pred_proba)

    study = optuna.create_study(direction="maximize", sampler=optuna.samplers.TPESampler(seed=SEED))
    study.optimize(objective, n_trials=OPTUNA_TRIALS, show_progress_bar=True)

    print(f"  Best AUC-ROC: {study.best_value:.4f}")
    print(f"  Best params: {study.best_params}")

    return study.best_params

def main():
    print("=" * 70)
    print("MSME Credit Scoring — Model Training Pipeline (Schema Updated)")
    print("=" * 70)

    master_df, gst_df, upi_df, eway_df = load_datasets()
    fm_path = os.path.join(MODEL_DIR, "feature_matrix.csv")
    if os.path.exists(fm_path):
        print(f"Loading cached feature matrix from {fm_path}...")
        feature_matrix = pd.read_csv(fm_path)
    else:
        feature_matrix = build_feature_matrix(master_df, gst_df, upi_df, eway_df)
        feature_matrix.to_csv(fm_path, index=False)
        
    labels = generate_risk_labels(feature_matrix)

    X = feature_matrix[FEATURE_COLS].copy().fillna(0)
    y = labels.copy()

    X_train_raw, X_test, y_train_raw, y_test = train_test_split(X, y, test_size=0.2, random_state=SEED, stratify=y)
    X_train_hp_raw, X_val, y_train_hp_raw, y_val = train_test_split(X_train_raw, y_train_raw, test_size=0.2, random_state=SEED, stratify=y_train_raw)

    print("\nApplying SMOTE on training sets...")
    try:
        from imblearn.over_sampling import SMOTE
        smote = SMOTE(random_state=SEED)
        X_train_hp, y_train_hp = smote.fit_resample(X_train_hp_raw, y_train_hp_raw)
        X_train, y_train = smote.fit_resample(X_train_raw, y_train_raw)
    except ModuleNotFoundError:
        print("imbalanced-learn not installed, skipping SMOTE...")
        X_train_hp, y_train_hp = X_train_hp_raw, y_train_hp_raw
        X_train, y_train = X_train_raw, y_train_raw

    n_pos = y_train.sum()
    n_neg = len(y_train) - n_pos
    scale_pos_weight = n_neg / max(n_pos, 1)

    best_params = tune_xgboost(X_train_hp, y_train_hp, X_val, y_val, scale_pos_weight)

    print("\n" + "-" * 70)
    print("Training final XGBoost model on full training set...")
    xgb_model = XGBClassifier(
        **best_params, scale_pos_weight=scale_pos_weight, eval_metric="auc",
        random_state=SEED, use_label_encoder=False, verbosity=0,
    )
    xgb_model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    y_pred_xgb = xgb_model.predict(X_test)
    y_proba_xgb = xgb_model.predict_proba(X_test)[:, 1]
    auc_xgb = roc_auc_score(y_test, y_proba_xgb)

    print(f"\n{'='*70}\nXGBOOST RESULTS\n{'='*70}")
    print(f"AUC-ROC: {auc_xgb:.4f}")
    print(classification_report(y_test, y_pred_xgb, target_names=["Low Risk", "High Risk"]))

    print(f"\n{'-'*70}\nTraining LogisticRegression (sanity check)...")
    lr_model = LogisticRegression(class_weight="balanced", max_iter=1000, random_state=SEED, solver="lbfgs")
    lr_model.fit(X_train, y_train)

    y_pred_lr = lr_model.predict(X_test)
    y_proba_lr = lr_model.predict_proba(X_test)[:, 1]
    auc_lr = roc_auc_score(y_test, y_proba_lr)

    print(f"\n{'='*70}\nLOGISTIC REGRESSION RESULTS\n{'='*70}")
    print(f"AUC-ROC: {auc_lr:.4f}")
    print(classification_report(y_test, y_pred_lr, target_names=["Low Risk", "High Risk"]))

    os.makedirs(MODEL_DIR, exist_ok=True)
    xgb_path = os.path.join(MODEL_DIR, "xgboost_v1.joblib")
    lr_path = os.path.join(MODEL_DIR, "lr_model.joblib")

    joblib.dump(xgb_model, xgb_path)
    joblib.dump(lr_model, lr_path)
    print(f"\n  ✓ XGBoost saved to: {xgb_path}\n  ✓ LogisticRegression saved to: {lr_path}")

    print(f"\n{'='*70}\nTOP 10 FEATURE IMPORTANCES (XGBoost)\n{'='*70}")
    importances = pd.Series(xgb_model.feature_importances_, index=FEATURE_COLS).sort_values(ascending=False)
    for feat, imp in importances.head(10).items():
        print(f"  {feat:30s} {imp:.4f} " + "█" * int(imp * 50))

    print(f"\n{'='*70}\nTraining complete!\n{'='*70}")

if __name__ == "__main__":
    main()
