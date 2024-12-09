document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById("signup-form");

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const verifyPassword = document.getElementById('verify-password').value;
        console.log('email:', email);
        console.log('username:', username);
        console.log('password:', password);
        console.log('verify:', verifyPassword);

        function passwordRequirements(password) {
            const charMin = 8;
            const charMax = 20;
            const upperCase = /[A-Z]/;
            const numbers = /[0-9]/;
    
            return password.length >= charMin &&
                password.length <= charMax &&
                upperCase.test(password) &&
                numbers.test(password);
        }

        try {
            // Check if the password meets the requirements
            if (!passwordRequirements(password)) {
                alert('Password must be between 8 to 20 characters in length, contain at least 1 uppercase letter and 1 number.', 'error');
                return;
            }
            else if(password !== verifyPassword) {
                alert('Passwords are not equal');
                return;
            }
    
            // Attempt to create the account
            const signUpResponse = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, username, password }),
            });
    
            const signUpResult = await signUpResponse.json();
    
            if (signUpResponse.ok) {
                alert('Account created successfully! You can now login.', 'success');
                // Optionally, redirect the user to the login page after a short delay
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 3000);
            } else {
                alert(signUpResult.error || 'Failed to create account. Please try again.', 'error');
            }
    
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the account.', 'error');
        };
    })
});