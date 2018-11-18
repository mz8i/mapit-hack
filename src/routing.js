(function() {
  const routing = {
    lastLocation: {
      lat: 0,
      lng: 0,
    },
  };
  window.routing = routing;

  routing.setFinalDestination = position => {
    logger.log(`ROUTING|setting final destination to [${position.lat}, ${position.lng}]`);
    routing.finalDestination = position;
    map.setFinalDestination(position);
  };

  routing.onCurrentLocationChange = position => {
    const latDiff = position.lat - routing.lastLocation.lat;
    const lngDiff = position.lng - routing.lastLocation.lng;
    const diff = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    logger.log(`ROUTING|setting current location to [${position.lat}, ${position.lng}] (moved by ${diff})`);
    
    if (diff > config.moveThreshold) {
      routing.lastLocation = position;
      onMoved(position);
    }
  };

  function onMoved(position) {
    logger.log(`ROUTING|moved to [${position.lat}, ${position.lng}]`);
  }

})();