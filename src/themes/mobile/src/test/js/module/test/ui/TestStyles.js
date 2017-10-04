define(
  'tinymce.themes.mobile.test.ui.TestStyles',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.katamari.api.Id',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.SelectorFind',
    'global!document',
    'global!navigator'
  ],

  function (Assertions, Chain, UiFinder, Waiter, Id, Insert, Remove, Element, Attr, Class, Css, SelectorFind, document, navigator) {
    var styleClass = Id.generate('ui-test-styles');

    var addStyles = function () {
      var link = Element.fromTag('link');
      Attr.setAll(link, {
        rel: 'Stylesheet',
        href: '/project/src/skins/lightgray/dist/lightgray/skin.mobile.min.css',
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

    var sWaitForToolstrip = function (realm) {
      return Waiter.sTryUntil(
        'Waiting until CSS has loaded',
        Chain.asStep(realm.element(), [
          UiFinder.cFindIn('.tinymce-mobile-toolstrip'),
          Chain.op(function (toolstrip) {
            if (navigator.userAgent.indexOf('PhantomJS') === -1) {
              Assertions.assertEq('Checking toolstrip is flex', 'flex', Css.get(toolstrip, 'display'));
            }
          })
        ]),
        100,
        8000
      );
    };

    return {
      addStyles: addStyles,
      removeStyles: removeStyles,
      sWaitForToolstrip: sWaitForToolstrip
    };
  }
);
