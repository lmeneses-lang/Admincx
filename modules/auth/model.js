const AuthModel = {
  currentUser: null,
  currentRole: null,

  setSession(user, role) {
    this.currentUser = user;
    this.currentRole = role;
    localStorage.setItem('cx_user', user);
    localStorage.setItem('cx_role', role);
  },

  getSession() {
    return {
      user: localStorage.getItem('cx_user'),
      role: localStorage.getItem('cx_role')
    };
  },

  clearSession() {
    this.currentUser = null;
    this.currentRole = null;
    localStorage.removeItem('cx_user');
    localStorage.removeItem('cx_role');
  },

  isLoggedIn() {
    return !!localStorage.getItem('cx_user');
  }
};
