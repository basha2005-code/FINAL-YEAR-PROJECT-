from flask_bcrypt import Bcrypt
from database.db import get_connection

bcrypt = Bcrypt()

conn = get_connection()
cursor = conn.cursor()

password_hash = bcrypt.generate_password_hash("admin123").decode("utf-8")

cursor.execute("""
    INSERT INTO users (roll_number, password_hash, role)
    VALUES (?, ?, ?)
""", ("admin001", password_hash, "admin"))

conn.commit()
conn.close()

print("✅ Admin user created successfully")