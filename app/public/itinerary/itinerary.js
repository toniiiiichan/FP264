document.addEventListener('DOMContentLoaded', async function () {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const itineraryBox = document.getElementById('itinerary-details')
        const itineraryId = urlParams.get('id');
        const username = sessionStorage.username;
        const websiteRole = sessionStorage.role;

        if (!itineraryId || !username) {
            console.error("Missing itineraryId or username");
            itineraryBox.innerHTML = "Error: Missing parameters.";
            return;
        }

        const response = await fetch(`/itinerary?itineraryId=${itineraryId}&username=${username}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const results = await response.json();
        const itineraryDetails = results.itinerary;

        console.log(itineraryDetails);
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
            `;
        }
    } catch (error) {
        console.error("Error fetching itinerary details:", error.message);
        alert('User does not have access to this page');
        window.location.href = '/';
    }
});
