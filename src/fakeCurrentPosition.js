(function () {

    let lastPosition;
    let shiftTimeWhenMoving = false;

    let positionSuccess;

    window.initFakePositionMapClick = map => {
        map.instance.addEventListener('tap', function (evt) {
            if (evt.originalEvent.button === 2) {
                let position = (map.instance.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY));
                setFakePosition({
                    lat: position.lat,
                    lng: position.lng,
                    heading: 0
                });
            }
        });
    };

    // ties the progression of time to movement
    window.setShiftTimeWhenMoving = function (doShiftTime) {
        if (doShiftTime && !window.shiftFakeTime) throw 'Cannot tie time to fake position because no fake time set up!';
        shiftTimeWhenMoving = doShiftTime;
    };

    window.setFakePosition = function (fakePosition) {
        if (lastPosition && shiftTimeWhenMoving) {
            let distance = distanceInMeters(lastPosition, fakePosition);
            let dtMillis = distance / config.velocity * 1000;

            // set 0 timeout to run time update after position update
            setTimeout(() => window.shiftFakeTime(dtMillis), 0);
        }

        lastPosition = fakePosition;
        if (positionSuccess) positionSuccess(fakePosition);
    };

    window.watchPosition = function (success, error, options) {
        positionSuccess = success;
    };
})();