(function() {
  const here = {};
  window.here = here;

  here.platform = new H.service.Platform({
    app_id: 'vWn2GmLBTbjKvOe4mhkK',
    app_code: 'XPZlJTo8ofqOsjg0_-Ty9w',
  });
  
  here.geocoder = here.platform.getGeocodingService();
  here.router = here.platform.getRoutingService();
  here.places = here.platform.getPlacesService();
  here.explore = new H.places.Explore(here.places);

})();