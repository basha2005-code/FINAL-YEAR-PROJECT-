from database.db import get_connection
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def create_user_table():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            roll_number TEXT UNIQUE,
            email TEXT,
            password_hash TEXT,
            role TEXT
        )
    """)

    conn.commit()
    conn.close()


def create_user(name, roll_number, email, password, role):
    conn = get_connection()
    cursor = conn.cursor()

    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    cursor.execute("""
        INSERT OR IGNORE INTO users
        (name, roll_number, email, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
    """, (name, roll_number, email, password_hash, role))

    conn.commit()
    conn.close()


def seed_default_users():
    create_user("Admin User", "admin01", "admin@uni.com", "password123", "admin")
    create_user("Teacher User", "teacher01", "teacher@uni.com", "password123", "teacher")
    create_user("Student User", "student01", "student@uni.com", "password123", "student")


def get_user_by_roll(roll_number):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, name, roll_number, email, password_hash, role
        FROM users
        WHERE roll_number = ?
    """, (roll_number,))

    user = cursor.fetchone()
    conn.close()
    return user