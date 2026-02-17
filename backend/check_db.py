from database.db import get_connection

conn = get_connection()
cursor = conn.cursor()

cursor.execute("SELECT * FROM users")
rows = cursor.fetchall()

print("Users table:")
for row in rows:
    print(row)

conn.close()