import sqlite3

conn = sqlite3.connect("academic.db")
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(performance)")
print(cursor.fetchall())

conn.commit()
conn.close()

print("Semester 2 inserted")