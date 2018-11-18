(function() {
  const platform = new H.service.Platform({
    app_id: 'vWn2GmLBTbjKvOe4mhkK',
    app_code: 'XPZlJTo8ofqOsjg0_-Ty9w',
  });

  const here = {};
  window.here = here;

  here.platform = platform;
  here.geocoder = platform.getGeocodingService();
  here.router = platform.getRoutingService();
  here.places = platform.getPlacesService();
  here.explore = new H.places.Explore(here.places);

})();