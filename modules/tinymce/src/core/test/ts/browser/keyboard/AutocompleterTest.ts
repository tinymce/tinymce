import { Assertions, Keys, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import { TinyContentActions, TinyHooks, TinySelections, TinyDom } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/PublicApi';
import { AutocompleterEventArgs } from 'tinymce/core/autocomplete/AutocompleterEventArgs';
import { AutocompleteContext, AutocompleteLookupData } from 'tinymce/core/autocomplete/AutocompleteTypes';

describe('browser.tinymce.core.keyboard.AutoCompleterTest', () => {
  const triggerChar = '+';
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addAutocompleter('Plus1', {
        ch: triggerChar,
        minChars: 0,
        columns: 1,
        fetch: (_pattern, _maxResults) => new Promise((resolve) => {
          resolve(
            Arr.map([ 'aa', 'ab' ], (letter) => ({
              value: `plus-${letter}`,
              text: `p-${letter}`,
              icon: '+'
            }))
          );
        }),
        onAction: (autocompleteApi, rng, value) => {
          ed.selection.setRng(rng);
          ed.insertContent(value);
          autocompleteApi.hide();
        }
      });
    }
  }, []);

  const pOpenAutocompleter = async (editor: Editor) => {
    editor.focus();
    editor.setContent(`<p>${triggerChar}</p>`);
    TinySelections.setCursor(editor, [ 0, 0 ], triggerChar.length);
    TinyContentActions.keypress(editor, triggerChar.charCodeAt(0));
    // Wait 50ms for the keypress to process
    await Waiter.pWait(50);
  };

  const pUpdateWithChar = async (editor: Editor, chr: string) => {
    editor.insertContent(chr);
    TinyContentActions.keypress(editor, chr.charCodeAt(0));
    // Wait 50ms for the keypress to process
    await Waiter.pWait(50);
  };

  const pCloseAutocompleterByKey = async (editor: Editor) => {
    TinyContentActions.keydown(editor, Keys.escape());
    // Wait 50ms for the keypress to process
    await Waiter.pWait(50);
  };

  const pWaitForEvents = (events: string[], expectedEvents: string[]) =>
    Waiter.pTryUntil('Waited for events to include expected events', () => assert.deepEqual(events, expectedEvents));

  const assertRange = (editor: Editor, rng: Range, startPath: number[], startOffset: number, endPath: number[], endOffset: number) => {
    const startContainer = Hierarchy.follow(TinyDom.body(editor), startPath).getOrDie();
    const endContainer = Hierarchy.follow(TinyDom.body(editor), endPath).getOrDie();

    Assertions.assertDomEq('Should be expected start container', startContainer, SugarElement.fromDom(rng.startContainer));
    assert.equal(rng.startOffset, startOffset, 'Should be expected start offset');
    Assertions.assertDomEq('Should be expected end container', endContainer, SugarElement.fromDom(rng.endContainer));
    assert.equal(rng.endOffset, endOffset, 'Should be expected end offset');
  };

  const assertContext = (editor: Editor, context: AutocompleteContext, expectedText: string) => {
    assert.equal(context.text, expectedText);
    assert.equal(context.triggerChar, '+');
    assertRange(editor, context.range, [ 0 ], 0, [ 0 ], 1);
  };

  const asseertLookupData = (lookupData: AutocompleteLookupData, expectedMatchText: string) => {
    assert.equal(lookupData.columns, 1);
    assert.deepEqual(lookupData.highlightOn, []);
    assert.equal(lookupData.matchText, expectedMatchText);
    assert.deepEqual(lookupData.items, [
      { value: 'plus-aa', text: 'p-aa', icon: '+' },
      { value: 'plus-ab', text: 'p-ab', icon: '+' },
    ]);
    assert.isFunction(lookupData.onAction);
  };

  it('autocompleter events start, update, end by esc key', async () => {
    const editor = hook.editor();
    const events: string[] = [];
    const collect = (args: EditorEvent<AutocompleterEventArgs>) => events.push(args.type);

    editor.on('AutocompleterStart AutocompleterUpdate AutocompleterEnd', collect);
    await pOpenAutocompleter(editor);
    await pUpdateWithChar(editor, 'a');
    await pCloseAutocompleterByKey(editor);
    await pWaitForEvents(events, [ 'autocompleterstart', 'autocompleterupdate', 'autocompleterend' ]);
    editor.off('AutocompleterStart AutocompleterUpdate AutocompleterEnd', collect);
  });

  it('ReloadAutocompleter command should fire an AutocompleterUpdate event', async () => {
    const editor = hook.editor();
    const events: string[] = [];
    const collect = (args: EditorEvent<AutocompleterEventArgs>) => events.push(args.type);

    editor.on('AutocompleterUpdate', collect);
    await pOpenAutocompleter(editor);
    editor.execCommand('ReloadAutocompleter');
    await pWaitForEvents(events, [ 'autocompleterupdate' ]);
    await pCloseAutocompleterByKey(editor);
    editor.off('AutocompleterUpdate', collect);
  });

  it('CloseAutocompleter command should fire an AutocompleterEnd event', async () => {
    const editor = hook.editor();
    const events: string[] = [];
    const collect = (args: EditorEvent<AutocompleterEventArgs>) => events.push(args.type);

    editor.on('AutocompleterEnd', collect);
    await pOpenAutocompleter(editor);
    editor.execCommand('CloseAutocompleter');
    await pWaitForEvents(events, [ 'autocompleterend' ]);
    editor.off('AutocompleterEnd', collect);
  });

  it('autocompleter events start, update, end by enter key', async () => {
    const editor = hook.editor();
    const events: string[] = [];
    const collect = (args: EditorEvent<AutocompleterEventArgs>) => events.push(args.type);

    editor.on('AutocompleterStart AutocompleterUpdate AutocompleterEnd', collect);
    await pOpenAutocompleter(editor);
    await pUpdateWithChar(editor, 'a');
    TinyContentActions.keydown(editor, Keys.enter());
    await pWaitForEvents(events, [ 'autocompleterstart', 'autocompleterupdate', 'autocompleterend' ]);
    editor.off('AutocompleterStart AutocompleterUpdate AutocompleterEnd', collect);
  });

  it('autocompleter events start, update should have context', async () => {
    const editor = hook.editor();
    const eventArgs: AutocompleterEventArgs[] = [];
    const collect = (args: EditorEvent<AutocompleterEventArgs>) => eventArgs.push(args);

    editor.on('AutocompleterStart AutocompleterUpdate', collect);
    await pOpenAutocompleter(editor);

    await Waiter.pTryUntil('Waited for AutocompleterStart to include context/lookupData', () => {
      assert.equal(eventArgs.length, 1);
      assert.equal(eventArgs[0].lookupData.length, 1);

      assertContext(editor, eventArgs[0].context, '');
      asseertLookupData(eventArgs[0].lookupData[0], '');
    });

    await pUpdateWithChar(editor, 'a');

    await Waiter.pTryUntil('Waited for AutocompleterUpdate to include context/lookupData', () => {
      assert.equal(eventArgs.length, 2);
      assert.equal(eventArgs[1].lookupData.length, 1);

      assertContext(editor, eventArgs[1].context, 'a');
      asseertLookupData(eventArgs[1].lookupData[0], 'a');
    });

    editor.execCommand('CloseAutocompleter');

    editor.off('AutocompleterStart AutocompleterUpdate', collect);
  });
});
