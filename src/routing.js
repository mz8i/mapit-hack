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
    const distance = distanceInMeters(position, routing.lastLocation);
    const time = distance / config.velocity;

    logger.log(`ROUTING|setting current location to [${position.lat}, ${position.lng}] (moved by ${distance.toFixed(2)}m in ${time.toFixed(2)}s)`);
    
    if (distance > config.moveThreshold) {
      routing.lastLocation = position;
      onMoved(position);
      routing.onCurrentTimeChange(routing.currentTime + time);
    }
  };

  routing.onCurrentTimeChange = time => {
    routing.currentTime = time;
  };

  function onMoved(position) {
    logger.log(`ROUTING|moved to [${position.lat}, ${position.lng}]`);
    map.setCurrentLocation(position);
  }

  function distanceInMeters(position1, position2) {
    const { lat: lat1, lng: lon1} = position1;
    const { lat: lat2, lng: lon2 } = position2;
    const unit = 'K';

    if ((lat1 == lat2) && (lon1 == lon2)) {
      return 0;
    }
    else {
      var radlat1 = Math.PI * lat1/180;
      var radlat2 = Math.PI * lat2/180;
      var theta = lon1-lon2;
      var radtheta = Math.PI * theta/180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
          dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180/Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit=="K") { dist = dist * 1.609344 * 1000 }
      if (unit=="N") { dist = dist * 0.8684 }
      return dist;
    }
  }

})();