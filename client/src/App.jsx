import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Sidebar from './components/layout/Sidebar';
import Loader from './components/ui/Loader';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Notes from './pages/Notes';
import Quiz from './pages/Quiz';
import Planner from './pages/Planner';

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loader fullScreen label="Loading your workspace..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex bg-void">
      <Sidebar />
      {/* pt-14/pb-16 reserve space for the mobile top bar & bottom tab bar
          rendered by Sidebar; lg: clears them since desktop uses a fixed
          left rail instead. */}
      <div className="h-screen flex-1 overflow-y-auto pt-14 pb-16 lg:pl-64 lg:pt-0 lg:pb-0">
        <Outlet />
      </div>
    </div>
  );
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader fullScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/planner" element={<Planner />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
