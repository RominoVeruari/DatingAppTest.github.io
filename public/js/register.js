document.addEventListener('DOMContentLoaded', () => {
  const registrationForm = document.querySelector('#registration-form');
  registrationForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const firstName = registrationForm.elements['firstName'].value;
    const lastName = registrationForm.elements['lastName'].value;
    const password = registrationForm.elements['password'].value;
    const email = registrationForm.elements['email'].value;

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, password, email })
      });

      const data = await response.json();

      if (data.success) {
        // display success message
        const successMessage = document.querySelector('#registration-success-message');
        successMessage.textContent = data.message;
        successMessage.classList.remove('hidden');
      } else {
        // display error message
        const errorMessage = document.querySelector('#registration-error-message');
        errorMessage.textContent = data.message;
        errorMessage.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Registration request failed:', error);
    }
  });
});
