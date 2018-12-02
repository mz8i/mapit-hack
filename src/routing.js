(function() {
  const routing = {
    currentTime: null,
    currentPosition: null,
    currentDestination: null,
    finalDestination: null,
    arrivalTime: null,
    bigPois: [],
    routeToCurrentDestination: null,
    routeToFinalDestination: null,
  };
  window.routing = routing;

  routing.setFinalDestination = position => {
    logger.log(`ROUTING|setting final destination to [${position.lat}, ${position.lng}]`);
    routing.finalDestination = position;
    map.setFinalDestination(position);
  };

  routing.setArrivalTime = time => {
    logger.log(`ROUTING|setting arrival time to ${time} (${time.getTime()})`);
    routing.arrivalTime = time.getTime();

    (async function() {

      routing.bigPois = await getBigPois(routing.currentPosition, routing.finalDestination, routing.arrivalTime);
      
      await updateRoutes(true, true);
      updateRouteTimes();

      map.setBigPois(routing.bigPois);
    })();
  };

  routing.setCurrentDestination = position => {
    logger.log(`ROUTING|setting current destination to [${position.lat}, ${position.lng}]`);
    routing.currentDestination = position;

    (async function () {
      await updateRoutes(false, true);
      updateRouteTimes();

      map.setRoute(getApiRouteAsPoints(routing.routeToCurrentDestination));
      map.setBigPois(routing.bigPois);
    })();
  };

  routing.onCurrentLocationChange = position => {

    if (!routing.currentPosition || distanceInMeters(position, routing.currentPosition) > config.moveThreshold) {
      routing.currentPosition = position;

      (async function() {
        if (routing.finalDestination) {
          await updateRoutes(true, false);
          updateRouteTimes();

          map.setRoute(getApiRouteAsPoints(routing.routeToCurrentDestination));
          map.setBigPois(routing.bigPois);
        }
      })();
    }
  };

  routing.onCurrentTimeChange = time => {
    routing.currentTime = time;

    if (routing.finalDestination) {
      updateRouteTimes();
  
      map.setBigPois(routing.bigPois);
    }
  };

  function getPoiKey(poi) {
    return `${poi.position[0]},${poi.position[1]}`;
  }

  async function getBigPois(currentLocation, finalDestination, arrivalTime) {
    const route = await api.route(currentLocation, finalDestination);
    logger.log(`ROUTING|routed [${currentLocation.lat}, ${currentLocation.lng}] to [${finalDestination.lat}, ${finalDestination.lng}]`, route);

    const indexSegmentsLength = route.shape.length / (config.bigPoiSegments + 1);
    const bigPois = [];
    const bigPoisPositions = new Set();

    let index = Math.floor(indexSegmentsLength);
    while (index < route.shape.length) {
      const position = route.shape[index].split(',');
      const midpoint = {
        lat: position[0],
        lng: position[1],
      };

      const pois = await api.pois(midpoint, 500, config.allowedCategories.join(','));
      // logger.log(`ROUTING|searched for big pois near [${midpoint.lat}, ${midpoint.lng}]`, pois);
      const filteredPois = pois.filter(poi =>
        !bigPoisPositions.has(getPoiKey(poi)) &&
        config.allowedCategories.includes(poi.category.id));

      let addedPois = 0;
      while ((addedPois < 20) && (addedPois < filteredPois.length)) {
        let apiPoi = filteredPois[addedPois];
        let poi = {
          position: {
            lat: apiPoi.position[0],
            lng: apiPoi.position[1]
          },
          category: apiPoi.category.id,
          name: apiPoi.title
        };

        poi.routeToFinalDestination = await api.route(poi.position, finalDestination);

        bigPois.push(poi);
        bigPoisPositions.add(getPoiKey(apiPoi));
        addedPois += 1;
      }

      index = Math.floor(index + indexSegmentsLength);
    }

    return bigPois;
  }

  async function updateRoutes(currentPositionUpdated, currentDestinationUpdated) {

    if (currentPositionUpdated) {
      routing.routeToFinalDestination = await api.route(routing.currentPosition, routing.finalDestination);
    }

    if (currentPositionUpdated || currentDestinationUpdated) {

      let routeFinished = await updateCurrentRoute();
      if(routeFinished) {
        routing.currentDestination = null;
        currentDestinationUpdated = true;
      }

      await updateBigPoiRoutes(currentPositionUpdated, currentDestinationUpdated);
    }
  }

  async function updateCurrentRoute() {
    let route = null;
    let destinationReached = false;

    if (routing.currentPosition && routing.currentDestination) {
      const distance = distanceInMeters(routing.currentPosition, routing.currentDestination);

      if (distance <= config.routeEndThreshold) {
        destinationReached = true;
      } else {
        route = await api.route(routing.currentPosition, routing.currentDestination);
      }
    }

    routing.routeToCurrentDestination = route;
    return destinationReached;
  }

  async function updateBigPoiRoutes(currentPositionUpdated, currentDestinationUpdated) {
    for (let poi of routing.bigPois) {

      if (currentPositionUpdated) {
        poi.routeFromCurrentPosition = await api.route(routing.currentPosition, poi.position);
      }

      if (currentDestinationUpdated) {
        if (routing.currentDestination) {
          poi.routeToCurrentDestination = await api.route(poi.position, routing.currentDestination);
        } else {
          poi.routeToCurrentDestination = null;
        }
      }
    }
  }

  function updateRouteTimes() {
    if (routing.currentPosition && routing.finalDestination) {
      const routeToDestination = routing.routeToCurrentDestination || routing.routeToFinalDestination;
      const originalTimeToDestination = getRouteTimeMillis(routeToDestination);

      for (let bigPoi of routing.bigPois) {
        const routeFromPoiToDestination = bigPoi.routeToCurrentDestination || bigPoi.routeToFinalDestination;

        const timeFromCurrentPosition = getRouteTimeMillis(bigPoi.routeFromCurrentPosition);
        const timeFromPoiToDestination = getRouteTimeMillis(routeFromPoiToDestination);
        
        const timeToDestinationThroughPoi = timeFromCurrentPosition + timeFromPoiToDestination;
        const timeRemaining = routing.arrivalTime - routing.currentTime;

        bigPoi.detourTime = timeToDestinationThroughPoi - originalTimeToDestination;
        bigPoi.freeTime = timeRemaining - timeToDestinationThroughPoi;
      }
    }
  }

  function getApiRouteAsPoints(route) {
    if(route === null) {
      return null;
    }
    return route.shape.map(point => {
      const position = point.split(',');
      return {
        lat: position[0],
        lng: position[1],
      };
    });
  }

  function getRouteTimeMillis(route) {
    return route.leg[0].maneuver.reduce((prev, current) => prev + current.travelTime, 0) * 1000;
  };

})();