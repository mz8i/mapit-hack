(function() {
  const routing = {
    currentTime: 0,
    lastLocation: {
      lat: 0,
      lng: 0,
      heading: 0
    },
    finalDestination: null,
    arrivalTime: null,
  };
  window.routing = routing;

  routing.setFinalDestination = position => {
    logger.log(`ROUTING|setting final destination to [${position.lat}, ${position.lng}]`);
    routing.finalDestination = position;
    map.setFinalDestination(position);
  };

  routing.setArrivalTime = time => {
    logger.log(`ROUTING|setting arrival time to ${time}`);
    routing.arrivalTime = time;

    (async function() {
      const route = await api.route(routing.lastLocation, routing.finalDestination);
      logger.log(`ROUTING|routed [${routing.lastLocation.lat}, ${routing.lastLocation.lng}] to [${routing.lastLocation.lat}, ${routing.lastLocation.lng}]`, route);
      map.setRoute(route.shape.map(point => {
        const position = point.split(',');
        return {
          lat: position[0],
          lng: position[1],
        };
      }));

      const indexSegmentsLength = route.shape.length / (config.bigPoiSegments + 1);
      const bigPois = [];
      const bigPoisPositions = [];

      let index = Math.floor(indexSegmentsLength);
      while (index < route.shape.length) {
        const position = route.shape[index].split(',');
        const midpoint = {
          lat: position[0],
          lng: position[1],
        };
        
        const pois = await api.pois(midpoint, 500, 'sights-museums,natural-geographical');
        logger.log(`ROUTING|searched for big pois near [${midpoint.lat}, ${midpoint.lng}]`, pois);
        const filteredPois = pois.filter(poi =>
          (bigPoisPositions.indexOf(poi.position[0] + poi.position[1]) === -1) &&
          (config.allowedCategories.indexOf(poi.category.id) > -1));
        
        let addedPois = 0;
        while ((addedPois < 2) && (addedPois < filteredPois.length)) {
          bigPois.push(filteredPois[addedPois]);
          bigPoisPositions.push(filteredPois[addedPois].position[0] + filteredPois[addedPois].position[1]);
          addedPois += 1;
        }

        index = Math.floor(index + indexSegmentsLength);
      }

      const parsedBigPois = bigPois.map(bigPoi => ({
        position: {
          lat: bigPoi.position[0],
          lng: bigPoi.position[1],
        },
        category: bigPoi.category.id,
        name: bigPoi.title,
      }));

      logger.log(`ROUTING|setting big pois`, parsedBigPois);
      map.setBigPois(parsedBigPois);
    })();
  }

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