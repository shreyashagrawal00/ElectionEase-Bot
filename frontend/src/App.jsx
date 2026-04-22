import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { CompareProvider } from './context/CompareContext';
import Navbar from './components/layout/Navbar';
import Chatbot from './components/Chatbot';
import AccessibilityToolbar from './components/ui/AccessibilityToolbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import KnowledgeBase from './pages/KnowledgeBase';
import ElectionTimeline from './pages/ElectionTimeline';
import Candidates from './pages/Candidates';
import CandidateComparison from './pages/CandidateComparison';
import VoterMatchQuiz from './pages/VoterMatchQuiz';

function App() {
  return (
    <AccessibilityProvider>
      <CompareProvider>
        <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 transition-colors duration-200">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/knowledge" element={<KnowledgeBase />} />
                <Route path="/timeline/:id" element={<ElectionTimeline />} />
                <Route path="/candidates" element={<Candidates />} />
                <Route path="/compare" element={<CandidateComparison />} />
                <Route path="/match" element={<VoterMatchQuiz />} />
              </Routes>
            </main>
            <Chatbot />
            <AccessibilityToolbar />
          </div>
        </Router>
      </AuthProvider>
      </CompareProvider>
    </AccessibilityProvider>
  );
}

export default App;
