document.addEventListener('DOMContentLoaded', async function () {
    const dropdown = document.getElementById("dropdown");
    const form = document.getElementById("stop-form");
    const urlParams = new URLSearchParams(window.location.search);
    const stopId = urlParams.get('id');
    const username = sessionStorage.username;
    const role = sessionStorage.role;

    if (role == "Free") {
        alert("You cannot update the stop as you are a free user")
        window.location.href = '/';
        return;
    }

    let response = await fetch(`/stop?stopId=${stopId}&username=${username}&role=${role}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const results = await response.json();
    const stopDetails = results.stop;

    if(stopDetails == "User does not have access" ) {
        console.error("User does not have access to update this itinerary");
        return;
    } else {
        let accessUsers = JSON.parse(stopDetails.access_usernames);
        document.getElementById('title').defaultValue = stopDetails.title;
        document.getElementById('access_users').defaultValue = accessUsers;

        const timestamp = "2024-12-15T01:10:00.000Z"; // Example from PostgreSQL
        const formattedTimestamp = new Date(timestamp).toISOString().slice(0, 16); // Removes 'Z' and trims to `yyyy-MM-ddTHH:mm`
        document.getElementById('date-start').defaultValue = new Date(stopDetails.arrival_date).toISOString().slice(0, 16);
        document.getElementById('date-end').defaultValue = new Date(stopDetails.departure_date).toISOString().slice(0, 16);
        if (stopDetails.notes) {
            document.getElementById('notes').defaultValue = stopDetails.notes;
        }

        const fullAddress = stopDetails.location_name;
        console.log(fullAddress);
                // Split the address into parts
        const parts = fullAddress.split(',');

        if (parts.length === 4) {
            const address = parts[0].trim();
            const city = parts[1].trim();
            const [state, zipCode] = parts[2].trim().split(' ');
            const country = parts[3].trim();

            console.log({ address, city, state, zipCode, country });

            document.getElementById('address').defaultValue = address;
            document.getElementById('zip').defaultValue = zipCode;
            document.getElementById('state-province').defaultValue = state;
            document.getElementById('city').defaultValue = city;
            document.getElementById('country').defaultValue = country;
        } else {
            console.error("Address format is not valid!");
        }
    }

    try {
        const response = await fetch(`/get_user_itineraries?username=${username}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const results = await response.json();
        const itineraryDetails = results.itineraries;

        if (itineraryDetails.length > 0) {
            console.log(itineraryDetails);
            console.log(itineraryDetails[0].title);

            for (const itinerary of itineraryDetails) {
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

        const location = `${address}, ${state_province}, ${city} ${zip}, ${country}`
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
            response = await fetch('/update_stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({stopId, accessUsers, title, assignedItinerary, location, dateStart, dateEnd, notes})
            });

            const data = await response.json();
            console.log(data); 

            if (response.ok) {
                // Redirect to the homepage or refresh the current page
                window.location.href = '/stop.html?id=' + stopId;
            } else {
                alert(data.error || 'Updating the stop failed');
            }
        } catch (error) {
            console.log('Error updating stop:', error);
            alert('An error occurred during stop updating.');
        }
    });
});
