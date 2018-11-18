(function() {
  const routing = {
    currentTime: new Date().getTime(),
    lastLocation: {
      lat: 0,
      lng: 0,
      heading: 0
    },
    currentDestination: null,
    finalDestination: null,
    arrivalTime: null,
    bigPois: [],
  };
  window.routing = routing;

  routing.setFinalDestination = position => {
    logger.log(`ROUTING|setting final destination to [${position.lat}, ${position.lng}]`);
    routing.finalDestination = position;
    map.setFinalDestination(position);
  };

  routing.setCurrentDestination = position => {
    logger.log(`ROUTING|setting current destination to [${position.lat}, ${position.lng}]`);
    routing.currentDestination = position;
    
    if (routing.lastLocation && routing.currentDestination) {
      (async function() {
        const route = await api.route(routing.lastLocation, routing.currentDestination);
        logger.log(`ROUTING|routed [${routing.lastLocation.lat}, ${routing.lastLocation.lng}] to [${routing.lastLocation.lat}, ${routing.lastLocation.lng}]`, route);
        map.setRoute(route.shape.map(point => {
          const position = point.split(',');
          return {
            lat: position[0],
            lng: position[1],
          };
        }));
      })();
    }
  }

  routing.setArrivalTime = time => {
    logger.log(`ROUTING|setting arrival time to ${time} (${time.getTime()})`);
    routing.arrivalTime = time.getTime();

    (async function() {
      const route = await api.route(routing.lastLocation, routing.finalDestination);
      logger.log(`ROUTING|routed [${routing.lastLocation.lat}, ${routing.lastLocation.lng}] to [${routing.lastLocation.lat}, ${routing.lastLocation.lng}]`, route);
      // // we do not want to display route to final destination
      // map.setRoute(route.shape.map(point => {
      //   const position = point.split(',');
      //   return {
      //     lat: position[0],
      //     lng: position[1],
      //   };
      // }));

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
        
        const pois = await api.pois(midpoint, 500, config.allowedCategories.join(','));
        logger.log(`ROUTING|searched for big pois near [${midpoint.lat}, ${midpoint.lng}]`, pois);
        const filteredPois = pois.filter(poi =>
          (bigPoisPositions.indexOf(poi.position[0] + poi.position[1]) === -1) &&
          (config.allowedCategories.indexOf(poi.category.id) > -1));
        
        let addedPois = 0;
        while ((addedPois < 20) && (addedPois < filteredPois.length)) {
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
      routing.bigPois.splice(0, routing.bigPois.length);
      routing.bigPois.push(...parsedBigPois);

      if (routing.lastLocation && (routing.currentDestination || routing.finalDestination)) {
        const destination = routing.currentDestination || routing.finalDestination;
        const routeToDestination = await api.route(routing.lastLocation, destination);
        const originalTimeToDestination = routeTime(routeToDestination);

        for (let i = 0 ; i < routing.bigPois.length ; i++) {
          const bigPoi = routing.bigPois[i];
          const routeToBigPoi = await api.route(routing.lastLocation, bigPoi.position);
          const routeToTarget = await api.route(bigPoi.position, destination);
          const alternativeTime = routeTime(routeToBigPoi) + routeTime(routeToTarget);
          routing.bigPois[i].detourTime = (alternativeTime - originalTimeToDestination) * 1000;
          routing.bigPois[i].freeTime = ((routing.arrivalTime - routing.currentTime) - alternativeTime * 1000);
        }
        map.setBigPois(routing.bigPois);
      }

      // map.setBigPois(parsedBigPois);
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

    (async function() {
      if (routing.lastLocation && routing.currentDestination) {
        const route = await api.route(routing.lastLocation, routing.currentDestination);
        logger.log(`ROUTING|routed [${routing.lastLocation.lat}, ${routing.lastLocation.lng}] to [${routing.lastLocation.lat}, ${routing.lastLocation.lng}]`, route);
        
        const distance = distanceInMeters(routing.lastLocation, routing.currentDestination);
        if (distance > config.routeEndThreshold) {
          map.setRoute(route.shape.map(point => {
            const position = point.split(',');
            return {
              lat: position[0],
              lng: position[1],
            };
          }));
        } else {
          routing.currentDestination = null;
          map.setRoute(null);
        }
      }

      if (routing.lastLocation && (routing.currentDestination || routing.finalDestination)) {
        const destination = routing.currentDestination || routing.finalDestination;
        const routeToDestination = await api.route(routing.lastLocation, destination);
        const originalTimeToDestination = routeTime(routeToDestination);

        for (let i = 0 ; i < routing.bigPois.length ; i++) {
          const bigPoi = routing.bigPois[i];
          const routeToBigPoi = await api.route(routing.lastLocation, bigPoi.position);
          const routeToTarget = await api.route(bigPoi.position, routing.finalDestination);
          const alternativeTime = routeTime(routeToBigPoi) + routeTime(routeToTarget);
          routing.bigPois[i].detourTime = (alternativeTime - originalTimeToDestination) * 1000;
          routing.bigPois[i].freeTime = ((routing.arrivalTime - routing.currentTime) - alternativeTime * 1000);
          logger.log(`POI: ${bigPoi.name}`, 'CURRENT', new Date(routing.currentTime), 'ARRIVAL', new Date(routing.arrivalTime), 'FREE TIME', routing.arrivalTime - routing.currentTime, 'ALTERNATIVE TIME', alternativeTime);
        }
        map.setBigPois(routing.bigPois);
      }
    })();
  }

  function routeTime(route) {
    return route.leg[0].maneuver.reduce((prev, current) => prev + current.travelTime, 0);
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