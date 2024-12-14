document.addEventListener('DOMContentLoaded', async function () {
    const username = sessionStorage.getItem('username');
    const response = await fetch(`/get_user_role?username=${username}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const results = await response.json();
    console.log(results.role);
    
    sessionStorage.setItem('role', results.role);
})