(function() { 
  const api = {};
  window.api = api;

  api.geocode = searchText => new Promise((resolve, reject) => {
    logEnabled && console.log(`geocoding "${searchText}"`);
    here.geocoder.geocode({
      searchText,
    }, result => {
      const locations = result.Response.View[0].Result;
      const positions = locations.map(location => {
        const position = location.Location.DisplayPosition;
        return {
          lat: position.Latitude,
          lng: position.Longitude,
        };
      });
      resolve(positions[0]);
    }, error => {
      reject(error);
    });
  });

  api.route = (startPosition, endPosition) => new Promise((resolve, reject) => {
    logEnabled && console.log(`routing from [${startPosition.lat}, ${startPosition.lng}] to [${endPosition.lat}, ${endPosition.lng}]`);
    here.router.calculateRoute({
      mode: 'fastest;pedestrian',
      waypoint0: `geo!${startPosition.lat},${startPosition.lng}`,
      waypoint1: `geo!${endPosition.lat},${endPosition.lng}`,
      representation: 'display',
    }, result => {
      resolve(result.response.route[0]);
    }, error => {
      reject(error);
    });
  });

  api.pois = (position, radius, categories) => new Promise((resolve, reject) => {
    logEnabled && console.log(`looking for ${categories} POIs within ${radius} meters of [${position.lat}, ${position.lng}]`);
    here.explore.request({
      in: `${position.lat},${position.lng};r=${radius}`,
      cat: categories,
    }, {
      // intentionally empty 
    }, result => {
      resolve(result.results.items);
    }, error => {
      reject(error);
    })
  });

})();
