document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById("itinerary-form");

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const username = sessionStorage.username;
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
    
        console.log(username);
        console.log(title);
        console.log(description);
        try {
            const response = await fetch('/make_itinerary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({username, title, description})
            });

            const data = await response.json();
            console.log(data); 

            if (response.ok) {
                // Redirect to the homepage or refresh the current page
                window.location.href = '/itinerary?id=' + data.id;
            } else {
                alert(data.error || 'Making a itinerary failed');
            }
        } catch (error) {
            console.log('Error creating an itinerary:', error);
            alert('An error occurred during itinerary creation.');
        }
    });
});
