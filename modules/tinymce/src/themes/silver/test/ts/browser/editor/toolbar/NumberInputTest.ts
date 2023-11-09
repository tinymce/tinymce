import { FocusTools, Keys, Mouse, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Optional, Strings } from '@ephox/katamari';
import { SugarBody, SugarElement, SugarShadowDom, Value } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyState, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

describe('browser.tinymce.themes.silver.throbber.NumberInputTest', () => {
  const setInputSelection = (toolbarInput: Optional<HTMLInputElement>, index: number) => toolbarInput.each((input) => {
    input.selectionStart = index;
    input.selectionEnd = index;
  });

  const checkInputSelection = (toolbarInput: Optional<HTMLInputElement>, index: number, message?: string) => toolbarInput.fold(
    () => assert.fail('input should be found'),
    (input) => {
      assert.equal(input.selectionStart, index, `Start: ${message}`);
      assert.equal(input.selectionEnd, index, `End: ${message}`);
    }
  );

  const pDisabledShouldNotExist = (editor: Editor, selector: string) =>
    Waiter.pTryUntil('Disabled should not exist', () => UiFinder.notExists(TinyUiActions.getUiRoot(editor), `.tox-number-input ${selector}[disabled="disabled"]`));

  const pDisabledShouldExist = (editor: Editor, selector: string) =>
    UiFinder.pWaitFor('Plus button should be disabled', TinyUiActions.getUiRoot(editor), `.tox-number-input ${selector}[disabled="disabled"]`);

  let eventCount = 0;
  let lastEventValue = '';
  const testWithEvents = (testFn: (editor: Editor) => void | Promise<void>) => async () => {
    const eventTester = (e: EditorEvent<{ value: string }>) => {
      eventCount++;
      lastEventValue = e.value;
    };

    eventCount = 0;
    lastEventValue = '';
    const editor = hook.editor();
    editor.on('FontSizeInputTextUpdate', eventTester);
    await testFn(editor);
    editor.off('FontSizeInputTextUpdate', eventTester);
  };

  const assertNoEvent = () => {
    assert.equal(eventCount, 0);
    assert.equal(lastEventValue, '');
  };

  const assertEvent = (count: number, value: string) => {
    assert.equal(eventCount, count);
    assert.equal(lastEventValue, value);
  };

  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: [ 'fontsizeinput' ]
  }, []);

  it('TINY-9429: plus and minus should increase and decrease font size of the current selection',
    testWithEvents((editor) => {
      editor.setContent('<p style="font-size: 16px;">abc</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

      assertNoEvent();

      TinyUiActions.clickOnToolbar(editor, '.tox-number-input .plus');
      TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 17px;">b</span>c</p>');
      assertEvent(1, '17px');

      TinyUiActions.clickOnToolbar(editor, '.tox-number-input .minus');
      TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 16px;">b</span>c</p>');
      assertEvent(2, '16px');

      TinyUiActions.tapOnToolbar(editor, '.tox-number-input .plus');
      TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 17px;">b</span>c</p>');
      assertEvent(3, '17px');

      TinyUiActions.tapOnToolbar(editor, '.tox-number-input .minus');
      TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 16px;">b</span>c</p>');
      assertEvent(4, '16px');
    }));

  it('TINY-10129: plus and minus should not increase and decrease font size when the editor is readonly', () => {
    const editor = hook.editor();
    editor.setContent('<p style="font-size: 16px;">abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);
    editor.mode.set('readonly');

    TinyUiActions.clickOnToolbar(editor, '.tox-number-input .plus');
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">abc</p>');
    assert.equal(Value.get(UiFinder.findIn<HTMLInputElement>(TinyUiActions.getUiRoot(editor), '.tox-number-input input').getOrDie()), '16px');

    TinyUiActions.clickOnToolbar(editor, '.tox-number-input .minus');
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">abc</p>');

    editor.mode.set('design');
  });

  it('TINY-10129: Toolbar buttons should be properly disabled', async () => {
    const editor = hook.editor();
    editor.setContent('<p style="font-size: 16px;">abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    await pDisabledShouldNotExist(editor, '.plus');
    await pDisabledShouldNotExist(editor, '.minus');
    await pDisabledShouldNotExist(editor, 'input');

    editor.mode.set('readonly');

    await pDisabledShouldExist(editor, '.plus');
    await pDisabledShouldExist(editor, '.minus');
    await pDisabledShouldExist(editor, 'input');

    editor.mode.set('design');

    await pDisabledShouldNotExist(editor, '.plus');
    await pDisabledShouldNotExist(editor, '.minus');
    await pDisabledShouldNotExist(editor, 'input');
  });

  it('TINY-9429: should be possible to change the font size from the input',
    testWithEvents(async (editor) => {
      editor.setContent('<p style="font-size: 16px;">abc</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

      TinyUiActions.clickOnToolbar(editor, '.tox-number-input input');
      assertNoEvent();

      const input: SugarElement<HTMLInputElement> = TinyUiActions.clickOnToolbar(editor, '.tox-number-input input');
      UiControls.setValue(input, '15px');
      const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));
      FocusTools.setFocus(root, '.tox-number-input input');
      await FocusTools.pTryOnSelector('Focus should be on input', root, '.tox-number-input input');
      TinyUiActions.keystroke(editor, Keys.enter());

      TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 15px;">b</span>c</p>');
      assertEvent(1, '15px');
    }));

  it('TINY-9429: when input is selected arrow up should increase the size and arrow down decrease it', async () => {
    const editor = hook.editor();
    const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));
    editor.setContent('<p style="font-size: 16px;">abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should be on input', root, '.tox-number-input input');
    TinyUiActions.keystroke(editor, Keys.up());
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 17px;">b</span>c</p>');

    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should be on input', root, '.tox-number-input input');
    TinyUiActions.keystroke(editor, Keys.down());
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 16px;">b</span>c</p>');

    const input: SugarElement<HTMLInputElement> = TinyUiActions.clickOnToolbar(editor, '.tox-number-input input');
    UiControls.setValue(input, '2em');
    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should be on input', root, '.tox-number-input input');
    TinyUiActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 2em;">b</span>c</p>');

    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should be on input', root, '.tox-number-input input');
    TinyUiActions.keystroke(editor, Keys.up());
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 2.1em;">b</span>c</p>');

    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should be on input', root, '.tox-number-input input');
    TinyUiActions.keystroke(editor, Keys.down());
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 2em;">b</span>c</p>');
  });

  it('TINY-9429: should navigate correctly via keyboard', async () => {
    const editor = hook.editor();
    const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));

    FocusTools.setFocus(root, '.tox-number-input');
    await FocusTools.pTryOnSelector('Focus should be on input', root, '.tox-number-input');
    TinyUiActions.keystroke(editor, Keys.enter());
    await FocusTools.pTryOnSelector('minus button should be the first selection', root, '.tox-number-input .minus');

    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should be on input', root, '.tox-number-input input');

    TinyUiActions.keystroke(editor, Keys.escape());
    await FocusTools.pTryOnSelector('With escape it should pass from input to its wrapper', root, '.tox-number-input .tox-input-wrapper');

    TinyUiActions.keystroke(editor, Keys.space());
    await FocusTools.pTryOnSelector('With space it should pass from input wrapper to input', root, '.tox-number-input input');

    TinyUiActions.keystroke(editor, Keys.escape());
    await FocusTools.pTryOnSelector('With escape it should pass from input to its wrapper', root, '.tox-number-input .tox-input-wrapper');

    TinyUiActions.keystroke(editor, Keys.enter());
    await FocusTools.pTryOnSelector('With enter it should pass from input wrapper to input', root, '.tox-number-input input');

    TinyUiActions.keystroke(editor, Keys.escape());
    await FocusTools.pTryOnSelector('With escape it should pass from input to its wrapper', root, '.tox-number-input .tox-input-wrapper');

    TinyUiActions.keystroke(editor, Keys.left());
    await FocusTools.pTryOnSelector('With left it should pass from input-wrapper to minus button', root, '.tox-number-input .minus');

    TinyUiActions.keystroke(editor, Keys.right());
    await FocusTools.pTryOnSelector('With right it should pass from minut button to input-wrapper', root, '.tox-number-input .tox-input-wrapper');

    TinyUiActions.keystroke(editor, Keys.right());
    await FocusTools.pTryOnSelector('With right it should pass from input-wrapper to plus button', root, '.tox-number-input .plus');

    TinyUiActions.keystroke(editor, Keys.escape());
    await FocusTools.pTryOnSelector('With escape it should pass from plus button to number-input', root, '.tox-number-input');
  });

  it('TINY-9429: arrow up and arrow down should not change caret position in the input', async () => {
    const editor = hook.editor();
    const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));
    const toolbarInput: Optional<HTMLInputElement> = Optional.from(root.dom.querySelector('.tox-input-wrapper input') as HTMLInputElement);
    editor.setContent('<p style="font-size: 10px;">abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should be on input', root, '.tox-number-input input');
    setInputSelection(toolbarInput, 2);

    TinyUiActions.keystroke(editor, Keys.up());

    checkInputSelection(toolbarInput, 2, 'selection should be preserved');
    TinyAssertions.assertContent(editor, '<p style="font-size: 10px;">a<span style="font-size: 11px;">b</span>c</p>');

    TinyUiActions.keystroke(editor, Keys.down());
    TinyUiActions.keystroke(editor, Keys.down());

    checkInputSelection(
      toolbarInput,
      1,
      'switching from 2 digit number to 1 digit number should mantain the selection beween the number and the unit'
    );
    TinyAssertions.assertContent(editor, '<p style="font-size: 10px;">a<span style="font-size: 9px;">b</span>c</p>');

    editor.setContent('<p style="font-size: 1px;">abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should be on input', root, '.tox-number-input input');

    setInputSelection(toolbarInput, 1);

    TinyUiActions.keystroke(editor, Keys.down());

    TinyAssertions.assertContent(editor, '<p style="font-size: 1px;">a<span style="font-size: 0px;">b</span>c</p>');
    checkInputSelection(toolbarInput, 1, 'selection should be preserved');

    TinyUiActions.keystroke(editor, Keys.down());

    TinyAssertions.assertContent(editor, '<p style="font-size: 1px;">a<span style="font-size: 0px;">b</span>c</p>');

    checkInputSelection(toolbarInput, 1, 'selection should be preserved');
  });

  it('TINY-9429: plus and minus button should preserve focus after activation via `enter` and `space`', async () => {
    const editor = hook.editor();
    const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));
    editor.setContent('<p style="font-size: 16px;">abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    FocusTools.setFocus(root, '.tox-number-input .minus');
    await FocusTools.pTryOnSelector('Focus should be on the minus button', root, '.tox-number-input .minus');

    TinyUiActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 15px;">b</span>c</p>');
    await FocusTools.pTryOnSelector('Focus should be not change after enter is pressed', root, '.tox-number-input .minus');

    TinyUiActions.keystroke(editor, Keys.space());
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 14px;">b</span>c</p>');
    await FocusTools.pTryOnSelector('Focus should be not change after space is pressed', root, '.tox-number-input .minus');

    editor.setContent('<p style="font-size: 16px;">abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    FocusTools.setFocus(root, '.tox-number-input .plus');
    await FocusTools.pTryOnSelector('Focus should be on the plus button', root, '.tox-number-input .plus');

    TinyUiActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 17px;">b</span>c</p>');
    await FocusTools.pTryOnSelector('Focus should be not change after enter is pressed', root, '.tox-number-input .plus');

    TinyUiActions.keystroke(editor, Keys.space());
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 18px;">b</span>c</p>');
    await FocusTools.pTryOnSelector('Focus should be not change after space is pressed', root, '.tox-number-input .plus');
  });

  it('TINY-9429: plus and minus buttons should lose focus when the user goes with the mouse over the input', async () => {
    const editor = hook.editor();
    const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));
    editor.setContent('<p style="font-size: 16px;">abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    FocusTools.setFocus(root, '.tox-number-input .minus');
    await FocusTools.pTryOnSelector('Focus should be on the minus button', root, '.tox-number-input .minus');

    Mouse.hoverOn(root, '.tox-number-input .tox-input-wrapper');

    await FocusTools.pTryOnSelector('Focus should not be on the minus button', root, 'body');

    FocusTools.setFocus(root, '.tox-number-input .plus');
    await FocusTools.pTryOnSelector('Focus should be on the plus button', root, '.tox-number-input .plus');

    Mouse.hoverOn(root, '.tox-number-input .tox-input-wrapper');

    await FocusTools.pTryOnSelector('Focus should not be on the plus button', root, 'body');
  });

  it('TINY-9429: plus and minus buttons should put focus back to the editor when they are clicked', async () => {
    const editor = hook.editor();
    const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));
    editor.setContent('<p style="font-size: 16px;">abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    TinyUiActions.clickOnToolbar(editor, '.tox-number-input .plus');
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 17px;">b</span>c</p>');
    await FocusTools.pTryOnSelector('Focus should be on the editor', root, '.tox-edit-area__iframe');

    TinyUiActions.clickOnToolbar(editor, '.tox-number-input .minus');
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 16px;">b</span>c</p>');
    await FocusTools.pTryOnSelector('Focus should be on the editor', root, '.tox-edit-area__iframe');
  });

  it('TINY-9585: inserting just a number it should set the size at that number with `font_size_input_default_unit` or `pt` as unit', async () => {
    const editor = hook.editor();
    editor.setContent('<p style="font-size: 16px;">abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    TinyUiActions.clickOnToolbar(editor, '.tox-number-input input');

    const input = TinyUiActions.clickOnToolbar<HTMLInputElement>(editor, '.tox-number-input input');
    UiControls.setValue(input, '15');
    const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));
    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should be on input', root, '.tox-number-input input');
    TinyUiActions.keystroke(editor, Keys.enter());

    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 15pt;">b</span>c</p>');

    editor.options.set('font_size_input_default_unit', 'px');

    UiControls.setValue(input, '20');
    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should be on input', root, '.tox-number-input input');
    TinyUiActions.keystroke(editor, Keys.enter());

    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 20px;">b</span>c</p>');

    editor.options.unset('font_size_input_default_unit');
  });

  it('TINY-9585: if `font_size_input_default_unit` is set to invalid unit it does not try to apply that invalid unit to the `font-size`', async () => {
    const editor = hook.editor();
    editor.setContent('<p style="font-size: 16px;">abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    TinyUiActions.clickOnToolbar(editor, '.tox-number-input input');

    const input = TinyUiActions.clickOnToolbar<HTMLInputElement>(editor, '.tox-number-input input');
    UiControls.setValue(input, '15');
    const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));
    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should be on input', root, '.tox-number-input input');
    TinyUiActions.keystroke(editor, Keys.enter());

    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 15pt;">b</span>c</p>');

    editor.options.set('font_size_input_default_unit', 'fake_unit');

    UiControls.setValue(input, '20');
    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should be on input', root, '.tox-number-input input');
    TinyUiActions.keystroke(editor, Keys.enter());

    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 15pt;">b</span>c</p>');

    editor.options.unset('font_size_input_default_unit');
  });

  it('TINY-9598: pressing enter in the input field should take the focus back to the editor to allow user to digit with the new size', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>\n<p>b</p>');
    TinySelections.setCursor(editor, [ 1 ], 1);
    TinyUiActions.clickOnToolbar(editor, '.tox-number-input input');

    const input = TinyUiActions.clickOnToolbar<HTMLInputElement>(editor, '.tox-number-input input');
    const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));
    FocusTools.setFocus(root, '.tox-number-input input');
    UiControls.setValue(input, '20em');
    assert.isFalse(editor.hasFocus(), 'before enter editor should not have focus');
    TinyUiActions.keystroke(editor, Keys.enter());
    assert.isTrue(editor.hasFocus(), 'after enter editor should have focus');
  });

  it('TINY-9754: changing unit to an invalid unit should not set the size to 0', async () => {
    const editor = hook.editor();
    const originalFontSize = '18px';
    editor.setContent(`<p style="font-size: ${originalFontSize};">abc</p>`);
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    TinyUiActions.clickOnToolbar(editor, '.tox-number-input input');

    const input = TinyUiActions.clickOnToolbar<HTMLInputElement>(editor, '.tox-number-input input');
    const invalidValue = '15invalid_unit';
    UiControls.setValue(input, invalidValue);
    assert.equal(input.dom.value, invalidValue, 'the value in the input should be setted to the invalid value');
    const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));
    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should be on input', root, '.tox-number-input input');
    TinyUiActions.keystroke(editor, Keys.enter());

    assert.equal(input.dom.value, originalFontSize, 'the value in the input should go back to the previous value');
    TinyAssertions.assertContent(editor, `<p style="font-size: ${originalFontSize};">a<span style="font-size: ${originalFontSize};">b</span>c</p>`);
  });

  it('TINY-10330: the presence and updates of fontsizeinput should not trigger warnings', async () => {
    // eslint-disable-next-line no-console
    const storedConsoleWarn = console.warn;
    const warnings: string[] = [];

    // eslint-disable-next-line no-console
    console.warn = (a) => {
      storedConsoleWarn(a);
      warnings.push(a);
    };

    const editor = hook.editor();
    editor.setContent('<p style="font-size: 20px;">abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);
    const input = TinyUiActions.clickOnToolbar<HTMLInputElement>(editor, '.tox-number-input input');
    await Waiter.pTryUntilPredicate(`Wait for the new input value is setted`, () => input.dom.value === '20px');

    assert.isTrue(Arr.forall(warnings, (warn) => !Strings.contains(warn, 'The component must be in a context to execute')));

    // eslint-disable-next-line no-console
    console.warn = storedConsoleWarn;
  });

  context('Noneditable root', () => {
    it('TINY-9669: Disable outdent on noneditable content', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        const body = SugarBody.body();
        editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
        UiFinder.exists(body, '[aria-label="Decrease font size"]:disabled');
        UiFinder.exists(body, '.tox-number-input input[type="text"]:disabled');
        UiFinder.exists(body, '[aria-label="Increase font size"]:disabled');
        TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
        UiFinder.exists(body, '[aria-label="Decrease font size"]:not(:disabled)');
        UiFinder.exists(body, '.tox-number-input input[type="text"]:not(:disabled)');
        UiFinder.exists(body, '[aria-label="Increase font size"]:not(:disabled)');
      });
    });
  });
});
