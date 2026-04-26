# 🗳️ ElectionEase-Bot: Your Intelligent Civic Partner

![ElectionEase Banner](C:\Users\shrey\.gemini\antigravity\brain\c3dadc2d-de1a-4cc6-b702-feb320ea6eaf\election_ease_banner_1777198030797.png)

**ElectionEase-Bot** is a premium, high-performance civic platform designed to empower citizens with objective, real-time information about election processes, candidates, and voting requirements. Built with a sleek glassmorphic UI and powered by Gemini AI, it makes democracy accessible, transparent, and engaging.

---

## 🌟 Key Features

- **🤖 Gemini-Powered AI Chatbot**: Get instant, accurate answers to complex questions about voting laws, registration, and election procedures.
- **🔍 Candidate Research Center**: Explore candidate platforms, biographies, and track records with an objective, data-driven approach.
- **⚖️ Candidate Comparison**: Side-by-side analysis of candidates to help you make an informed decision based on policies rather than rhetoric.
- **📅 Interactive Election Timeline**: Stay ahead of the curve with a dynamic roadmap of upcoming election stages and deadlines.
- **🎯 Voter Match Quiz**: Discover which candidates align best with your personal values through our intelligent civic matching engine.
- **📰 Real-time News Feed**: Integrated news stream to keep you updated on the latest electoral developments across the nation.
- **🌍 Multilingual Support**: Accessible in English, Hindi, Marathi, Gujarati, Bengali, Tamil, Telugu, Kannada, and Malayalam.

---

## 🚀 Tech Stack

- **Frontend**: React (Vite), TailwindCSS, Framer Motion, Lucide React, i18next.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas.
- **AI Integration**: Google Gemini API.
- **Deployment**: Vercel (Frontend), Render (Backend).

---

## 🛠️ Local Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Google Gemini API Key

### 2. Clone the Repository
```bash
git clone <your-repo-url>
cd Election
```

### 3. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_gemini_api_key
NEWS_API_KEY=your_newsapi_org_key
```
Run the backend:
```bash
npm start
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api
```
Run the frontend:
```bash
npm run dev
```

---

## 🌐 Deployment

### Backend (Render)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `node index.js`
- **Environment Variables**: Add all keys from your backend `.env`.

### Frontend (Vercel)
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: 
  - `VITE_API_URL`: `https://your-backend.onrender.com/api`

---

## 📄 License
This project is licensed under the ISC License.

---
Built with ❤️ for a stronger democracy.
