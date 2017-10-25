asynctest(
  'RealMouseTest',

  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Guard',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.RawAssertions',
    'ephox.agar.api.RealMouse',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.properties.Html',
    'global!document'
  ],

  function (Chain, Guard, Pipeline, RawAssertions, RealMouse, Step, UiFinder, PlatformDetection, Insert, Remove, Element, Attr, Class, Css, Html, document) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var detection = PlatformDetection.detect();

    var style = document.createElement('style');
    style.innerHTML = 'button[data-test]:hover { background-color: blue; color: white; } button.other { background-color: blue; color: white; } button';
    document.head.appendChild(style);

    var container = Element.fromTag('div');
    var button = Element.fromTag('button');
    Attr.set(button, 'data-test', 'true');
    Html.set(button, 'hover-button');
    Insert.append(container, button);

    var other = Element.fromTag('button');
    Class.add(other, 'other');
    Html.set(other, 'other-button');
    Insert.append(container, other);

    var normal = Element.fromTag('button');
    Html.set(normal, 'Normal');
    Insert.append(container, normal);

    Insert.append(Element.fromDom(document.body), container);

    Pipeline.async({}, [
      RealMouse.sMoveToOn('.other'),
      // Wait 1 second. Probably don't need to...
      Step.wait(1000),
      RealMouse.sMoveToOn('button[data-test]'),

      Chain.asStep(container, [
        UiFinder.cFindIn('button[data-test]'),
        Chain.control(
          Chain.op(function (button) {
            // Geckodriver does not have support for API actions yet.
            if (! detection.browser.isFirefox()) RawAssertions.assertEq('After hovering', Css.get(other, 'background-color'), Css.get(button, 'background-color'));
          }),
          Guard.tryUntil('Waiting for button to turn blue', 100, 2000)
        )
      ])
    ], function () {
      Remove.remove(container);
      success();
    }, failure);


  }
);