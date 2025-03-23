document.addEventListener('DOMContentLoaded', () => {
    const addAirAircraftBtn = document.getElementById('addAirAircraft');
    const addGroundAircraftBtn = document.getElementById('addGroundAircraft');
    const addEmergencyAirAircraftBtn = document.getElementById('addEmergencyAirAircraft');
    const addEmergencyGroundAircraftBtn = document.getElementById('addEmergencyGroundAircraft');
    const runwayStatus = document.getElementById('runwayStatus');
    const inAirList = document.getElementById('inAirList');
    const groundList = document.getElementById('groundList');

    // Function to update the UI
    function updateUI(aircraft) {
        // Update runway status
        const landingAircraft = aircraft.find(a => a.status === 'landing');
        const takeoffAircraft = aircraft.find(a => a.status === 'takeoff');
        
        if (landingAircraft) {
            runwayStatus.innerHTML = `Aircraft ${landingAircraft.flight_number} is currently landing (Distance: ${landingAircraft.distance.toFixed(2)} nm)`;
            runwayStatus.className = `alert ${landingAircraft.is_emergency ? 'alert-danger' : 'alert-warning'}`;
        } else if (takeoffAircraft) {
            runwayStatus.innerHTML = `Aircraft ${takeoffAircraft.flight_number} is currently taking off`;
            runwayStatus.className = `alert ${takeoffAircraft.is_emergency ? 'alert-danger' : 'alert-success'}`;
        } else {
            runwayStatus.innerHTML = 'No aircraft currently using the runway';
            runwayStatus.className = 'alert alert-info';
        }

        // Update in-air list
        const inAirAircraft = aircraft.filter(a => a.status === 'in_air');
        inAirList.innerHTML = inAirAircraft.map(a => `
            <div class="list-group-item ${a.is_emergency ? 'list-group-item-danger' : ''} ${a.going_around ? 'list-group-item-warning' : ''}">
                <div class="aircraft-info">
                    <strong>${a.flight_number}</strong>
                    ${a.is_emergency ? '<span class="badge bg-danger">Emergency</span>' : ''}
                    ${a.going_around ? '<span class="badge bg-warning">Going Around</span>' : ''}
                    <div class="distance-info">
                        <span class="distance">Distance: ${a.distance.toFixed(2)} nm</span>
                        <span class="speed">Speed: ${a.speed} nm/s</span>
                    </div>
                    <div class="progress mt-2" style="height: 5px;">
                        <div class="progress-bar ${a.distance <= (a.is_emergency ? 5 : 2) ? 'danger' : ''} ${a.going_around ? 'warning' : ''}" role="progressbar" 
                             style="width: ${(a.distance / 10 * 100)}%" 
                             aria-valuenow="${a.distance}" 
                             aria-valuemin="0" 
                             aria-valuemax="10"></div>
                    </div>
                    ${a.distance <= (a.is_emergency ? 5 : 2) && !a.going_around ? '<small class="text-danger">Ready to land</small>' : ''}
                </div>
            </div>
        `).join('');

        // Update ground list
        const groundAircraft = aircraft.filter(a => a.status === 'ground');
        groundList.innerHTML = groundAircraft.map(a => `
            <div class="list-group-item ${a.is_emergency ? 'list-group-item-danger' : ''}">
                <div class="aircraft-info">
                    <strong>${a.flight_number}</strong>
                    ${a.is_emergency ? '<span class="badge bg-danger">Emergency</span>' : ''}
                    <small class="text-success">Ready for takeoff</small>
                </div>
            </div>
        `).join('');
    }

    // Function to fetch aircraft data
    async function fetchAircraft() {
        try {
            const response = await fetch('/api/aircraft');
            const aircraft = await response.json();
            updateUI(aircraft);
        } catch (error) {
            console.error('Error fetching aircraft:', error);
        }
    }

    // Add new air aircraft
    addAirAircraftBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/aircraft', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_ground: false, is_emergency: false })
            });
            fetchAircraft();
        } catch (error) {
            console.error('Error adding aircraft:', error);
        }
    });

    // Add new ground aircraft
    addGroundAircraftBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/aircraft', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_ground: true, is_emergency: false })
            });
            fetchAircraft();
        } catch (error) {
            console.error('Error adding aircraft:', error);
        }
    });

    // Add new emergency air aircraft
    addEmergencyAirAircraftBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/aircraft', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_ground: false, is_emergency: true })
            });
            fetchAircraft();
        } catch (error) {
            console.error('Error adding aircraft:', error);
        }
    });

    // Add new emergency ground aircraft
    addEmergencyGroundAircraftBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/aircraft', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_ground: true, is_emergency: true })
            });
            fetchAircraft();
        } catch (error) {
            console.error('Error adding aircraft:', error);
        }
    });

    // Initial fetch
    fetchAircraft();
    
    // Refresh every second to match backend updates
    setInterval(fetchAircraft, 1000);
}); 