(function() {
  const api = {};
  window.api = api;
  
  const platform = new H.service.Platform({
    app_id: 'vWn2GmLBTbjKvOe4mhkK',
    app_code: 'XPZlJTo8ofqOsjg0_-Ty9w',
  });
  
  const geocoder = platform.getGeocodingService();
  const router = platform.getRoutingService();
  const explore = new H.places.Explore(platform.getPlacesService());

  api.geocode = searchText => new Promise((resolve, reject) => {
    geocoder.geocode({
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
    console.log(`routing from [${startPosition.lat}, ${startPosition.lng}] to [${endPosition.lat}, ${endPosition.lng}]`);
    router.calculateRoute({
      mode: 'fastest;pedestrian',
      waypoint0: `geo!${startPosition.lat},${startPosition.lng}`,
      waypoint1: `geo!${endPosition.lat},${endPosition.lng}`,
      representation: 'display',
    }, result => {
      resolve(result);
    }, error => {
      reject(error);
    });
  });

  api.pois = (position, radius, categories) => new Promise((resolve, reject) => {
    explore.request({
      in: `${position.lat},${position.lng};r=${radius}`,
      cat: categories,
    }, {
      // intentionally empty 
    }, result => {
      resolve(result);
    }, error => {
      reject(error);
    })
  });

})();
