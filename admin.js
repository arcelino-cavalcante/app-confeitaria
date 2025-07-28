document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const adminPanel = document.getElementById('admin-panel');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    auth.onAuthStateChanged(user => {
        if (user) {
            loginScreen.classList.add('d-none');
            adminPanel.classList.remove('d-none');
            // Load initial admin content
        } else {
            loginScreen.classList.remove('d-none');
            adminPanel.classList.add('d-none');
        }
    });

    loginBtn.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                alert('Erro de login: ' + error.message);
            });
    });

    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });
});