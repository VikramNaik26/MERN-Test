const authUtils = {
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('userData')
    return !!(token && userData)
  },

  getCurrentUser: () => {
    const userData = localStorage.getItem('userData')
    return userData ? JSON.parse(userData) : null
  },

  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    window.location.href = '/login'
  }
}

export { authUtils }
