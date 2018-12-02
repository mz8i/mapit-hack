(function() {
    window.watchPosition = function(success, error, options) {

        function wrappedSuccess(position) {
            success({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                heading: position.coords.heading
            });
        };
        
        navigator.geolocation.watchPosition(wrappedSuccess, error, options);
    };
})();


