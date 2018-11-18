(function() {

    const timeUpdatePeriod = 1000;
    
    window.watchTime = function (success, error, options) {
        setInterval(() => {
            let currentTime = Date.now();
            if (success) success(currentTime);
        }, timeUpdatePeriod);
    };
})();