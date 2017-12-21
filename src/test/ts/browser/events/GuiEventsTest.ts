import { Chain } from '@ephox/agar';
import { Cursors } from '@ephox/agar';
import { FocusTools } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Keyboard } from '@ephox/agar';
import { Mouse } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { Waiter } from '@ephox/agar';
import DomDefinition from 'ephox/alloy/dom/DomDefinition';
import DomRender from 'ephox/alloy/dom/DomRender';
import GuiEvents from 'ephox/alloy/events/GuiEvents';
import TestStore from 'ephox/alloy/test/TestStore';
import { Insert } from '@ephox/sugar';
import { InsertAll } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { Text } from '@ephox/sugar';
import { Attr } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('GuiEventsTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var page = DomRender.renderToDom(
    DomDefinition.nu({
      tag: 'div',
      classes: [ 'gui-events-test-container' ],
      defChildren: [
        {
          tag: 'input',
          classes: [ 'test-input' ]
        },
        {
          tag: 'div',
          classes: [ 'test-inner-div' ],
          defChildren: [
            {
              tag: 'span',
              classes: [ 'focusable-span' ],
              attributes: {
                'tabindex': '-1'
              },
              styles: {
                width: '200px',
                height: '200px',
                border: '1px solid blue',
                display: 'inline-block'
              }
            },
            {
              tag: 'button',
              classes: [ 'test-button' ],
              innerHtml: 'Button'
            }
          ]
        }

      ]
    })
  );

  var doc = Element.fromDom(document);
  var body = Element.fromDom(document.body);
  Insert.append(body, page);

  var store = TestStore();


  var triggerEvent = function (eventName, event) {
    var target = event.target();
    var targetValue = Node.isText(target) ? 'text(' + Text.get(target) + ')' : Attr.get(target, 'class');
    store.adder({ eventName: eventName, target: targetValue })();
  };

  var broadcastEvent = function (eventName, event) {
    store.adder({ broadcastEventName: eventName })();
  };

  var sTestFocusInput = GeneralSteps.sequence([
    FocusTools.sSetFocus(
      'Focusing test input',
      page,
      '.test-input'
    ),

    store.sAssertEq(
      'Checking event log after focusing test-input',
      [
        { eventName: 'focusin', target: 'test-input' }
      ]
    ),

    store.sClear
  ]);

  var sTestFocusSpan = GeneralSteps.sequence([
    FocusTools.sSetFocus(
      'Focusing span',
      page,
      '.focusable-span'
    ),

    // Wait for the post.blur to fire.
    Step.wait(200),

    store.sAssertEq(
      'Checking event log after focusing span',
      [
        { eventName: 'focusout', target: 'test-input' },
        { eventName: 'focusin', target: 'focusable-span' },
        { eventName: 'alloy.blur.post', target: 'test-input' }
      ]
    ),

    store.sClear
  ]);

  var sTestKeydown = GeneralSteps.sequence([
    Keyboard.sKeydown(doc, 'A'.charCodeAt(0), { }),
    store.sAssertEq(
      'Checking event log after keydown',
      [
        { eventName: 'keydown', target: 'focusable-span' }
      ]
    ),
    store.sClear
  ]);

  var sTestClick = GeneralSteps.sequence([
    Mouse.sClickOn(page, '.test-button'),
    store.sAssertEq(
      'Checking event log after clicking on test-button',
      [
        { eventName: 'click', target: 'test-button' }
      ]
    ),
    store.sClear,
    Chain.asStep(page, [
      UiFinder.cFindIn('.test-button'),
      Cursors.cFollow([ 0 ]),
      Mouse.cClick
    ]),
    store.sAssertEq(
      'Checking event log after clicking on test-button text',
      [
        { eventName: 'click', target: 'text(Button)' }
      ]
    ),
    store.sClear
  ]);

  // TODO: VAN-12: Add agar support for input events.
  var sTestInput = Step.pass;

  // TODO: VAN-13: Add agar support for selectstart events
  var sTestSelectStart = Step.pass;

  var sTestMouseover = GeneralSteps.sequence([
    Mouse.sHoverOn(page, '.focusable-span'),
    store.sAssertEq(
      'Checking event log after hovering on focusable span',
      [
        { eventName: 'mouseover', target: 'focusable-span' }
      ]
    ),
    store.sClear
  ]);

  var sTestMouseOperation = function (eventName, op) {
    return GeneralSteps.sequence([
      Chain.asStep(page, [ op ]),
      store.sAssertEq(
        'Checking event log after ' + eventName + ' on root',
        [
          { eventName: eventName, target: 'gui-events-test-container' }
        ]
      ),
      store.sClear
    ]);
  };

  var sTestWindowScroll = GeneralSteps.sequence([
    store.sClear,
    Step.sync(function () {
      Css.set(page, 'margin-top', '2000px');
      window.scrollTo(0, 1000);
    }),
    // Wait for window scroll to come through
    Waiter.sTryUntil(
      'Waiting for window scroll event to broadcast',
      store.sAssertEq('Checking scroll should have fired', [ { broadcastEventName: 'alloy.system.scroll' } ]),
      100,
      1000
    ),
    Step.sync(function () {
      Css.remove(page, 'margin-top');
      window.scrollTo(0, 0);
    }),
    store.sClear
  ]);

  var sTestUnbind = GeneralSteps.sequence([
    Step.sync(function () {
      gui.unbind();
    }),

    store.sClear,

    FocusTools.sSetFocus(
      'Focusing test input',
      page,
      '.test-input'
    ),

    FocusTools.sSetFocus(
      'Focusing span',
      page,
      '.focusable-span'
    ),

    Keyboard.sKeydown(doc, 'A'.charCodeAt(0), { }),
    Mouse.sClickOn(page, '.test-button'),

    store.sAssertEq(
      'After unbinding events, nothing should be listened to any longer',
      [ ]
    )

    // TODO: Any other event triggers here.
  ]);

  var sTestChange = Step.pass;
  var sTestTransitionEnd = Step.pass;

  var gui = GuiEvents.setup(page, {
    triggerEvent: triggerEvent,
    broadcastEvent: broadcastEvent
  });

  Pipeline.async({}, [
    sTestFocusInput,
    sTestFocusSpan,
    sTestKeydown,
    sTestClick,
    sTestInput,
    sTestMouseover,
    sTestSelectStart,

    sTestMouseOperation('mousedown', Mouse.cMouseDown),
    sTestMouseOperation('mouseup', Mouse.cMouseUp),
    sTestMouseOperation('mousemove', Mouse.cMouseMoveTo(10, 10)),
    sTestMouseOperation('mouseout', Mouse.cMouseOut),
    sTestMouseOperation('contextmenu', Mouse.cContextMenu),

    // FIX: Add API support to agar
    sTestChange,
    sTestTransitionEnd,

    sTestWindowScroll,

    sTestUnbind
  ], function () {
    Remove.remove(page);
    success();
  }, failure);
});

