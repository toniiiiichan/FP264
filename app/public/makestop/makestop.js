document.addEventListener('DOMContentLoaded', async function () {
    const dropdown = document.getElementById("dropdown");
    const username = sessionStorage.username;
    const form = document.getElementById("stop-form");

    try {
        let response = await fetch('/get_user_itineraries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({username})
        });

        let data = await response.json();
        console.log(data);
        let itineraries = data.itineraries;

        if (itineraries.length > 0) {
            console.log(itineraries);
            console.log(itineraries[0].title);

            for (const itinerary of itineraries) {
                let option = document.createElement("option");
                option.textContent = itinerary.title;
                option.value = itinerary.itinerary_id;
                dropdown.append(option);
            }
        }
    } catch (error) {
        console.log('Error creating stop:', error);
        alert('An error occurred during stop creation.');
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const accessUsers = document.getElementById('access_users').value;

        const address = document.getElementById('address').value;
        const country = document.getElementById('country').value;
        const state_province = document.getElementById('state-province').value;
        const city = document.getElementById('city').value;
        const zip = document.getElementById('zip').value;

        const location = `${address}, ${state_province}, ${city} ${zip}, ${country}}`
        const assignedItinerary = document.getElementById('dropdown').value;
        const dateStart = document.getElementById('date-start').value;
        const dateEnd = document.getElementById('date-end').value;
        const notes = document.getElementById('note').value;
    
    
        console.log(username);
        console.log('assigned itinerary:', assignedItinerary);
        console.log(title);
        console.log(location);
        console.log(dateStart);
        console.log(dateEnd);
        console.log(notes);

        try {
            response = await fetch('/make_stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({username, accessUsers, title, assignedItinerary, location, dateStart, dateEnd, notes})
            });

            data = await response.json();
            console.log(data); 

            if (response.ok) {
                // Redirect to the homepage or refresh the current page
                window.location.href = '/stop.html?id=' + data.id;
            } else {
                alert(data.error || 'Making a stop failed');
            }
        } catch (error) {
            console.log('Error creating stop:', error);
            alert('An error occurred during stop creation.');
        }
    });
});