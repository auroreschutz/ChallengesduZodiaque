document.addEventListener('DOMContentLoaded', () => {
  const statsSection = document.querySelector('.desktopview');
  const accordionBody = document.querySelector('.accordion-body');
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const steps = document.querySelectorAll('.step');
  const board = document.getElementById('board');
  const participantsDiv = document.getElementById('participants');
  const modal = document.getElementById('stats-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalContent = document.getElementById('stats');
  const closeModal = document.querySelector('.close');
  const loggedInUserDisplay = document.getElementById('logged-in-user');

  let users = [];
  let currentUser = null;
  const serverUrl = ''; 

   // save & stockage (not working ?)

  function saveUsers() {
      fetch(`/api/users`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(currentUser)
      })
      .then(response => response.json())
      .then(data => {
          users = data;
      })
      .catch(error => console.error('Error saving users:', error));
  }

  function loadUsers() {
      fetch(`${serverUrl}/api/users`)
          .then(response => response.json())
          .then(data => {
              users = data;
              users.forEach(displayUser);
          })
          .catch(error => console.error('Error loading users:', error));
  }

  // responsive (stats col to accordion)

  function moveStatsToAccordion() {
      if (window.innerWidth <= 991) {
          if (statsSection && !accordionBody.contains(statsSection)) {
              accordionBody.appendChild(statsSection);
          }
      } else {
          const originalParent = document.querySelector('.row');
          if (originalParent && !originalParent.contains(statsSection)) {
              originalParent.appendChild(statsSection);
          }
      }
  }

  moveStatsToAccordion();
  window.addEventListener('resize', moveStatsToAccordion);

  // signup

  signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const pawnImage = document.getElementById('pawn-image').files[0];

      if (username && pawnImage) {
          const reader = new FileReader();
          reader.onload = function(e) {
              const user = {
                  name: username,
                  pawn: e.target.result,
                  position: 1,
                  stepsCompleted: 0,
                  timesCompleted: 0
              };
              users.push(user);
              currentUser = user;
              saveUsers();
              displayUser(user);
          };
          reader.readAsDataURL(pawnImage);
      }
  });

  // login

  loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value;
      const user = users.find(u => u.name === username);

      if (user) {
          currentUser = user;
          loggedInUserDisplay.textContent = user.name;
      } else {
          alert('User not found!');
      }
  });

  // placement pions

  steps.forEach(step => {
      step.addEventListener('change', (e) => {
          if (currentUser && e.target.checked) {
              currentUser.position += 1;
              currentUser.stepsCompleted += 1;

              if (currentUser.position > 12) {
                  currentUser.position = 1;
                  currentUser.timesCompleted += 1;
                  currentUser.stepsCompleted = 0;
                  steps.forEach(step => step.checked = false);
                  setCompletedAppearance(currentUser);
              }

              movePawn(currentUser);
              saveUsers();
          }
      });
  });

  function displayUser(user) {
      const pawn = createPawn(user);
      displayUserOnBoard(user, pawn);
      displayUserInParticipants(user);
  }

  function createPawn(user) {
      const pawn = document.createElement('div');
      pawn.classList.add('pawn');
      pawn.style.backgroundImage = `url(${user.pawn})`;
      pawn.dataset.username = user.name;
      pawn.dataset.userId = users.indexOf(user);
      pawn.addEventListener('click', showStats);
      if (user.timesCompleted > 0) {
          setCompletedAppearance(user, pawn);
      }
      return pawn;
  }

  function displayUserOnBoard(user, pawn) {
      document.getElementById(`case${user.position}`).appendChild(pawn);
  }

  function displayUserInParticipants(user) {
      const existingParticipantDiv = participantsDiv.querySelector(`.participant[data-username="${user.name}"]`);
      if (existingParticipantDiv) {
          existingParticipantDiv.remove();
      }

      const participantDiv = document.createElement('div');
      participantDiv.classList.add('participant');
      participantDiv.dataset.username = user.name;
      const pawnClone = createPawn(user);
      participantDiv.appendChild(pawnClone);
      participantsDiv.appendChild(participantDiv);
  }

  function movePawn(user) {
      const currentPawn = document.querySelector(`#board .pawn[data-username="${user.name}"]`);
      if (currentPawn) {
          currentPawn.remove();
      }
      const newPawn = createPawn(user);
      displayUserOnBoard(user, newPawn);

      const participantDiv = participantsDiv.querySelector(`.participant[data-username="${user.name}"]`);
      if (participantDiv) {
          participantDiv.firstChild.remove();
          const pawnClone = createPawn(user);
          participantDiv.appendChild(pawnClone);
      }
  }

  // stats overlay

  function showStats(e) {
      const username = e.target.dataset.username;
      const user = users.find(u => u.name === username);

      if (user) {
          modalTitle.textContent = `${user.name}'s Stats`;
          modalContent.innerHTML = `
              <p>Case Number: ${user.position}</p>
              <p>Steps Completed: ${user.stepsCompleted}</p>
              <p>Times Completed: ${user.timesCompleted}</p>
          `;
          modal.style.display = 'block';
      }
  }

  // completion stars

  function setCompletedAppearance(user, pawn = null) {
      if (!pawn) {
          pawn = document.querySelector(`.pawn[data-username="${user.name}"]`);
      }

      if (pawn) {
          pawn.style.border = '2px solid gold';
          let starContainer = pawn.querySelector('.stars');
          if (!starContainer) {
              starContainer = document.createElement('div');
              starContainer.classList.add('stars');
              pawn.appendChild(starContainer);
          }
          starContainer.innerHTML = '';
          for (let i = 0; i < user.timesCompleted; i++) {
              const star = document.createElement('span');
              star.textContent = '★';
              star.classList.add('star');
              starContainer.appendChild(star);
          }
      }
  }

  // modal

  closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
      if (e.target === modal) {
          modal.style.display = 'none';
      }
  });

  loadUsers();
});
