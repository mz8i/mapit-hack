(function() {
    const map = {};
    window.map = map;

    map.instance = new H.Map(
      document.getElementById('map'),
      here.platform.createDefaultLayers().normal.map, {
        center: { lat: 50.05136, lng: 19.944761 },
        zoom: 15,
      },
    );

    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map.instance));
    // const ui = window.ui = H.ui.UI.createDefault(map.instance, here.platform.createDefaultLayers());

    window.addEventListener('resize', function () {
      map.instance.getViewPort().resize();
    });

    map.addPois = pois => {
      const group = new H.map.Group();
      map.instance.addObject(group);

      group.addObjects(pois.map(poi => {
        const marker = new H.map.Marker({
          lat: poi.position[0],
          lng: poi.position[1]
        });

        marker.setData({
          title: poi.title,
        });

        return marker;
      }));
    };
})();