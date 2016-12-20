test(
  'VisibilityTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.Visibility',
    'ephox.sugar.test.Div'
  ],

  function (Arr, PlatformDetection, Insert, Remove, Body, Element, Css, Visibility, Div) {
    var c = Div();
    assert.eq(false, Visibility.isVisible(c));
    Insert.append(Body.body(), c);
    assert.eq(true, Visibility.isVisible(c));

    Css.set(c, 'display', 'none');
    assert.eq(false, Visibility.isVisible(c));

    var s = Element.fromTag('span');
    assert.eq(false, Visibility.isVisible(s));

    Insert.append(Body.body(), s);
    var expected = PlatformDetection.detect().browser.isFirefox();
    assert.eq(expected, Visibility.isVisible(s)); // tricked you! height and width are zero == hidden

    var d = Div();
    Insert.append(c, d);
    assert.eq(false, Visibility.isVisible(d));

    Css.remove(c, 'display');
    assert.eq(true, Visibility.isVisible(d));
    assert.eq(true, Visibility.isVisible(c));


    Arr.each([c, d, s], Remove.remove);
  }
);