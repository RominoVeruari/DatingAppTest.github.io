const userId = localStorage.getItem('userId');
const userNameSpan = document.querySelector('#user-name');

// Profile-setup button click handler 
const profileSetupButton = document.getElementById('profile-setup-button');

profileSetupButton.addEventListener('click', function() {
  document.cookie = 'userId=' + userId + ';';
  window.location.href = 'profile_setup.html';
});

// Logout button click handler
const logoutButton = document.querySelector('#logout-button');
logoutButton.addEventListener('click', async (event) => {
  try {
    const response = await fetch('/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (data.success) {
      // redirect to login page
      
      document.cookie = 'userid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/login.html';
    } else {
      console.error('Logout request failed:', data.message);
    }
  } catch (error) {
    console.error('Logout request failed:', error);
  }
});

// Fetch user data and update UI
(async () => {
  try {
    const response = await fetch('/api/user');
    const data = await response.json();

    if (data.firstName) {
      // firstName here referes to the object saved in api/user serverside file :app.js and not the firstname of user database
      userNameSpan.textContent = `Welcome ${data.firstName}!`;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
})();
