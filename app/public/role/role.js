document.addEventListener('DOMContentLoaded', function () {
    let roleInfoBox = document.getElementById("role-info");
    let form = document.getElementById("role-form");
    roleInfoBox.innerHTML = `<p>Your current role: ${sessionStorage.role}</p>`;

    document.getElementById("dropdown").defaultValue = sessionStorage.role;
    
    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        let chosenRole = document.getElementById("dropdown").value;
        console.log(chosenRole);
        const username = sessionStorage.username

        response = await fetch('/update_role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({username, chosenRole})
        });

        const data = await response.json();
        console.log(data); 

        sessionStorage.setItem('role', data.role);
        window.location.href = '/';
    });
});