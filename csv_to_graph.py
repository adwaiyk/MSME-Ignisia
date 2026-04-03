import pandas as pd

def process_upi_data(filepath="upi_transactions.csv"):
    """
    Reads raw UPI logs, time-boxes them, and converts them into a directed edgelist.
    Returns a Pandas DataFrame of aggregated edges.
    """
    print("PHASE 1: Data Engineering Module Triggered...")

    df = pd.read_csv(filepath)

    df['timestamp'] = pd.to_datetime(df['timestamp'])
    start_date = pd.to_datetime("2026-04-01", utc=True)
    end_date = pd.to_datetime("2026-04-07", utc=True)

    mask = (df['timestamp'] >= start_date) & (df['timestamp'] <= end_date)
    windowed_df = df.loc[mask].copy()

    def determine_flow(row):
        if row['txn_type'] == 'CREDIT':
            return pd.Series([row['counterparty_vpa'], row['entity_id']])
        elif row['txn_type'] == 'DEBIT':
            return pd.Series([row['entity_id'], row['counterparty_vpa']])
        else:
            return pd.Series([None, None])

    windowed_df[['source', 'target']] = windowed_df.apply(determine_flow, axis=1)
    edgelist_df = windowed_df[['source', 'target', 'amount_inr', 'timestamp', 'txn_id']]

    aggregated_edges = edgelist_df.groupby(['source', 'target'])['amount_inr'].sum().reset_index()
    aggregated_edges.rename(columns={'amount_inr': 'weight'}, inplace=True)

    print(f"Data Engine Complete! Handing off {len(aggregated_edges)} edges to the Analytics Layer.\n")
    return aggregated_edges