(function() {

    // main state of the application
    let finalDestination = null,
        arrivalTime = null,
        currentDestination = null,
        currentTime = new Date(); // TODO need to set this to sth else?


    // helper functions to show and hide elements

    function show(element) {
        element.classList.remove('hidden');
    }

    function hide(element) {
        element.classList.add('hidden');
    }

    // setting destination

    let destinationInput = document.getElementById('destination-input');

    async function setFinalDestination(destinationString) {
        let destinationPosition = await api.geocode(destinationString);
        finalDestination = destinationPosition;

        if (finalDestination) {
            hide(destinationInput);
            show(timeInputContainer);

            routing.setFinalDestination(finalDestination);
        }
    }

    destinationInput.addEventListener('keydown', e => {
        e = e || window.event;
        if (e.key === 'Enter') {
            setFinalDestination(destinationInput.value);
        }
    });

    // setting arrival time

    let timeInputContainer = document.getElementById('time-input-container');
    let arrivalTimeInput = document.getElementById('time-input');
    let defaultArrivalDate = new Date(currentTime.getTime());
    defaultArrivalDate.setHours(currentTime.getHours() + 2);
    let arrivalTimePicker = new Picker(arrivalTimeInput, {
        date: defaultArrivalDate,
        format: 'HH:mm',
        inline: true,
        rows: 1
    });

    function updateTimePicker(currentTime) {
        if (arrivalTimePicker.getDate() < currentTime) {
            arrivalTimePicker.setDate(currentTime);
        }
    }

    function setArrivalTime(time) {
        arrivalTime = time;
        hide(timeInputContainer);
        initialiseExploration();
    }

    let goButton = document.getElementById('go-btn');
    goButton.addEventListener('click', e => {
        setArrivalTime(arrivalTimePicker.getDate());
    });

    // routing initialisation

    function initialiseExploration() {
        map.setFollowCurrentLocation(true);
        routing.setArrivalTime(arrivalTime);
    }
    
    watchTime(time => {
        currentTime = time;
        console.log({time});
        if (!arrivalTime) updateTimePicker(time)
        else routing.onCurrentTimeChange(time);
    });

    watchPosition(position => {
        console.log({position});
        map.setCurrentLocation(position);
        routing.onCurrentLocationChange(position);

    });

})();