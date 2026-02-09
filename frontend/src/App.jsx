import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Success from './pages/Success';
import ExpertiseSelection from './pages/ExpertiseSelection';
import DocumentUpload from './pages/DocumentUpload';
import PANVerification from './pages/PANVerification';
import FaceVerification from './pages/FaceVerification';
import './index.css';

// Google Client ID
const GOOGLE_CLIENT_ID = '671713935730-o56g346e7pd60k9pqbk9rr2pup9era6v.apps.googleusercontent.com';

// Protected Route component
const ProtectedRoute = ({ children, requireOnboarding = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If user needs onboarding and we're not on the onboarding page
  if (requireOnboarding && user && !user.is_onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

// Public Route - redirect to appropriate page if logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (user && !user.is_onboarded) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/success" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/success"
        element={
          <ProtectedRoute requireOnboarding>
            <Success />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/expertise"
        element={
          <ProtectedRoute requireOnboarding>
            <ExpertiseSelection />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/pan-verification"
        element={
          <ProtectedRoute requireOnboarding>
            <PANVerification />
          </ProtectedRoute>
        }
      />

      <Route
        path="/onboarding/documentation"
        element={
          <ProtectedRoute requireOnboarding>
            <DocumentUpload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/face-verification"
        element={
          <ProtectedRoute requireOnboarding>
            <FaceVerification />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
