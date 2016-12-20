asynctest(
  'MouseTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.katamari.api.Arr',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'global!document'
  ],
 
  function (Assertions, Chain, GeneralSteps, Mouse, Pipeline, Step, UiFinder, Arr, PlatformDetection, Insert, Remove, DomEvent, Element, document) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var input = Element.fromTag('input');
    var container = Element.fromTag('container');

    var platform = PlatformDetection.detect();

    // Add to the DOM so focus calls happen
    Insert.append(Element.fromDom(document.body), container);

    var repository = [ ];

    // TODO: Free handlers.
    var handlers = Arr.bind([ 'mousedown', 'mouseup', 'mouseover', 'click', 'focus', 'contextmenu' ], function (evt) {
      return [
        DomEvent.bind(container, evt, function () { 
          repository.push('container.' + evt);
        }),
        DomEvent.bind(input, evt, function () {
          repository.push('input.' + evt);
        })
      ];
    });

    var clearRepository = Step.sync(function () {
      repository = [ ];
    });

    var assertRepository = function (label, expected) {
      return Step.sync(function () {
        Assertions.assertEq(label, expected, repository);
      });
    };

    var runStep = function (label, expected, step) {
      return GeneralSteps.sequence([
        clearRepository,
        step,
        assertRepository(label, expected)
      ]);
    };

    var isUnfocusedFirefox = function () {
      // Focus events are not fired until the window has focus: https://bugzilla.mozilla.org/show_bug.cgi?id=566671
      return platform.browser.isFirefox() && !document.hasFocus();
    };

    Insert.append(container, input);

    Pipeline.async({}, [
      runStep('Initial test', [ ], Step.pass),
      runStep(
        'sClickOn (container > input)',
        [ 'input.click', 'container.click' ],
        Mouse.sClickOn(container, 'input')
      ),

      runStep(
        'sTrueClickOn (container > input)',
        // IE seems to fire input.focus at the end.
        platform.browser.isIE() ? [
          'input.mousedown', 'container.mousedown',
          'input.mouseup', 'container.mouseup',
          'input.click', 'container.click', 'input.focus'

        ] : (isUnfocusedFirefox() ? [ 
          'input.mousedown', 'container.mousedown',
          'input.mouseup', 'container.mouseup',
          'input.click', 'container.click'
        ] : [
          'input.focus',
          'input.mousedown', 'container.mousedown',
          'input.mouseup', 'container.mouseup',
          'input.click', 'container.click'
        ]),
        Mouse.sTrueClickOn(container, 'input')
      ),

      // Running again won't call focus
      runStep(
        'sTrueClickOn (container > input)',
        [
          'input.mousedown', 'container.mousedown',
          'input.mouseup', 'container.mouseup',
          'input.click', 'container.click'
        ],
        Mouse.sTrueClickOn(container, 'input')
      ),

      runStep(
        'sHoverOn (container > input)',
        [ 'input.mouseover', 'container.mouseover' ],
        Mouse.sHoverOn(container, 'input')
      ),

      runStep(
        'sContextMenu (container > input)',
        [ 'input.contextmenu', 'container.contextmenu' ],
        Mouse.sContextMenuOn(container, 'input')
      ),

      runStep(
        'cClick input',
        [ 'input.click', 'container.click' ],
        Chain.asStep(container, [
          UiFinder.cFindIn('input'),
          Mouse.cClick
        ])
      ),

      runStep(
        'cClickOn (container > input)',
        [ 'input.click', 'container.click' ],
        Chain.asStep(container, [
          Mouse.cClickOn('input')
        ])
      ),

      runStep(
        'cContextMenu input',
        [ 'input.contextmenu', 'container.contextmenu' ],
        Chain.asStep(container, [
          UiFinder.cFindIn('input'),
          Mouse.cContextMenu
        ])
      )

    ], function () {
      Arr.each(handlers, function (h) { h.unbind(); });
      Remove.remove(container);
      success();
    }, function (err) {
      Arr.each(handlers, function (h) { h.unbind(); });
      failure(err);
    });
  }
);