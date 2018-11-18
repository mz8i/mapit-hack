(function() {
  const api = {};
  window.api = api;
  
  const platform = new H.service.Platform({
    app_id: 'vWn2GmLBTbjKvOe4mhkK',
    app_code: 'XPZlJTo8ofqOsjg0_-Ty9w',
  });
  
  const geocoder = platform.getGeocodingService();
  const router = platform.getRoutingService();

  api.geocode = searchText => new Promise((resolve, reject) => {
    geocoder.geocode({
      searchText,
    }, result => {
      const locations = result.Response.View[0].Result;
      resolve(locations.map(location => {
        const position = location.Location.DisplayPosition;
        return {
          lat: position.Latitude,
          lng: position.Longitude,
        };
      }));
    }, error => {
      reject(error);
    });
  });

  api.route = (start, destination) => new Promise((resolve, reject) => {
    router.calculateRoute
  });

})();
