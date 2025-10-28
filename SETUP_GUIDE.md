# ⚡ Setup Guide - Dynamic Resource Management System

This guide will help you set up and run the complete full-stack resource consumption analysis system.

---

## 📋 Prerequisites

- **Node.js** 18+ (nvm recommended for easy version management)
- **Python** 3.10+ (with venv support)
- **MongoDB** (local or Atlas account)
- **npm** (comes with Node.js)

---

## 🚀 Quick Start (3 Steps)

### 1️⃣ Install Dependencies

**Backend (from project root):**
```bash
npm install
```

**Frontend (from project root):**
```bash
cd client
npm install
cd ..
```

**Python (from project root):**
```bash
cd "Veri Uretimi"
pip install -r requirements.txt
cd ..
```

### 2️⃣ Configure Environment

The `.env` file already exists in the project root with MongoDB connection details. If you need to modify it:

```bash
# .env
MONGO_URI=mongodb+srv://your-connection-string
PORT=5000
NODE_ENV=development
```

### 3️⃣ Run the System

**Terminal 1 - Backend:**
```bash
node server.js
# or with auto-reload:
npx nodemon server.js
```
Expected output: `🚀 Server http://localhost:5000 üzerinde çalışıyor`

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```
Opens automatically at `http://localhost:3000`

**Terminal 3 (Optional) - Python Simulation:**
```bash
cd "Veri Uretimi"
python main.py
```

---

## ✅ Verify Installation

### Test API Endpoints

Open these URLs in your browser:

- http://localhost:5000/api/neighborhoods
- http://localhost:5000/api/energy
- http://localhost:5000/api/admin

You should see JSON responses.

### Test Frontend

1. Navigate to http://localhost:3000
2. You should see the Dashboard with neighborhood search
3. Try searching for "Çaydaçıra" or "Sanayi"
4. Charts should load with consumption data

---

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Cloud - Already Configured)

The system is already configured to use MongoDB Atlas. The connection string is in the `.env` file.

### Option 2: Local MongoDB

If you prefer local MongoDB:

1. Install MongoDB locally
2. Update `.env`:
   ```
   MONGO_URI=mongodb://localhost:27017/kaynak_tuketimi
   ```
3. Start MongoDB service:
   ```bash
   mongod
   ```

### Load Sample Data (if database is empty)

The Python simulation will generate data. To populate MongoDB:

```bash
cd "Veri Uretimi"
python main.py
# This generates CSV and can optionally populate MongoDB
```

---

## 🎨 System Features

### Dashboard
- **Location:** http://localhost:3000
- **Features:** 
  - Neighborhood search
  - Weekly consumption trends
  - Summary cards (electricity, water, gas)
  - Interactive Recharts visualization

### Admin Panel
- **Location:** http://localhost:3000/admin
- **Features:**
  - System statistics
  - Neighborhood management
  - Average consumption metrics

### API Endpoints
- `GET /api/neighborhoods` - All neighborhoods with weekly data
- `GET /api/neighborhoods/search?q=query` - Search neighborhoods
- `GET /api/energy` - Aggregate consumption statistics
- `GET /api/admin` - Admin panel data
- `GET /api/consumptions` - All raw consumption records
- `GET /api/average-consumption` - Calculate weekly averages

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- Check if MongoDB Atlas credentials are correct
- Verify network connection
- Check `.env` file exists and has correct MONGO_URI

### "Module not found" errors
- Run `npm install` in both root and client directories
- Delete `node_modules` and reinstall if needed

### "Port 5000 already in use"
- Change PORT in `.env` to another value (e.g., 5001)
- Update client proxy in `client/package.json` if needed

### "Python module not found"
- Ensure you're in a virtual environment:
  ```bash
  cd "Veri Uretimi"
  python -m venv .venv
  source .venv/bin/activate  # Windows: .venv\Scripts\activate
  pip install -r requirements.txt
  ```

### "Empty dashboard / No data showing"
- Check if MongoDB has data populated
- Run Python simulation to generate data
- Check browser console for API errors
- Verify backend is running on port 5000

### "CORS errors"
- Ensure `app.use(cors())` is in `server.js`
- Check `client/package.json` has `"proxy": "http://localhost:5000"`

---

## 📂 Project Structure

```
Kaynak_Tuketimi_Analiz_Sistemi/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Navbar, Sidebar, etc.
│   │   ├── pages/             # Dashboard, Admin, etc.
│   │   ├── App.js             # Main app component
│   │   ├── App.css            # Updated with dashboard styles
│   │   └── index.css          # Global styles
│   └── package.json
├── models/                     # MongoDB schemas
│   ├── Consumption.js
│   └── AverageConsumption.js
├── Veri Uretimi/              # Python simulation
│   ├── main.py
│   ├── uretim_modelleri.py
│   ├── config.py
│   ├── requirements.txt
│   └── *.csv
├── .env                        # Environment variables
├── .gitignore                  # Git ignore rules
├── server.js                   # Backend API
├── package.json
└── README.md
```

---

## 🎯 Next Steps

After successful setup:

1. **Explore the dashboard** at http://localhost:3000
2. **Generate more data** using Python simulation
3. **Test API endpoints** using browser or Postman
4. **Customize visualizations** in `client/src/pages/Dashboard.js`
5. **Add new features** as needed

---

## 💡 Development Tips

### Auto-reload Backend
Install nodemon for automatic server restart:
```bash
npm install --save-dev nodemon
# Then use: npx nodemon server.js
```

### Python Virtual Environment
Always use venv for Python dependencies:
```bash
cd "Veri Uretimi"
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Debugging
- Check browser console (F12) for frontend errors
- Backend logs appear in terminal running server.js
- MongoDB logs in Atlas dashboard

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Recharts Documentation](https://recharts.org/)

---

## 🆘 Need Help?

1. Check the Troubleshooting section above
2. Review code comments in the source files
3. Check browser console and server logs
4. Ensure all dependencies are installed

---

**Status:** ✅ Ready to run  
**Version:** 1.0.0  
**Last Updated:** 2024

