define(
  'tinymce.themes.mobile.util.UiDomFactory',

  [
    'ephox.alloy.api.component.DomFactory',
    'ephox.katamari.api.Strings',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (DomFactory, Strings, Styles) {
    var fromHtml = function (rawHtml) {
      var html = Strings.supplant(rawHtml, {
        'prefix': Styles.prefix()
      });
      return DomFactory.fromHtml(html);
    };

    return {
      fromHtml: fromHtml
    };
  }
);
