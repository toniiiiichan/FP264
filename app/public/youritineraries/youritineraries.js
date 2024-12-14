document.addEventListener('DOMContentLoaded', async function () {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const itinerariesBox = document.getElementById('itineraries')
        const username = sessionStorage.username;
        const role = sessionStorage.role;

        if (!username) {
            console.error("Missing username");
            return;
        }

        console.log(username);
        const response = await fetch(`/user_itineraries?username=${username}&role=${role}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const results = await response.json();
        const itineraryDetails = results.itineraries;

        console.log(itineraryDetails);

        if(itineraryDetails.length > 0) {
            for(itinerary of itineraryDetails) {
                let div = document.createElement("div");
                div.innerHTML = `
                <h4> <a href="/itinerary.html?id=${itinerary.itinerary_id}">${itinerary.title}</a> </h4>
                <p> ${itinerary.description} </p>
            `;
            itinerariesBox.append(div);
            }
        }

    } catch (error) {
        console.error("Error fetching itinerary details:", error.message);
        alert('User does not have access to this page');
        window.location.href = '/';
    }
});
