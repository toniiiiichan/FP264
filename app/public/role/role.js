document.addEventListener('DOMContentLoaded', function () {
    let roleInfoBox = document.getElementById("role-info");

    roleInfoBox.innerHTML = `<p>Your current role: ${sessionStorage.role}</p>`;
});