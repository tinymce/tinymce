import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Cell, Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

interface HandlerAndArgs {
  readonly eventArgs: Cell<EditorEvent<any>>;
  readonly handler: (e: EditorEvent<any>) => void;
}

describe('browser.tinymce.core.dom.SelectionEventsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const bindEventMutator = (editor: Editor, eventName: string, mutator: (editor: Editor, e: EditorEvent<any>) => void): HandlerAndArgs => {
    const eventArgs = Cell(null);

    const handler = (e: EditorEvent<any>) => {
      mutator(editor, e);
      eventArgs.set(e);
    };

    editor.on(eventName, handler);
    return {
      eventArgs,
      handler
    };
  };

  const bindEvent = (editor: Editor, eventName: string) => bindEventMutator(editor, eventName, Fun.noop);

  const unbindEvent = (editor: Editor, eventName: string, value: HandlerAndArgs) => {
    editor.off(eventName, value.handler);
  };

  const assertSetSelectionEventArgs = (editor: Editor, expectedForward: boolean | undefined, value: HandlerAndArgs) => {
    assert.equal(value.eventArgs.get().forward, expectedForward, 'Should be expected forward flag');
    assertSelectAllRange(editor, value.eventArgs.get().range);
  };

  const getSelectAllRng = (editor: Editor) => {
    const rng = document.createRange();
    rng.setStartBefore(editor.getBody().firstChild as Node);
    rng.setEndAfter(editor.getBody().firstChild as Node);
    return rng;
  };

  const setRng = (editor: Editor, forward: boolean | undefined) => {
    editor.selection.setRng(getSelectAllRng(editor), forward);
  };

  const getRng = (editor: Editor) => {
    return editor.selection.getRng();
  };

  const selectAll = (editor: Editor, eventArgs: { range: Range }) => {
    eventArgs.range = getSelectAllRng(editor);
  };

  const assertSelectAllRange = (editor: Editor, actualRng: Range) => {
    Assertions.assertDomEq(
      'Should be expected startContainer',
      TinyDom.body(editor),
      SugarElement.fromDom(actualRng.startContainer)
    );

    Assertions.assertDomEq(
      'Should be expected endContainer',
      TinyDom.body(editor),
      SugarElement.fromDom(actualRng.endContainer)
    );
  };

  it('SetSelectionRange event', () => {
    const editor = hook.editor();
    const value = bindEvent(editor, 'SetSelectionRange');
    editor.setContent('<p>a</p>');
    setRng(editor, undefined);
    assertSetSelectionEventArgs(editor, undefined, value);
    setRng(editor, true);
    assertSetSelectionEventArgs(editor, true, value);
    setRng(editor, false);
    assertSetSelectionEventArgs(editor, false, value);
    unbindEvent(editor, 'SetSelectionRange', value);
  });

  it('AfterSetSelectionRange event', () => {
    const editor = hook.editor();
    const value = bindEvent(editor, 'AfterSetSelectionRange');
    editor.setContent('<p>a</p>');
    setRng(editor, undefined);
    assert.typeOf(value.eventArgs.get().forward, 'undefined');
    setRng(editor, true);
    assertSetSelectionEventArgs(editor, true, value);
    setRng(editor, false);
    assertSetSelectionEventArgs(editor, false, value);
    unbindEvent(editor, 'AfterSetSelectionRange', value);
  });

  it('GetSelectionRange event', () => {
    const editor = hook.editor();
    const value = bindEventMutator(editor, 'GetSelectionRange', selectAll);
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    getRng(editor);
    assertSelectAllRange(editor, editor.selection.getRng());
    assertSelectAllRange(editor, value.eventArgs.get().range);
    unbindEvent(editor, 'GetSelectionRange', value);
  });
});
