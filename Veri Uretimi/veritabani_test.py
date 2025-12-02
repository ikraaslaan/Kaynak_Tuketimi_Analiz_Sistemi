from pymongo import MongoClient
import sys
sys.stdout.reconfigure(encoding='utf-8')

try:
    client = MongoClient("Mongodb bağlantısını yazınız!")
    client.admin.command("ping")
    print("MongoDB bağlantısı başarılı!")
except Exception as e:
    print("Hata:", e)
