define(
  'tinymce.themes.mobile.util.UiDomFactory',

  [
    'ephox.alloy.api.component.DomFactory',
    'ephox.katamari.api.Strings',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (DomFactory, Strings, Styles) {
    var dom = function (rawHtml) {
      var html = Strings.supplant(rawHtml, {
        'prefix': Styles.prefix()
      });
      return DomFactory.fromHtml(html);
    };

    var spec = function (rawHtml) {
      var sDom = dom(rawHtml);
      return {
        dom: sDom
      };
    };

    return {
      dom: dom,
      spec: spec
    };
  }
);
