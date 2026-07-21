import { after, Assert, before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { Class, Css, Focus, Html, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';

import * as RealClipboard from 'ephox/agar/api/RealClipboard';
import { RealKeys } from 'ephox/agar/api/RealKeys';
import * as RealMouse from 'ephox/agar/api/RealMouse';
import * as UiControls from 'ephox/agar/api/UiControls';
import * as Waiter from 'ephox/agar/api/Waiter';

describe('webdriver.RealEffectsTest', () => {
  const platform = PlatformDetection.detect();
  const selectAllModifier = platform.os.isMacOS() ? { metaKey: true } : { ctrlKey: true };

  let container: SugarElement<HTMLDivElement>;
  let input: SugarElement<HTMLInputElement>;
  let button: SugarElement<HTMLButtonElement>;
  let style: SugarElement<HTMLStyleElement>;

  // Poll the real post-condition rather than assert once after a fixed sleep: real
  // input has variable round-trip latency, so a single eager assert races it.
  const pAssertInputValue = (label: string, expected: string): Promise<void> =>
    Waiter.pTryUntil(label, () => Assert.eq(label, expected, UiControls.getValue(input)));

  const pAssertButtonBorder = (label: string, expected: string): Promise<void> =>
    Waiter.pTryUntil(label, () => {
      const prop = platform.browser.isFirefox() ? 'border-right-color' : 'border-color';
      Assert.eq(label, expected, Css.get(button, prop));
    });

  before(() => {
    container = SugarElement.fromTag('div');

    input = SugarElement.fromTag('input');
    Insert.append(container, input);

    style = SugarElement.fromTag('style');
    Html.set(style, 'button { border: 1px solid black; }\nbutton.test:hover { border: 1px solid white }');
    Insert.append(SugarElement.fromDom(document.head), style);

    button = SugarElement.fromTag('button');
    Class.add(button, 'test');
    Html.set(button, 'Mouse over me');
    Insert.append(container, button);

    Insert.append(SugarBody.body(), container);
  });

  after(() => {
    if (container) {
      Remove.remove(container);
    }
    if (style) {
      Remove.remove(style);
    }
  });

  context('real keyboard and clipboard input', () => {
    // Each test starts from a known, focused, empty input so it does not depend on
    // whatever a previous test left behind.
    beforeEach(() => {
      UiControls.setValue(input, '');
      Focus.focus(input);
    });

    it('enters text with real key presses', async () => {
      await RealKeys.pSendKeysOn('input', [ RealKeys.text('I am typing this') ]);
      await pAssertInputValue('After typing', 'I am typing this');
    });

    it('removes characters with real backspace', async () => {
      await RealKeys.pSendKeysOn('input', [ RealKeys.text('I am typing thisXX') ]);
      await pAssertInputValue('After typing', 'I am typing thisXX');

      await RealKeys.pSendKeysOn('input', [ RealKeys.backspace(), RealKeys.backspace() ]);
      await pAssertInputValue('After backspacing the two extra characters', 'I am typing this');
    });

    it('copies and pastes text through the real clipboard', async () => {
      await RealKeys.pSendKeysOn('input', [ RealKeys.text('I am typing this') ]);
      await pAssertInputValue('After typing', 'I am typing this');

      // Select all, copy, then delete the selection — an empty value confirms select-all worked.
      await RealKeys.pSendKeysOn('input', [ RealKeys.combo(selectAllModifier, 'a') ]);
      await RealClipboard.pCopy('input');
      await RealKeys.pSendKeysOn('input', [ RealKeys.backspace() ]);
      await pAssertInputValue('After deleting the selected-all content', '');

      await RealClipboard.pPaste('input');
      await pAssertInputValue('After pasting the copied text back', 'I am typing this');
    });
  });

  context('real mouse hover', () => {
    it('shows the default border when the button is not hovered', async () => {
      await RealMouse.pMoveToOn('input');
      await pAssertButtonBorder('Initial, non-hovered border', 'rgb(0, 0, 0)');
    });

    it('shows the hover border when the button is hovered', async () => {
      await RealMouse.pMoveToOn('button.test');
      // Safari resets the mouse immediately after the move, so the hovered state can't be asserted.
      if (!platform.browser.isSafari()) {
        await pAssertButtonBorder('Hovered border', 'rgb(255, 255, 255)');
      }
    });
  });
});
