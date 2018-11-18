(function() {
  const config = {};
  window.config = config;

  config.styleConfig = {
    mainRouteStyle: {
      strokeColor: 'blue',
      lineWidth: 5,
    }
  }

  config.moveThreshold = 0.000023;

  config.logEnabled = localStorage.getItem('log-enabled') === "true" || false;
  config.enableLog = () => localStorage.setItem('log-enabled', true);
  config.disableLog = () => localStorage.setItem('log-enabled', false);

  config.trackingEnabled = !(localStorage.getItem('tracking-disabled') === "true" || false);
  config.enableTracking = () => localStorage.setItem('tracking-disabled', false);
  config.disableTracking = () => localStorage.setItem('tracking-disabled', true);
})();