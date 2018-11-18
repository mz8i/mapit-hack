(function() {
  const logger = {};
  window.logger = logger;

  logger.log = function() {
    if (config.logEnabled) {
      console.log.apply(null, arguments);
    }
  };

})();