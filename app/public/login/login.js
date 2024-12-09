document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById("login-form");

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
    
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
    
        console.log(email);
        console.log(password);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            });

            const data = await response.json();
            console.log(data); 

            if (response.ok) {
                // Store the username in sessionStorage
                sessionStorage.setItem('username', data.username);
                sessionStorage.setItem('email', data.email);
                sessionStorage.setItem('role', data.role);
                console.log('Username stored in sessionStorage:', sessionStorage.getItem('username'));


                // Redirect to the homepage or refresh the current page
                window.location.href = '/index.html';
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (error) {
            console.log('Error during login:', error);
            alert('An error occurred during login.');
        }
    });
});
