import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { Loading } from './components/common/Loading';
import { FlyingBee } from './components/common/FlyingBee';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import BeekeeperDashboard from './pages/BeekeeperDashboard';
import Hives from './pages/Hives';
import HiveDetails from './pages/HiveDetails';
import Harvests from './pages/Harvests';
import Batches from './pages/Batches';
import BatchDetails from './pages/BatchDetails';
import CustomerHome from './pages/CustomerHome';
import ScanBatch from './pages/ScanBatch';
import PublicBatch from './pages/PublicBatch';

// Protected beekeeper layout
function BeekeeperLayout() {
  const { user, isLoading } = useApp();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading message="Loading HoneyTrace…" />
    </div>
  );
  if (!user || user.role !== 'beekeeper') return <Navigate to="/login" replace />;
  return (
    <div className="flex min-h-screen bg-warm-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// Customer layout
function CustomerLayout() {
  const { isLoading } = useApp();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading message="Loading HoneyTrace…" />
    </div>
  );
  return <Outlet />;
}

// Root redirect
function RootRedirect() {
  const { user, isLoading } = useApp();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading message="Loading…" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'beekeeper') return <Navigate to="/beekeeper" replace />;
  return <Navigate to="/customer" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Beekeeper (protected) */}
      <Route path="/beekeeper" element={<BeekeeperLayout />}>
        <Route index element={<BeekeeperDashboard />} />
        <Route path="hives" element={<Hives />} />
        <Route path="hives/:id" element={<HiveDetails />} />
        <Route path="harvests" element={<Harvests />} />
        <Route path="batches" element={<Batches />} />
        <Route path="batches/:batchId" element={<BatchDetails />} />
      </Route>

      {/* Customer */}
      <Route path="/customer" element={<CustomerLayout />}>
        <Route index element={<CustomerHome />} />
        <Route path="scan" element={<ScanBatch />} />
      </Route>

      {/* Public batch verification — no auth required */}
      <Route path="/batch/:batchId" element={<PublicBatch />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <FlyingBee />
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
