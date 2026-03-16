import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'react-hot-toast';
import Footer from './components/Footer';
import Login from './pages/Login';
import Events from './pages/Events';
import MyEvents from './pages/MyEvents';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const MainLayout = () => {
  return (
    <>
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </>
  );
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
              <main className="flex-grow">
                <Login />
              </main>
            } 
          />
          
          <Route element={<MainLayout />}>
            <Route path="/" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
            <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
            <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;