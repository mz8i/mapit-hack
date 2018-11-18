(function() {
    const map = {};
    window.map = map;

    map.instance = new H.Map(
      document.getElementById('map'),
      here.platform.createDefaultLayers().terrain.map, {
        center: { lat: 50.05136, lng: 19.944761 },
        zoom: 15
      },
    );

    map.instance.addEventListener('tap', function (evt) {
      routing.onCurrentLocationChange(map.instance.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY));
    });

    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map.instance));

    const ui = window.ui = new H.ui.UI(map.instance);

    window.addEventListener('resize', function () {
      map.instance.getViewPort().resize();
    });

    let followCurrentLocation = false;

    let bigPoisGroup = null;
    let smallPoisGroup = null;
    let currentLocationGroup = null;
    let finalDestinationGroup = null;
    let routeGroup = null;

    map.setBigPois = bigPois => {

      if(bigPoisGroup) map.instance.removeObject(bigPoisGroup);

      bigPoisGroup = new H.map.Group();
      map.instance.addObject(bigPoisGroup);

      bigPoisGroup.addObjects(bigPois.map(poi => {
        let categoryInfo = config.categories[poi.category];
        let icon = new H.map.Icon(categoryInfo.iconMain, {
          size: { w: 32, h: 42 }
        });

        const marker = new H.map.DomMarker({
          lat: poi.position[0],
          lng: poi.position[1]
        }, {icon: icon});

        // marker.setData({
        //   name: categoryInfo.
        // });

        return marker;
      }));

    };

    map.setSmallPois = smallPois => {

    };

    map.setCurrentLocation = currentLocation => {
      if(currentLocationGroup) {
        map.instance.removeObject(currentLocationGroup);
      }
      
      let svgMarkup = `<svg height="24" width="24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="red" />
      </svg>`;
      
      let icon = new H.map.DomIcon(svgMarkup);

      currentLocationGroup = new H.map.DomMarker({
        lat: currentLocation.lat,
        lng: currentLocation.lng
      }, {
        icon: icon
      });
      
      map.instance.addObject(currentLocationGroup);
    };

    map.setFinalDestination  = destination => {

      if(finalDestinationGroup) map.instance.removeObject(finalDestinationGroup);

      finalDestinationGroup = new H.map.Group();

      map.instance.addObject(finalDestinationGroup);

      let marker = new H.map.Marker({
        lat: destination.lat,
        lng: destination.lng
      });

      finalDestinationGroup.addObject(marker);

      finalDestinationGroup.addEventListener('tap', e => {
        let pos = e.target.getPosition();

        let bubbleContent = `
        <button 
          onClick="routing.setCurrentDestination(
            {lat:${pos.lat}, lng:${pos.lng}}
          )">
        Go to final destination
        </button>`;

        let bubble = new H.ui.InfoBubble(
          pos, {
            content: bubbleContent
          });

        ui.addBubble(bubble);
      });
    };

    map.setRoute = route => {
      if(routeGroup) map.instance.removeObject(routeGroup);

      if(!route) {
        // TODO zoom out
        return;
      }

      let linestring = new H.geo.LineString();
      route.forEach(point => {
        linestring.pushLatLngAlt(point.lat, point.lng);
      });

      routeGroup = new H.map.Polyline(linestring, {
        style: config.styleConfig.mainRouteStyle,
      });

      map.instance.addObject(routeGroup);
    };


    map.setFollowCurrentLocation = doFollow => {
      followCurrentLocation = doFollow;
      // TODO update location here?
    };

    map.doesFollowCurrentLocation = () => followCurrentLocation;

    map.updateCurrentLocation = location => {
      currentLocation = location;

      if (followCurrentLocation) {
        map.instance.setCenter({
          lat: location.lat,
          lng: location.lng
        }, true);
      }
    };

    map.zoomOutToPositionAndDestination = () => {
      // TODO
    };

    map.clear = () => {
      map.instance.removeObjects(addedToMap);
      addedToMap.splice(0, addedToMap.length);
    }

    map.addPois = pois => {
      const group = new H.map.Group();
      map.instance.addObject(group);
      addedToMap.push(group);

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
        style: config.styleConfig.mainRouteStyle,
      });

      map.instance.addObject(line);
      // addedToMap.push(line);
    };

    map.addPoisAlongRoute = (route, radius, categories) => {
      const midpoints = route.shape.map(point => {
        const position = point.split(',');
        return {
          lat: parseFloat(position[0]),
          lng: parseFloat(position[1]),
        };
      });
      
      const group = new H.map.Group();
      map.instance.addObject(group);
      addedToMap.push(group);

      const poisPositions = [];

      (async function() {
        for (let i = 0 ; i < midpoints.length ;i++) {
          const midpois = await api.pois(midpoints[i], radius, categories);
          const newMidpois = midpois.filter(midpoi =>
            poisPositions.indexOf(midpoi.position[0] + midpoi.position[1]) === -1);
          group.addObjects(newMidpois.map(poi => {
            const marker = new H.map.Marker({
              lat: poi.position[0],
              lng: poi.position[1]
            });
    
            marker.setData({
              title: poi.title,
            });
    
            return marker;
          }));
        }
      })();
    }
})();