define(
  'ephox.alloy.alien.Truncate',

  [
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Replication'
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