define(
  'tinymce.themes.mobile.util.DataAttributes',

  [
    'ephox.sugar.api.properties.Attr',
    'global!isNaN',
    'global!parseInt'
  ],

  function (Attr, isNaN, parseInt) {
    var safeParse = function (element, attribute) {
      var parsed = parseInt(Attr.get(element, attribute), 10);
      return isNaN(parsed) ? 0 : parsed;
    };

    return {
      safeParse: safeParse
    };
  }
);