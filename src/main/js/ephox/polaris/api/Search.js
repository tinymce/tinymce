define(
  'ephox.polaris.api.Search',

  [
    'ephox.polaris.search.Find'
  ],

  function (Find) {
    var findall = function (input, pattern) {
      return Find.all(input, pattern);
    };

    return {
      findall: findall
    };
  }
);
