(function() {
    window.watchPosition = function(success, error, options) {
        navigator.geolocation.watchPosition(success, error, options);
    };
})();


