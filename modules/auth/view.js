const AuthView = {
  showError(msg) {
    const el = document.getElementById('loginError');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
  },

  hideError() {
    const el = document.getElementById('loginError');
    if (el) el.classList.remove('show');
  },

  showApp(user) {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('app').classList.add('visible');
    document.getElementById('sessionUser').textContent = user;
    document.getElementById('home-username').textContent = user;
  },

  showLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('app').classList.remove('visible');
  },

  setReadyButton(ready) {
    const btn = document.getElementById('loginBtn');
    if (!btn) return;
    btn.classList.toggle('ready', ready);
  }
};
