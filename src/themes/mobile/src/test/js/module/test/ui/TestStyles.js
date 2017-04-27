define(
  'tinymce.themes.mobile.test.ui.TestStyles',

  [
    'ephox.katamari.api.Id',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.search.SelectorFind',
    'global!document'
  ],

  function (Id, Insert, Remove, Element, Attr, Class, SelectorFind, document) {
    var styleClass = Id.generate('ui-test-styles');

    var addStyles = function () {
      var link = Element.fromTag('link');
      Attr.setAll(link, {
        rel: 'Stylesheet',
        href: '/project/src/themes/mobile/src/main/css/mobile.css',
        type: 'text/css'
      });
      Class.add(link, styleClass);

      var head = Element.fromDom(document.head);
      Insert.append(head, link);
    };

    var removeStyles = function () {
      var head = Element.fromDom(document.head);
      SelectorFind.descendant(head, '.' + styleClass).each(Remove.remove);
    };

    return {
      addStyles: addStyles,
      removeStyles: removeStyles
    };
  }
);
