const form = document.querySelector('form');
const email = document.querySelector('#email');
const password = document.querySelector('#password');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  console.log('Form submitted');
  console.log(`Email: ${email.value}, Password: ${password.value}`);

  try {
    console.log(JSON.stringify({
      email: email.value,
      password: password.value
    }));
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    });

    if (response.ok) {
      
      window.location.href = '/home';
    } else {
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    alert(error.message);
  }
});
  

