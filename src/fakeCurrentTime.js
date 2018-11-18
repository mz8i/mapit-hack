(function() {

    let timeSuccess;

    window.setFakeTime = function(fakeDateNow) {
        if (timeSuccess) timeSuccess(fakeDateNow);
    };

    window.watchTime = function (success, error, options) {
        timeSuccess = success;
    };
})();