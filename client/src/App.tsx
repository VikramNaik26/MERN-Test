import { Routes, Route, Outlet } from "react-router-dom"

import { LoginForm } from '@/components/LoginForm'
import { RegisterForm } from "@/components/RegisterForm";
import Dashboard from "@/pages/Dashboard";
import * as auth from "@/actions/auth";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="register"
          element={
            <RegisterForm
              onRegisterSuccess={auth.onRegisterSuccess}
              onRegisterError={auth.onRegisterError}
            />
          }
        />
        <Route
          path="login"
          element={
            <LoginForm
              onLoginSuccess={auth.onLoginSuccess}
              onLoginError={auth.onLoginError}
            />
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
      <header>
      // TODO: add navbar
      </header>

      <Outlet />
    </main>
  );
}

export default App

