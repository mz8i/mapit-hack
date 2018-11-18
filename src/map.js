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
    const ui = window.ui = H.ui.UI.createDefault(map.instance, here.platform.createDefaultLayers());

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

    map.addRoute = route => {
      const linestring = new H.geo.LineString();
      route.shape.forEach(point => {
        const position = point.split(',');
        linestring.pushLatLngAlt(position[0], position[1]);
      });

      const line = new H.map.Polyline(linestring, {
        style: {
          strokeColor: 'blue',
          lineWidth: 5,
        },
      });

      map.instance.addObject(line);
    };

    map.addPoisAlongRoute = (route, radius, categories) => {
      const midpoints = route.shape.map(point => {
        const position = point.split(',');
        return {
          lat: parseFloat(position[0]),
          lng: parseFloat(position[1]),
        };
      });
      
      const pois = [];
      const poisPositions = [];

      (async function() {
        for (let i = 0 ; i < midpoints.length ;i++) {
          const midpois = await api.pois(midpoints[i], radius, categories);
          midpois.forEach(midpoi => {
            const positionString = midpoi.position[0] + midpoi.position[1];
            if (poisPositions.indexOf(positionString) === -1) {
              pois.push(midpoi);
              poisPositions.push(positionString);
            }
          });
        }
        map.addPois(pois);
      })();
    }
})();