import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { VehiclesPage } from './pages/VehiclesPage'
import { VehicleDetailPage } from './pages/VehicleDetailPage'
import { CargoPage } from './pages/CargoPage'
import { CargoDetailPage } from './pages/CargoDetailPage'
import { OperationsPage } from './pages/OperationsPage'
import { DriversPage } from './pages/DriversPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000, // 30 s — avoids excessive refetching on tab focus
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="vehicles/:id" element={<VehicleDetailPage />} />
              <Route path="cargo" element={<CargoPage />} />
              <Route path="cargo/:id" element={<CargoDetailPage />} />
              <Route path="operations" element={<OperationsPage />} />
              <Route path="drivers" element={<DriversPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
