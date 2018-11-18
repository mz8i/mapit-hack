(function() {

    const timeUpdatePeriod = 1000;
    
    window.watchTime = function (success, error, options) {
        setInterval(() => {
            let currentTime = new Date();
            if (success) success(currentTime);
        }, timeUpdatePeriod);
    };
})();