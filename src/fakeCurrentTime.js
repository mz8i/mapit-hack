(function() {

    let progressTime = false;
    let lastTrueTime = new Date();

    let currentFakeTime = lastTrueTime;

    let timeSuccess;

    window.setFakeTime = function(fakeTime) {
        currentFakeTime = fakeTime;
        if (timeSuccess) timeSuccess(currentFakeTime);
    };

    window.shiftFakeTime = function(deltaTimeMillis) {
        currentFakeTime.setMilliseconds(currentFakeTime.getMilliseconds() + deltaTimeMillis);

        if (timeSuccess) timeSuccess(currentFakeTime);
    }

    window.resetFakeToTrueTime = function() {
        currentFakeTime = new Date();
    }

    window.followTrueTime = function(doFollow) {
        progressTime = doFollow;
    }

    setInterval(() => {
        let currentTrueTime = new Date();
        let dt = (currentTrueTime.getTime() - lastTrueTime.getTime());
        lastTrueTime = currentTrueTime;
        if(progressTime) {
            window.shiftFakeTime(dt);
        }
    }, 1000);


    window.watchTime = function (success, error, options) {
        timeSuccess = success;
    };

})();