export default function decorate(block) {
  const loginBox = document.createElement('div');
  loginBox.className = 'login-box';

  loginBox.innerHTML = `
    <h2>Login</h2>
    <input type="text" id="username" placeholder="Username" />
    <input type="password" id="password" placeholder="Password" />
    <button id="login-btn">Login</button>
    <div class="message" id="message"></div>
  `;

  block.appendChild(loginBox);

  if (!localStorage.getItem('users')) {
    const mockUsers = [
      { username: 'user', password: 'pass123' },
      { username: 'admin', password: 'admin123' },
    ];
    localStorage.setItem('users', JSON.stringify(mockUsers));
  }

  document.getElementById('login-btn').addEventListener('click', async () => {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const msg = document.getElementById('message');

    if (!user || !pass) {
      msg.textContent = 'Please fill in both fields.';
      msg.style.color = 'red';
      return;
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Find matching user
    const foundUser = users.find((u) => u.username === user && u.password === pass);

    if (foundUser) {
      // Save logged-in user info in localStorage
      localStorage.setItem('loggedInUser', JSON.stringify({
        username: foundUser.username,
        password: foundUser.password,
      }));

      msg.textContent = 'Login successful!';
      msg.style.color = 'green';

      // Redirect after short delay so user sees the message
      setTimeout(() => {
        window.location.href = '/'; // Adjust to your home page URL
      }, 1000);
    } else {
      msg.textContent = 'Invalid username or password.';
      msg.style.color = 'red';
    }
  });
}
