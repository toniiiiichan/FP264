document.addEventListener('DOMContentLoaded', async function () {
    const username = sessionStorage.username;
    const form = document.getElementById("itinerary-form");
    const urlParams = new URLSearchParams(window.location.search);
    const itineraryId = urlParams.get('id');

    try {
        if (!itineraryId || !username) {
            console.error("Missing itineraryId or username");
            alert("Error: Missing parameters.");
            return;
        }

        const response = await fetch(`/itinerary?itineraryId=${itineraryId}&username=${username}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const results = await response.json();
        const itineraryDetails = results.itinerary;

        if(itineraryDetails == "User does not have access" ) {
            console.error("User does not have access to update this itinerary");
            return;
        } else {
            let accessUsers = JSON.parse(itineraryDetails.access_usernames);
            document.getElementById('title').defaultValue = itineraryDetails.title;
            document.getElementById('description').defaultValue = itineraryDetails.description;
            document.getElementById('access_users').defaultValue = accessUsers;
        }
        
        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const accessUsers = document.getElementById('access_users').value;

            console.log(username);
            console.log(title);
            console.log(description);
            console.log(accessUsers);
            try {
                const response = await fetch('/update_itinerary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accessUsers, title, description, itineraryId })
                });

                const data = await response.json();
                console.log(data);

                if (response.ok) {
                    // Redirect to the homepage or refresh the current page
                    window.location.href = '/itinerary.html?id=' + itineraryId;
                } else {
                    alert(data.error || 'Updating itinerary failed');
                }
            } catch (error) {
                console.log('Error updating itinerary:', error);
                alert('An error occurred during itinerary updating.');
            }
        });
    } catch (error) {
        console.error("Error updating itinerary page:", error.message);
        alert('User does not have access to this page');
        window.location.href = '/';
    }
});
