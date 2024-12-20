document.addEventListener('DOMContentLoaded', async function () {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const stopBox = document.getElementById('stop-details')
        const stopId = urlParams.get('id');
        const username = sessionStorage.username;
        const role = sessionStorage.role;

        if (!stopId || !username) {
            console.error("Missing stopId or username");
            stopBox.innerHTML = "Error: Missing parameters.";
            return;
        }

        const response = await fetch(`/stop?stopId=${stopId}&username=${username}&role=${role}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const results = await response.json();
        const stopDetails = results.stop;

        console.log(stopDetails);
        if(stopDetails == "User does not have access" ) {
            console.log("User does not have access to view this stop");
        } else {
            const formatDate = (dateString) => {
                const options = {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                };
                return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
            };

            const arrivalFormatted = formatDate(stopDetails.arrival_date);
            const departureFormatted = formatDate(stopDetails.departure_date);

            stopBox.innerHTML = `
                <h2>${stopDetails.title}</h2>
                <h5> <a href="/updatestop.html?id=${stopDetails.stop_id}">Edit stop</a> </h5>
                <h4><a href="itinerary.html?id=${stopDetails.itinerary_id}">Connected itinerary</a></h2>
                <p>Location: ${stopDetails.location_name} </p>
                <p>Arrival Date: ${arrivalFormatted}</p>
                <p>Departure Date: ${departureFormatted}</p>
                <p>Notes: ${stopDetails.notes}</p>
            `;
        }
    } catch (error) {
        console.error("Error fetching stop details:", error.message);
        alert('User does not have access to this page');
        window.location.href = '/';
    }
});
