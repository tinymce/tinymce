import { Keys, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { InlineContent } from '@ephox/bridge';
import { Arr, Throttler } from '@ephox/katamari';
import { TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { AutocompleterEventArgs, AutocompleteLookupData } from 'tinymce/core/autocomplete/AutocompleteTypes';

describe('browser.tinymce.core.keyboard.AutocompleterTest', () => {
  const plusTriggerChar = '+';
  const dollarsTriggerChar = '$';
  // This matches the throttle time used in Autocompleter.ts
  const keyboardThrottleTimer = 50;

  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      const onAction = (autocompleteApi: InlineContent.AutocompleterInstanceApi, rng: Range, value: string) => {
        ed.selection.setRng(rng);
        ed.insertContent(value);
        autocompleteApi.hide();
      };

      const fetch = (ch: string, type: string) => (resolve: (data: InlineContent.AutocompleterContents[]) => void) => {
        resolve(Arr.map([ 'aa', 'ab' ], (letter) => ({
          value: `${type}-${letter}`,
          text: `p-${letter}`,
          icon: ch
        })));
      };

      ed.ui.registry.addAutocompleter('Plus1', {
        trigger: plusTriggerChar,
        minChars: 0,
        columns: 1,
        fetch: (_pattern, _maxResults) => new Promise(fetch(plusTriggerChar, 'plus')),
        onAction
      });

      const dollarsFetch = Throttler.last(fetch(dollarsTriggerChar, 'dollars'), keyboardThrottleTimer * 3);
      ed.ui.registry.addAutocompleter('Dollars1', {
        trigger: dollarsTriggerChar,
        minChars: 0,
        columns: 1,
        fetch: (_pattern, _maxResults) => new Promise(dollarsFetch.throttle),
        onAction
      });
    }
  }, []);

  const pOpenAutocompleter = async (editor: Editor, triggerChar: string) => {
    editor.focus();
    editor.setContent(`<p>${triggerChar}</p>`);
    TinySelections.setCursor(editor, [ 0, 0 ], triggerChar.length);
    TinyContentActions.keypress(editor, triggerChar.charCodeAt(0));
    // Wait 50ms for the keypress to process
    await Waiter.pWait(keyboardThrottleTimer);
  };

  const pUpdateWithChar = async (editor: Editor, chr: string) => {
    editor.insertContent(chr);
    TinyContentActions.keypress(editor, chr.charCodeAt(0));
    // Wait 50ms for the keypress to process
    await Waiter.pWait(keyboardThrottleTimer);
  };

  const pCloseAutocompleterByKey = async (editor: Editor) => {
    TinyContentActions.keydown(editor, Keys.escape());
    // Wait 50ms for the keypress to process
    await Waiter.pWait(keyboardThrottleTimer);
  };

  const pWaitForEvents = (events: string[], expectedEvents: string[]) =>
    Waiter.pTryUntil('Waited for events to include expected events', () => assert.deepEqual(events, expectedEvents));

  const pTestWithEvents = async (test: (eventArgs: EditorEvent<AutocompleterEventArgs>[]) => Promise<void>) => {
    const editor = hook.editor();
    const eventArgs: EditorEvent<AutocompleterEventArgs>[] = [];
    const collect = (args: EditorEvent<AutocompleterEventArgs>) => eventArgs.push(args);

    editor.on('AutocompleterStart AutocompleterUpdate', collect);

    await test(eventArgs);

    editor.execCommand('mceAutocompleterClose');
    editor.off('AutocompleterStart AutocompleterUpdate', collect);
  };

  const assertLookupData = (lookupData: AutocompleteLookupData, expectedMatchText: string, ch: string, type: string) => {
    assert.equal(lookupData.columns, 1);
    assert.deepEqual(lookupData.highlightOn, []);
    assert.equal(lookupData.matchText, expectedMatchText);
    assert.deepEqual(lookupData.items, [
      { value: `${type}-aa`, text: 'p-aa', icon: ch },
      { value: `${type}-ab`, text: 'p-ab', icon: ch },
    ]);
    assert.isFunction(lookupData.onAction);
  };

  it('TINY-8279: autocompleter events start, update, end by esc key', async () => {
    const editor = hook.editor();
    const events: string[] = [];
    const collect = (args: EditorEvent<AutocompleterEventArgs>) => events.push(args.type);

    editor.on('AutocompleterStart AutocompleterUpdate AutocompleterEnd', collect);
    await pOpenAutocompleter(editor, plusTriggerChar);
    await pUpdateWithChar(editor, 'a');
    await pCloseAutocompleterByKey(editor);
    await pWaitForEvents(events, [ 'autocompleterstart', 'autocompleterupdate', 'autocompleterend' ]);
    editor.off('AutocompleterStart AutocompleterUpdate AutocompleterEnd', collect);
  });

  it('TINY-8279: mceAutocompleterReload command should fire an AutocompleterUpdate event', async () => {
    const editor = hook.editor();
    const events: string[] = [];
    const collect = (args: EditorEvent<AutocompleterEventArgs>) => events.push(args.type);

    editor.on('AutocompleterUpdate', collect);
    await pOpenAutocompleter(editor, plusTriggerChar);
    editor.execCommand('mceAutocompleterReload');
    await pWaitForEvents(events, [ 'autocompleterupdate' ]);
    await pCloseAutocompleterByKey(editor);
    editor.off('AutocompleterUpdate', collect);
  });

  it('TINY-8279: mceAutocompleterClose command should fire an AutocompleterEnd event', async () => {
    const editor = hook.editor();
    const events: string[] = [];
    const collect = (args: EditorEvent<{}>) => {
      events.push(args.type);
    };

    editor.on('AutocompleterEnd', collect);
    await pOpenAutocompleter(editor, plusTriggerChar);
    editor.execCommand('mceAutocompleterClose');
    await pWaitForEvents(events, [ 'autocompleterend' ]);
    editor.off('AutocompleterEnd', collect);
  });

  it('TINY-8279: autocompleter events start, update, end by enter key', async () => {
    const editor = hook.editor();
    const events: string[] = [];
    const collect = (args: EditorEvent<AutocompleterEventArgs>) => events.push(args.type);

    editor.on('AutocompleterStart AutocompleterUpdate AutocompleterEnd', collect);
    await pOpenAutocompleter(editor, plusTriggerChar);
    await pUpdateWithChar(editor, 'a');
    TinyContentActions.keydown(editor, Keys.enter());
    await pWaitForEvents(events, [ 'autocompleterstart', 'autocompleterupdate', 'autocompleterend' ]);
    editor.off('AutocompleterStart AutocompleterUpdate AutocompleterEnd', collect);
  });

  it('TINY-8279: autocompleter events start, update should have lookupData', () => pTestWithEvents(async (eventArgs) => {
    const editor = hook.editor();
    await pOpenAutocompleter(editor, plusTriggerChar);

    await Waiter.pTryUntil('Waited for AutocompleterStart to include lookupData', () => {
      assert.equal(eventArgs.length, 1);
      assert.equal(eventArgs[0].type, 'autocompleterstart');
      assert.equal(eventArgs[0].lookupData.length, 1);

      assertLookupData(eventArgs[0].lookupData[0], '', '+', 'plus');
    });

    await pUpdateWithChar(editor, 'a');

    await Waiter.pTryUntil('Waited for AutocompleterUpdate to include lookupData', () => {
      assert.equal(eventArgs.length, 2);
      assert.equal(eventArgs[1].type, 'autocompleterupdate');
      assert.equal(eventArgs[1].lookupData.length, 1);

      assertLookupData(eventArgs[1].lookupData[0], 'a', '+', 'plus');
    });
  }));

  it('TINY-8552: autocompleter starts correctly with throttled fetch', () => pTestWithEvents(async (eventArgs) => {
    const editor = hook.editor();

    // Trigger and then immediately type another character
    await pOpenAutocompleter(editor, dollarsTriggerChar);
    await pUpdateWithChar(editor, 'a');

    // Note: There won't be an update event here because it didn't start until both chars had been typed
    // due to the throttle delay and the fact it only runs on the last fetch call.
    await Waiter.pTryUntil('Waited for AutocompleterStart to include lookupData', () => {
      assert.equal(eventArgs.length, 1);
      assert.equal(eventArgs[0].type, 'autocompleterstart');
      assert.equal(eventArgs[0].lookupData.length, 1);

      assertLookupData(eventArgs[0].lookupData[0], 'a', '$', 'dollars');
    });
  }));
});
