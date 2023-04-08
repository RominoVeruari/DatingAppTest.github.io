// Logout button click handler
const logoutButton = document.querySelector('#logout-button');
const userId = localStorage.getItem('userId');
sessionStorage.setItem('userId', userId);

logoutButton.addEventListener('click', async (event) => {
  try {
    const response = await fetch('/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (data.success) {
      // redirect to login page
      window.location.href = '/login.html';
    } else {
      console.error('Logout request failed:', data.message);
    }
  } catch (error) {
    console.error('Logout request failed:', error);
  }
});
