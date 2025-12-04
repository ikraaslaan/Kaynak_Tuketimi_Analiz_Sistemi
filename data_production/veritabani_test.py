from pymongo import MongoClient
import sys
sys.stdout.reconfigure(encoding='utf-8')

try:
    client = MongoClient("mongodb+srv://23frontend23_db_user:PaoDBStFSwY3nPR0@verikaynagi.bueal8j.mongodb.net")
    client.admin.command("ping")
    print("MongoDB bağlantısı başarılı!")
except Exception as e:
    print("Hata:", e)
