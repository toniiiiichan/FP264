document.addEventListener('DOMContentLoaded', async function () {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const stopBox = document.getElementById('stop-details')
        const username = sessionStorage.username;
        const role = sessionStorage.role;

        if (!username) {
            console.error("Missing username");
            return;
        }

        const response = await fetch(`/user_stops?username=${username}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const results = await response.json();
        const stopDetails = results.stops;

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

        if(stopDetails.length > 0) {
            for(stop of stopDetails) {
                let arrivalFormatted = formatDate(stop.arrival_date);
                let departureFormatted = formatDate(stop.departure_date);

                let div = document.createElement("div");
                div.innerHTML = `
                <h4> <a href="/stop.html?id=${stop.stop_id}">${stop.title}</a> </h4>
                <p>Location: ${stop.location_name}</p>
                <p>Arrival Date: ${arrivalFormatted}</p>
                <p>Departure Date: ${departureFormatted}</p>
            `;
            stopBox.append(div);
            }
        }
        console.log(stopDetails);

    } catch (error) {
        console.error("Error fetching stop details:", error.message);
        alert('User does not have access to this page');
        window.location.href = '/';
    }
});
