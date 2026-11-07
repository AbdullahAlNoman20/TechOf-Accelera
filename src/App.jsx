import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import AppShell from '@/components/layout/AppShell';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { appRoutes } from '@/routes';

const Loading = () => <div className="p-10 text-center text-sm text-ink-400">Loading...</div>;

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          {appRoutes.map((r) => (
            <Route key={r.path} path={r.path} element={<ProtectedRoute module={r.module}>{r.element}</ProtectedRoute>} />
          ))}
          <Route path="*" element={<NotFound inApp />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
