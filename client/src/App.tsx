import { Routes, Route, Outlet } from "react-router-dom"
import { Navigate, useLocation } from 'react-router-dom'

import { LoginForm } from '@/components/LoginForm'
import { RegisterForm } from "@/components/RegisterForm"
import Dashboard from "@/pages/Dashboard"
import { authUtils } from "@/lib/authUtils"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation()
  const isAuthenticated = authUtils.isAuthenticated()

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  return <>{children}</>
}

interface GuestRouteProps {
  children: React.ReactNode
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const location = useLocation()
  const isAuthenticated = authUtils.isAuthenticated()

  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  return <>{children}</>
}


function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          path="register"
          element={
            <GuestRoute>
              <RegisterForm />
            </GuestRoute>
          }
        />
        <Route
          path="login"
          element={
            <GuestRoute>
              <LoginForm />
            </GuestRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* <Route path="*" element={<NoMatch />} /> */}
      </Route>
    </Routes>
  )
}

function Layout() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-2">

      <Outlet />
    </main>
  )
}

export default App

