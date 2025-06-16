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

  document.getElementById('login-btn').addEventListener('click', async function () {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const msg = document.getElementById('message');

    if (!user || !pass) {
      msg.textContent = 'Please fill in both fields.';
      msg.style.color = 'red';
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/authroutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user, password: pass }),
      });

      const data = await response.json();

      if (response.ok) {
        
        localStorage.setItem('user', JSON.stringify(data.user));

        msg.textContent = data.message || 'Login successful!';
        msg.style.color = 'green';
        window.location.href= '/';
        
        
      } else {
        msg.textContent = data.message || 'Login failed.';
        msg.style.color = 'red';
      }
    } catch (error) {
      msg.textContent = 'Network error. Please try again.';
      msg.style.color = 'red';
    }
  });
}
