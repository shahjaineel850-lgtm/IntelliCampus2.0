import sqlite3

conn = sqlite3.connect(r'C:\Users\Jaineel Shah\.gemini\antigravity-ide\scratch\Academic intellegence\backend\auroraclassroom.db')
tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print("Tables:", tables)

for t in tables:
    name = t[0]
    count = conn.execute(f"SELECT COUNT(*) FROM {name}").fetchone()[0]
    print(f"{name}: {count} rows")
