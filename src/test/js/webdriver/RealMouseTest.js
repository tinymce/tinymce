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
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Css',
    'global!document'
  ],

  function (Chain, Guard, Pipeline, RawAssertions, RealMouse, Step, UiFinder, PlatformDetection, Insert, Element, Attr, Class, Css, document) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var detection = PlatformDetection.detect();


    var style = document.createElement('style');
    style.innerHTML = 'button[data-test]:hover { background-color: blue; } button.other { background-color: blue; }';
    document.head.appendChild(style);

    var container = Element.fromTag('div');
    var button = Element.fromTag('button');
    Attr.set(button, 'data-test', 'true');
    Insert.append(container, button);


    var other = Element.fromTag('button');
    Class.add(other, 'other');
    Insert.append(container, other);

    Insert.append(Element.fromDom(document.body), container);

    Pipeline.async({}, [
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
      success();
    }, failure);


  }
);