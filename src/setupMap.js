(function() {
    let map = window.map =  new H.Map(
        document.getElementById('map'),
        platform.createDefaultLayers().normal.map,
        {
            center: { lat: 50.05136, lng: 19.944761 },
            zoom: 15
        });

    let behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

    let ui = window.ui = H.ui.UI.createDefault(map, platform.createDefaultLayers());
})();