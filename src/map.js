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

        const marker = new H.map.Marker({
          lat: poi.position.lat,
          lng: poi.position.lng
        }, {icon: icon});

        marker.setData({
          name: poi.name,
          categoryName: categoryInfo.name
        });

        marker.addEventListener('tap', e => {
          let pos = e.target.getPosition();
          let data = e.target.getData();

          let bubbleContent = `${data.name}
          <br />
          ${data.categoryName}
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

        return marker;
      }));

    };

    map.setSmallPois = smallPois => {
      if (smallPoisGroup) map.instance.removeObject(smallPoisGroup);

      smallPoisGroup = new H.map.Group({
        min: config.styleConfig.smallPoinMinZoom
      });
      map.instance.addObject(smallPoisGroup);

      smallPoisGroup.addObjects(smallPois.map(poi => {
        let categoryInfo = config.categories[poi.category];
        let icon = new H.map.Icon(categoryInfo.iconMain, {
          size: { w: 32, h: 42 }
        });

        const marker = new H.map.Marker({
          lat: poi.position.lat,
          lng: poi.position.lng
        }, { icon: icon });

        marker.setData({
          name: poi.name,
          categoryName: categoryInfo.name
        });

        marker.addEventListener('tap', e => {
          let pos = e.target.getPosition();
          let data = e.target.getData();

          let bubbleContent = `${data.name}
          <br />
          ${data.categoryName}`;

          let bubble = new H.ui.InfoBubble(
            pos, {
              content: bubbleContent
            });

          ui.addBubble(bubble);
        });

        return marker;
      }));
    };

    map.setCurrentLocation = currentLocation => {
      if(currentLocationGroup) {
        map.instance.removeObject(currentLocationGroup);
      }

      let heading = currentLocation.heading || 0;
      let svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg"><defs><style>.cls-1{fill:#db0b55;}</style></defs><title>Zasób 27</title><g transform="rotate(${heading} 12 12)"><path class="cls-1" d="M6.22,0,0,17.42s6.22-3.5,12.44,0L6.22,0"/></g></svg>`;
      
      let icon = new H.map.DomIcon(svgMarkup, {
        size: {w:96, h:126}
      });

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

      let icon = new H.map.Icon('img/end.svg', {
        size: { w: 32, h: 42 }
      });

      console.log(icon);
      console.log(destination);
      let marker = new H.map.Marker({
        lat: destination.lat,
        lng: destination.lng
      }, {icon: icon});

      console.log(marker);

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

    function updateView() {

    }


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
      // addedToMap.push(group);

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