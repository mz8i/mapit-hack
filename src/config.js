(function() {
  const config = {};
  window.config = config;

  config.categories = {
    'snacks-fast-food': {
      name: 'Snacks & Fast Food',
      iconMain: 'img/big/food_b.svg'
    },
    'coffee-tea': {
      name: 'Coffee & Tea',
      iconMain: 'img/big/cafe_b.svg'
    },
    'natural-geographical': {
      name: 'Outdoor Activities',
      iconMain: 'img/big/museum_b.svg'
    },
    'leisure-outdoor': {
      name: 'Outdoor Activities',
      iconMain: 'img/big/green_b.svg'
    },
    'sights-museums': {
      name: 'Museums',
      iconMain: 'img/big/museum_b.svg'
    }
  };


  config.styleConfig = {
    mainRouteStyle: {
      strokeColor: 'blue',
      lineWidth: 5,
    }
  };

  config.moveThreshold = 5; // in meters
  config.velocity = 1; // in meters per second

  config.logEnabled = localStorage.getItem('log-enabled') === "true" || false;
  config.enableLog = () => localStorage.setItem('log-enabled', true);
  config.disableLog = () => localStorage.setItem('log-enabled', false);

  config.trackingEnabled = !(localStorage.getItem('tracking-disabled') === "true" || false);
  config.enableTracking = () => localStorage.setItem('tracking-disabled', false);
  config.disableTracking = () => localStorage.setItem('tracking-disabled', true);
})();