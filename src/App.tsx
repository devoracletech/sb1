import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import Bills from './pages/Bills';
import Admin from './pages/Admin';
import AuthForm from './components/AuthForm';
import Investment from './pages/Investment';
import SmartSavings from './pages/SmartSavings';
import Crypto from './pages/Crypto';
import Flights from './pages/Flights';
import Support from './pages/Support';
import KYC from './pages/KYC';

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user?.role === 'ADMIN' ? <>{children}</> : <Navigate to="/" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<AuthForm type="login" />} />
            <Route path="/register" element={<AuthForm type="register" />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/transfer"
              element={
                <PrivateRoute>
                  <Layout>
                    <Transfer />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/bills"
              element={
                <PrivateRoute>
                  <Layout>
                    <Bills />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/investment"
              element={
                <PrivateRoute>
                  <Layout>
                    <Investment />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/smart-savings"
              element={
                <PrivateRoute>
                  <Layout>
                    <SmartSavings />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/crypto"
              element={
                <PrivateRoute>
                  <Layout>
                    <Crypto />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/flights"
              element={
                <PrivateRoute>
                  <Layout>
                    <Flights />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/support"
              element={
                <PrivateRoute>
                  <Layout>
                    <Support />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/kyc"
              element={
                <PrivateRoute>
                  <Layout>
                    <KYC />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Layout>
                    <Admin />
                  </Layout>
                </AdminRoute>
              }
            />
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}