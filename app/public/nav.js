fetch('nav.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById("navbar-placeholder").innerHTML = data;
    })
    .catch(error => console.error('Error loading the navbar:'  , error));

document.addEventListener("DOMContentLoaded", function () {
    fetch('nav.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data;
            updateUserAuthSection(); // Call this function after loading the navbar
        })
        .catch(error => console.error('Error loading the navbar:', error));
});

function updateUserAuthSection() {
    const username = sessionStorage.getItem('username');
    const role = sessionStorage.getItem('role');
    console.log('Username retrieved from sessionStorage:', username);
    console.log('Role retrieved from sessionStorage:', role);
    const userAuthSection = document.getElementById('login-options');

    if (username) {
        userAuthSection.innerHTML = `
                <span>Welcome, ${username}</span>
                <button onclick="logout()">Logout</button>
                <button onclick="makeStop()">Create Stop</button>
                <button onclick="makeItinerary()">Create Itinerary</button>
            `;
    } else {
        userAuthSection.innerHTML = `
                <a href="login.html">Login</a>
                <a href="signup.html">Register</a>
            `;
    }
}

function makeStop() {
    window.location.href = '/makestop.html';
}

function makeItinerary() {
    window.location.href = '/makeitinerary.html';
}

function logout() {
    sessionStorage.clear();
    window.location.href = '/index.html';
}