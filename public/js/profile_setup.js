document.addEventListener('DOMContentLoaded', function () {
  // Get references to the DOM elements
  const form = document.getElementById('profile-setup-form');
  const photoGallery = document.getElementById('photo-gallery');
  const addPhotoBtn = document.getElementById('add-photo');
  const deletePhotoBtn = document.getElementById('delete-photo');
  const profilePictureInput = document.getElementById('profile-picture-input');
  let userId ='';
  fetch('/api/profile')
    .then(response => response.json())
    .then(data => {
      const firstName = document.getElementById('first-name');
      const lastName = document.getElementById('last-name');
      const email = document.getElementById('email')
      const gender = document.getElementById('gender');
      const state = document.getElementById('state');
      const sexualOrientation = document.getElementById('sexual-orientation');
      const profilePicture = document.getElementById('profile-picture');
      const photoGallery = document.getElementById('photo-gallery');
      const bio = document.getElementById('bio');
      const interests = document.getElementById('interests');
      const birthdayInput = document.getElementById("birthday");
      const birthdayValue = birthdayInput.value;
      let date = moment(birthdayValue, "MM-DD-YYYY").format("YYYY-MM-DD");

      firstName.value = data.first_name;
      lastName.value = data.last_name;
      email.value = data.email;
      gender.value = data.gender;
      state.value = data.state;
      sexualOrientation.value = data.sexual_orientation;
      date = data.date_of_birth;
      bio.value = data.bio;
      interests.value = data.interests;
      userId = data.user_id;
      // Display profile picture
    if (data.profile_picture) {
      profilePictureInput.src = data.profile_picture;
      console.log("this is the profile_picture saved in the database")
    }

    // Display photo gallery
    if (data.photo_gallery) {
      data.photo_gallery.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.url;
        img.alt = photo.description;
        photoGallery.appendChild(img);
      });
    }
    })
    .catch(error => {
      console.error('Error fetching profile data:', error);
    });


    // save the data of profile_setup.html
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const gender = document.getElementById('gender').value;
    const birthday = document.getElementById('birthday').value;

    const state = document.getElementById('state').value;

    const sexualOrientation = document.getElementById('sexual-orientation').value;
    const dateOfBirth = document.getElementById('date-of-birth').value;
    const profilePicture = document.getElementById('profile-picture').value;
    const photoGallery = document.getElementById('photo-gallery').value;
    const bio = document.getElementById('bio').value;
    const interests = document.getElementById('interests').value;

    fetch('/profile_setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        lastName,
        gender,
        birthday,
        state,
        sexualOrientation,
        dateOfBirth,
        profilePicture,
        photoGallery,
        bio,
        interests
      })
    })
      .then(response => {
        if (response.ok) {
          window.location.href = 'home.html';
        }
      })
      .catch(error => {
        console.error('Error saving profile data:', error);
      });
  });

  const changeProfilePictureButton = document.getElementById('change-profile-picture');
  const profilePicture = document.getElementById('profile-picture');

  changeProfilePictureButton.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';

    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.addEventListener('load', (event) => {
        profilePicture.src = event.target.result;
      });

      reader.readAsDataURL(file);
    });

    fileInput.click();
  });
  // Add event listener to the "Add new photo" button
  addPhotoBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', () => {
      const formData = new FormData();
      
      formData.append('photo', input.files[0]);
      formData.append('userId', userId);
      console.log('this is userid in addphotobtn:'+userId)
      // Send the photo to the server using the Fetch API
      fetch('/api/photos', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(photo => {
          // Create an image element for the new photo and append it to the photo gallery
          const img = document.createElement('img');
          img.src = photo.url;
          img.alt = `Photo ${photo.photo_id}`;
          img.dataset.photoId = photo.photo_id;
          photoGallery.appendChild(img);
        })
        .catch(error => {
          console.error('Error uploading photo:', error);
        });
    });
    input.click();
  });

  // Add event listener to the "Delete selected photo(s)" button
  deletePhotoBtn.addEventListener('click', () => {
    // Get an array of all selected photos
    const selectedPhotos = Array.from(photoGallery.querySelectorAll('img.selected'));

    // Send a DELETE request for each selected photo to the server using the Fetch API
    selectedPhotos.forEach(photo => {
      const photoId = photo.dataset.photoId;
      fetch(`/api/photos/${photoId}`, {
        method: 'DELETE'
      })
        .then(() => {
          // Remove the image element from the photo gallery
          photoGallery.removeChild(photo);
        })
        .catch(error => {
          console.error('Error deleting photo:', error);
        });
    });
  });

  // Add event listener to the photo gallery to toggle the "selected" class on click
  photoGallery.addEventListener('click', event => {
    if (event.target.tagName === 'IMG') {
      event.target.classList.toggle('selected');
    }
  });

});



function suggestState() {
  const stateInput = document.getElementById('state');
  const stateSuggestions = document.getElementById('state-suggestions');

  // Check if the state input value is empty
  if (stateInput.value === '') {
    stateSuggestions.innerHTML = '';
    return;
  }

  const searchQuery = stateInput.value.toLowerCase();
  const matchingStates = states.filter(state => state.toLowerCase().includes(searchQuery));

  // Clear any existing suggestions
  stateSuggestions.innerHTML = '';

  // Add new suggestion list items for each matching state
  matchingStates.forEach(stateName => {
    const suggestion = document.createElement('li');
    suggestion.textContent = stateName;
    // this adds an eventlistener if the user clicks on the suggested name and populates stateinput ,
    // clearing also the suggestion list
    suggestion.addEventListener('click', () => {
      stateInput.value = stateName;
      stateSuggestions.innerHTML = '';
    });
    stateSuggestions.appendChild(suggestion);
  });
}



