(function () {

    let positionSuccess;

    window.setFakePosition = function (fakePosition) {
        if (positionSuccess) positionSuccess(fakePosition);
    };

    window.watchPosition = function (success, error, options) {
        positionSuccess = success;
    };
})();