(function() {

    // main state of the application
    let finalDestination = null,
        arrivalTime = null,
        currentDestination = null;


    // setting destination

    async function setFinalDestination(destinationString) {
        let destinationPosition = await api.geocode(destinationString);
        finalDestination = destinationPosition;
        // TODO
        console.log(finalDestination);
    }

    let destinationInput = document.getElementById('destination-input');
    destinationInput.addEventListener('keydown', e => {
        e = e || window.event;
        if (e.key === 'Enter') {
            setFinalDestination(destinationInput.value);
        }
    });


    // setting arrival time

    new Picker(document.querySelector('.js-time-picker'), {
        format: 'HH:mm',
        inline: true,
        rows: 1
    });


    let cancelButton = document.getElementById('cancel-destination-btn');
    
    function showDestinationCancelButton(doShow) {
        if (doShow) {
            cancelButton.classList.remove('hidden');
        } else {
            cancelButton.classList.add('hidden');
        }
    }
    
    window.updateCurrentDestination = function(destination) {
        currentDestination = destination;

        if(currentDestination) {
            showDestinationCancelButton(true);
        } else {
            showDestinationCancelButton(false);
        }
    };

})();