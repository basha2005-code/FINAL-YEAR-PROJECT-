from flask_bcrypt import Bcrypt
from models.user import create_user_table, create_user
from database.db import get_connection

bcrypt = Bcrypt()

create_user_table()

hashed = bcrypt.generate_password_hash("admin123").decode("utf-8")

create_user(
    "Admin User",
    "admin001",
    "admin@email.com",
    hashed,
    "admin"
)

print("Admin user created.")