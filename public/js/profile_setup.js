// Wait for the DOM to finish loading
document.addEventListener("DOMContentLoaded", function() {

    // Get the form element
    const form = document.getElementById("profile-setup-form");
  
    // Listen for the form's submission event
    form.addEventListener("submit", function(event) {
      // Prevent the default form submission behavior
      event.preventDefault();
  
      // Get the form data
      const firstName = document.getElementById("first-name").value;
      const lastName = document.getElementById("last-name").value;
      const gender = document.getElementById("gender").value;
      const birthday = document.getElementById("birthday").value;
      const city = document.getElementById("city").value;
      const state = document.getElementById("state").value;
      const country = document.getElementById("country").value;
  
      // TODO: Save the profile data to the server
      // ...
  
      // Redirect the user back to the home page
      window.location.href = "home.html";
    });
  
  });
  