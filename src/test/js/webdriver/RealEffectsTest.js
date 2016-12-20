asynctest(
  'Real Effects Test',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Guard',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.RealClipboard',
    'ephox.agar.api.RealKeys',
    'ephox.agar.api.RealMouse',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiControls',
    'ephox.agar.api.UiFinder',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.dom.Insert',
    'global!document'
  ],

  function (Assertions, Chain, Guard, Pipeline, RealClipboard, RealKeys, RealMouse, Step, UiControls, UiFinder, PlatformDetection, Class, Css, Element, Html, Insert, document) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var head = Element.fromDom(document.head);
    var body = Element.fromDom(document.body);

    var platform = PlatformDetection.detect();

    var sCreateWorld = Step.sync(function () {
      var input = Element.fromTag('input');
      Insert.append(body, input);

      var css = Element.fromTag('style');
      Html.set(css, 'button { border: 1px solid black; }\nbutton.test:hover { border: 1px solid white }');
      Insert.append(head, css);

      var button = Element.fromTag('button');
      Class.add(button, 'test');
      Html.set(button, 'Mouse over me');
      Insert.append(body, button);
    });

    var sCheckInput = function (label, expected) {
      return Chain.asStep(body, [
        Chain.control(
          UiFinder.cFindIn('input'),
          Guard.addLogging(label + '\nlooking for input to check expected')
        ),
        UiControls.cGetValue,
        Assertions.cAssertEq(label + '\nChecking the input value', expected)
      ]);
    };

    var sCheckButtonBorder = function (label, expected) {
      return Chain.asStep(body, [
        UiFinder.cFindIn('button.test'),
        Chain.mapper(function (button) {
          var prop = platform.browser.isFirefox() || platform.browser.isEdge() || platform.browser.isIE() ? 'border-right-color' : 'border-color';
          return Css.get(button, prop);
        }),
        Assertions.cAssertEq(label + '\nChecking color of button border', expected)
      ]);
    };

    Pipeline.async({}, [
      sCreateWorld,
      Step.wait(2000),
      RealKeys.sSendKeysOn('input', [
        RealKeys.text('I am typing thos')
      ]),
      sCheckInput('Initial typing', 'I am typing thos'),
      Step.wait(100),
      RealKeys.sSendKeysOn('input', [
        RealKeys.backspace(),
        RealKeys.backspace()
      ]),
      sCheckInput('After backspacing incorrect letters', 'I am typing th'),
      Step.wait(100),
      RealKeys.sSendKeysOn('input', [
        RealKeys.text('is')
      ]),
      sCheckInput('After correcting "this"', 'I am typing this'),
      Step.wait(100),
      RealKeys.sSendKeysOn('input', [
        RealKeys.combo({ ctrlKey: true }, 'a')
      ]),
      Step.wait(100),
      RealClipboard.sCopy('input'),
      sCheckInput('After triggering copy', 'I am typing this'),

      Step.wait(100),
      RealKeys.sSendKeysOn('input', [
        RealKeys.backspace()
      ]),
      sCheckInput('After pressing Backspace on Select All', ''),
      Step.wait(100),
      RealClipboard.sPaste('input'),
      sCheckInput('Post paste', 'I am typing this'),
      Step.wait(1000),
      sCheckButtonBorder('Checking initial state of button border', 'rgb(0, 0, 0)'),

      RealMouse.sMoveToOn('button.test'),
      sCheckButtonBorder('Checking hovered state of button border', 'rgb(255, 255, 255)')
    ], function () {
      success();
    }, failure);
  }
);