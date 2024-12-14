document.addEventListener('DOMContentLoaded', async function () {
    checkLoggedIn();
});

function checkLoggedIn() {
    const username = sessionStorage.getItem('username');
    console.log('Username retrieved from sessionStorage:', username);

    if (!username) {
        window.location.href = '/login.html';
    }
}

