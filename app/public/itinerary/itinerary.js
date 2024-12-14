document.addEventListener('DOMContentLoaded', async function () {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const itineraryBox = document.getElementById('itinerary-details')
        const stopsBox = document.getElementById('stop-details')
        const itineraryId = urlParams.get('id');
        const username = sessionStorage.username;
        const role = sessionStorage.role;

        if (!itineraryId || !username) {
            console.error("Missing itineraryId or username");
            alert("Error: Missing parameters.");
            return;
        }

        const response = await fetch(`/itinerary?itineraryId=${itineraryId}&username=${username}&role=${role}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const results = await response.json();
        const itineraryDetails = results.itinerary;
        const stopDetails = results.stops;

        console.log(itineraryDetails);
        console.log(stopDetails);
        if(itineraryDetails == "User does not have access" ) {
            console.error("User does not have access to view this itinerary");
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

            itineraryBox.innerHTML = `
                <h2>${itineraryDetails.title}</h2>
                <p>Description: ${itineraryDetails.description}</p>
                <h5> <a href="/updateitinerary.html?id=${itineraryDetails.itinerary_id}">Edit itinerary</a> </h5>
            `;

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
                    <p>Notes: ${stop.notes}</p>
                `;
                stopsBox.append(div);
                }
            }
        }
    } catch (error) {
        console.error("Error fetching itinerary details:", error.message);
        alert('User does not have access to this page');
        window.location.href = '/';
    }
});
