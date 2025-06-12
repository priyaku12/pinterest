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

  document.getElementById('login-btn').addEventListener('click', function () {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const msg = document.getElementById('message');

    if (!user || !pass) {
      msg.textContent = 'Please fill in both fields.';
      msg.style.color = 'red';
    } else if (user === 'admin' && pass === '1234') {
      msg.textContent = 'Login successful!';
      msg.style.color = 'green';
    } else {
      msg.textContent = 'Invalid username or password.';
      msg.style.color = 'red';
    }
  });
}
