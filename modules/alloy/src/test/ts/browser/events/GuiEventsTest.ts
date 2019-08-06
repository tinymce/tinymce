import {
  Chain,
  Cleaner,
  Cursors,
  FocusTools,
  GeneralSteps,
  Keyboard,
  Keys,
  Logger,
  Mouse,
  Pipeline,
  Step,
  UiFinder
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { Attr, DomEvent, Element, Insert, Node, Remove, Text } from '@ephox/sugar';

import * as GuiEvents from 'ephox/alloy/events/GuiEvents';
import TestStore from 'ephox/alloy/api/testhelpers/TestStore';

UnitTest.asynctest('GuiEventsTest', (success, failure) => {

  const cleanup = Cleaner();

  const page = Element.fromHtml(
    `<div class="gui-events-test-container">
      <input class="test-input" />
      <div class="test-contenteditable"  contenteditable="true"></div>
      <div class="test-inner-div">
        <span class="focusable-span" tabindex="-1" style="width: 200px; height: 200px; border: 1px solid blue; display: inline-block;"></span>
        <button class="test-button">Button</button>
      </div>
    </div>`
  );

  const doc = Element.fromDom(document);
  const body = Element.fromDom(document.body);
  Insert.append(body, page);
  cleanup.add(() => Remove.remove(page));

  const outerStore = TestStore();
  const store = TestStore();

  const onBodyKeydown = DomEvent.bind(body, 'keydown', (evt) => {
    if (evt.raw().which === Keys.backspace()) {
      outerStore.adder('Backspace on ' + Node.name(evt.target()) + ': preventDefault = ' + evt.raw().defaultPrevented)();
    }
  });
  cleanup.add(onBodyKeydown.unbind);

  const triggerEvent = (eventName, event) => {
    const target = event.target();
    const targetValue = Node.isText(target) ? 'text(' + Text.get(target) + ')' : Attr.get(target, 'class');
    store.adder({ eventName, target: targetValue })();
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

    Logger.t(
      'Check that backspace is NOT prevent defaulted on inputs',
      GeneralSteps.sequence([
        Keyboard.sKeydown(doc, Keys.backspace(), { }),
        outerStore.sAssertEq('Checking backspace gets prevent default on inputs', [ 'Backspace on input: preventDefault = false' ]),
        outerStore.sClear
      ])
    ),

    store.sClear
  ]);

  const sTestFocusContentEditable = GeneralSteps.sequence([
    FocusTools.sSetFocus(
      'Focusing test input',
      page,
      '.test-contenteditable'
    ),

    store.sAssertEq(
      'Checking event log after focusing test-contenteditable',
      [
        { eventName: 'focusout', target: 'test-input' },
        { eventName: 'focusin', target: 'test-contenteditable' }
      ]
    ),

    Logger.t(
      'Check that backspace is NOT prevent defaulted on contenteditable',
      GeneralSteps.sequence([
        Keyboard.sKeydown(doc, Keys.backspace(), { }),
        outerStore.sAssertEq('Checking backspace gets prevent default on contenteditable', [ 'Backspace on div: preventDefault = false' ]),
        outerStore.sClear
      ])
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
        { eventName: 'focusout', target: 'test-contenteditable' },
        { eventName: 'focusin', target: 'focusable-span' },
        { eventName: 'alloy.blur.post', target: 'test-input' },
        { eventName: 'alloy.blur.post', target: 'test-contenteditable' }
      ]
    ),

    Logger.t(
      'Check that backspace is prevent defaulted on spans',
      GeneralSteps.sequence([
        Keyboard.sKeydown(doc, Keys.backspace(), { }),
        outerStore.sAssertEq('Checking backspace gets prevent default on spans', [ 'Backspace on span: preventDefault = true' ]),
        outerStore.sClear
      ])
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

  const sTestMouseOperation = (eventName, op) => {
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

  const sTestUnbind = GeneralSteps.sequence([
    Step.sync(() => {
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
  });

  Pipeline.async({}, [
    sTestFocusInput,
    sTestFocusContentEditable,
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

    // TODO: Add API support to agar
    sTestChange,
    sTestTransitionEnd,

    sTestUnbind
  ], cleanup.wrap(success), cleanup.wrap(failure));
});
