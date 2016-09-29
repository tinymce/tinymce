define(
  'ephox.katamari.api.Id',
  [
    'global!Date',
    'global!Math',
    'global!String'
  ],

  function (Date, Math, String) {

    /**
     * Generate a unique identifier.
     *
     * The unique portion of the identifier only contains an underscore
     * and digits, so that it may safely be used within HTML attributes.
     *
     * The chance of generating a non-unique identifier has been minimized
     * by combining the current time, a random number and a one-up counter.
     *
     * generate :: String -> String
     */
    var unique = 0;

    var generate = function (prefix) {
      var date   = new Date();
      var time   = date.getTime();
      var random = Math.floor(Math.random() * 1000000000);

      unique++;

      return prefix + '_' + random + unique + String(time);
    };

    return {
      generate: generate
    };

  }
);
