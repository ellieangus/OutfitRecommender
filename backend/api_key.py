import pandas as pd

file_path = "backend/Claude_API_Key.txt"

ANTHROPIC_API_KEY= pd.read_csv(file_path, header=None).iloc[0, 0]

print(ANTHROPIC_API_KEY)