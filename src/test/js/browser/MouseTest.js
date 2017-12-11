import Assertions from 'ephox/agar/api/Assertions';
import Chain from 'ephox/agar/api/Chain';
import GeneralSteps from 'ephox/agar/api/GeneralSteps';
import Mouse from 'ephox/agar/api/Mouse';
import Pipeline from 'ephox/agar/api/Pipeline';
import Step from 'ephox/agar/api/Step';
import UiFinder from 'ephox/agar/api/UiFinder';
import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Insert } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { DomEvent } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('MouseTest', function() {
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
});

