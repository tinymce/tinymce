import { Chain, Cursors, FocusTools, GeneralSteps, Keyboard, Mouse, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Attr, Css, Element, Insert, Node, Remove, Text } from '@ephox/sugar';
import * as DomDefinition from 'ephox/alloy/dom/DomDefinition';
import * as DomRender from 'ephox/alloy/dom/DomRender';
import * as GuiEvents from 'ephox/alloy/events/GuiEvents';
import TestStore from 'ephox/alloy/test/TestStore';

UnitTest.asynctest('GuiEventsTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  const page = DomRender.renderToDom(
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
                tabindex: '-1'
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

  const doc = Element.fromDom(document);
  const body = Element.fromDom(document.body);
  Insert.append(body, page);

  const store = TestStore();

  const triggerEvent = function (eventName, event) {
    const target = event.target();
    const targetValue = Node.isText(target) ? 'text(' + Text.get(target) + ')' : Attr.get(target, 'class');
    store.adder({ eventName, target: targetValue })();
  };

  const broadcastEvent = function (eventName, event) {
    store.adder({ broadcastEventName: eventName })();
  };

  const sTestFocusInput = GeneralSteps.sequence([
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

  const sTestFocusSpan = GeneralSteps.sequence([
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

  const sTestKeydown = GeneralSteps.sequence([
    Keyboard.sKeydown(doc, 'A'.charCodeAt(0), { }),
    store.sAssertEq(
      'Checking event log after keydown',
      [
        { eventName: 'keydown', target: 'focusable-span' }
      ]
    ),
    store.sClear
  ]);

  const sTestClick = GeneralSteps.sequence([
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
  const sTestInput = Step.pass;

  // TODO: VAN-13: Add agar support for selectstart events
  const sTestSelectStart = Step.pass;

  const sTestMouseover = GeneralSteps.sequence([
    Mouse.sHoverOn(page, '.focusable-span'),
    store.sAssertEq(
      'Checking event log after hovering on focusable span',
      [
        { eventName: 'mouseover', target: 'focusable-span' }
      ]
    ),
    store.sClear
  ]);

  const sTestMouseOperation = function (eventName, op) {
    return GeneralSteps.sequence([
      Chain.asStep(page, [ op ]),
      store.sAssertEq(
        'Checking event log after ' + eventName + ' on root',
        [
          { eventName, target: 'gui-events-test-container' }
        ]
      ),
      store.sClear
    ]);
  };

  const sTestWindowScroll = GeneralSteps.sequence([
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

  const sTestUnbind = GeneralSteps.sequence([
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

  const sTestChange = Step.pass;
  const sTestTransitionEnd = Step.pass;

  const gui = GuiEvents.setup(page, {
    triggerEvent,
    broadcastEvent
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
