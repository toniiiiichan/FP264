document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById("stop-form");

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const username = sessionStorage.username;
        const title = document.getElementById('title').value;

        const address = document.getElementById('address').value;
        const country = document.getElementById('country').value;
        const state_province = document.getElementById('state-province').value;
        const city = document.getElementById('city').value;
        const zip = document.getElementById('zip').value;

        const location = `${address}, ${state_province}, ${city} ${zip}, ${country}}`
        const dateStart = document.getElementById('date-start').value;
        const dateEnd = document.getElementById('date-end').value;
        const notes = document.getElementById('note').value;
    
    
        console.log(username);
        console.log(title);
        console.log(location);
        console.log(dateStart);
        console.log(dateEnd);
        console.log(notes);

        try {
            const response = await fetch('/make_stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({username, title, location, dateStart, dateEnd, notes})
            });

            const data = await response.json();
            console.log(data); 

            if (response.ok) {
                // Redirect to the homepage or refresh the current page
                window.location.href = '/stop?id=' + data.id;
            } else {
                alert(data.error || 'Making a stop failed');
            }
        } catch (error) {
            console.log('Error creating stop:', error);
            alert('An error occurred during stop creation.');
        }
    });
});
