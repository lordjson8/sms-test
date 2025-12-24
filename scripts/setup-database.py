import sqlite3
import sys
from pathlib import Path

# Create prisma directory if it doesn't exist
prisma_dir = Path("prisma")
prisma_dir.mkdir(exist_ok=True)

# Database path
db_path = prisma_dir / "dev.db"

print(f"Setting up SQLite database at {db_path}")

# Create database connection
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create User table
cursor.execute("""
CREATE TABLE IF NOT EXISTS User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

# Create Category table
cursor.execute("""
CREATE TABLE IF NOT EXISTS Category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

# Create Contact table
cursor.execute("""
CREATE TABLE IF NOT EXISTS Contact (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phoneNumber TEXT NOT NULL,
    categoryId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE CASCADE
)
""")

# Create SmsLog table
cursor.execute("""
CREATE TABLE IF NOT EXISTS SmsLog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL,
    categoryId INTEGER,
    sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    twilioSid TEXT,
    FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE SET NULL
)
""")

# Create indexes
cursor.execute("CREATE INDEX IF NOT EXISTS idx_contact_category ON Contact(categoryId)")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_smslog_category ON SmsLog(categoryId)")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_smslog_sentAt ON SmsLog(sentAt)")

# Commit changes
conn.commit()

print("✓ Database tables created successfully")

# Check if admin user exists
cursor.execute("SELECT COUNT(*) FROM User")
user_count = cursor.fetchone()[0]

if user_count == 0:
    print("\nNo users found. Please create your first user via the login page")
else:
    print(f"\n✓ Database has {user_count} user(s)")

# Insert some default categories if none exist
cursor.execute("SELECT COUNT(*) FROM Category")
category_count = cursor.fetchone()[0]

if category_count == 0:
    print("\nCreating default categories...")
    default_categories = ["General", "Business", "Personal", "Marketing"]
    for cat in default_categories:
        cursor.execute("INSERT INTO Category (name) VALUES (?)", (cat,))
    conn.commit()
    print(f"✓ Created {len(default_categories)} default categories")
else:
    print(f"\n✓ Database has {category_count} categories")

conn.close()
print("\n✓ Database setup complete!")
