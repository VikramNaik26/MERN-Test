import { Routes, Route, Outlet } from "react-router-dom"

import { LoginForm } from '@/components/LoginForm'
import { RegisterForm } from "@/components/RegisterForm";
import Dashboard from "@/pages/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="register"
          element={
            <RegisterForm />
          }
        />
        <Route
          path="login"
          element={
            <LoginForm />
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

