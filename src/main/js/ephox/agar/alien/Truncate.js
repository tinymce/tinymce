define(
  'ephox.agar.alien.Truncate',

  [
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.dom.Replication'
  ],

  function (Html, Replication) {
    var getHtml = function (element) {
      var clone = Replication.shallow(element);
      return Html.getOuter(clone);
    };

    return {
      getHtml: getHtml
    };
  }
);