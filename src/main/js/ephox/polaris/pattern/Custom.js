define(
  'ephox.polaris.pattern.Custom',

  [
    'global!RegExp'
  ],

  function (RegExp) {
    return function (regex, prefix, suffix) {
      var term = function () {
        return new RegExp(regex, 'g');
      };

      return {
        term: term,
        prefix: prefix,
        suffix: suffix
      };
    };
  }
);
