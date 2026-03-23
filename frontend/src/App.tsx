import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout'; 
import Login from './pages/Login';
import Events from './pages/Events';
import MyEvents from './pages/MyEvents';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import Profile from './pages/Profile';


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};


function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0B1120] font-sans transition-colors">
        <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} /> 
        
        <Routes>
          <Route 
            path="/login" 
            element={
              <main className="flex-grow flex flex-col">
                <Login />
              </main>
            } 
          />
          
          <Route element={<Layout />}>
            <Route path="/" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
            <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
            <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<Profile />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;