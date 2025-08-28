import { before, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Class } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.ModeTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    readonly: true
  }, []);

  const assertBodyClass = (editor: Editor, cls: string, state: boolean) => {
    assert.equal(Class.has(TinyDom.body(editor), cls), state, 'Should be the expected class state');
  };

  const registerTestModes = (editor: Editor) => {
    editor.mode.register('customDesign', {
      activate: Fun.noop,
      deactivate: Fun.noop,
      editorReadOnly: false
    });
    editor.mode.register('customReadonly', {
      activate: Fun.noop,
      deactivate: Fun.noop,
      editorReadOnly: true
    });

    editor.mode.register('failingActivateReadonly', {
      activate: Fun.die('whoops'),
      deactivate: Fun.noop,
      editorReadOnly: true
    });
    editor.mode.register('failingDeactivateDesign', {
      activate: Fun.noop,
      deactivate: Fun.die('haha'),
      editorReadOnly: false
    });
  };

  const assertMode = (editor: Editor, expectedMode: string) => {
    assert.equal(editor.mode.get(), expectedMode, 'Should be the expected mode');
  };

  const setMode = (editor: Editor, mode: string) => {
    editor.mode.set(mode);
  };

  before(() => {
    const editor = hook.editor();
    registerTestModes(editor);
  });

  it('validate default modes cannot be overwritten', () => {
    const editor = hook.editor();
    assert.throws(() => {
      editor.mode.register('design', {
        activate: Fun.noop,
        deactivate: Fun.noop,
        editorReadOnly: false
      });
    }, /Cannot override default mode design/, 'registering a new design mode should fail');
    assert.throws(() => {
      editor.mode.register('readonly', {
        activate: Fun.noop,
        deactivate: Fun.noop,
        editorReadOnly: false
      });
    }, /Cannot override default mode readonly/, 'registering a new readonly mode should fail');
  });

  it('test default API', () => {
    const editor = hook.editor();
    assertMode(editor, 'readonly');
    assertBodyClass(editor, 'mce-content-readonly', true);
    setMode(editor, 'design');
    assertMode(editor, 'design');
    assertBodyClass(editor, 'mce-content-readonly', false);
    setMode(editor, 'readonly');
    assertMode(editor, 'readonly');
    assertBodyClass(editor, 'mce-content-readonly', true);
  });

  it('test custom modes (aliases of design and readonly)', () => {
    const editor = hook.editor();
    setMode(editor, 'customDesign');
    assertMode(editor, 'customDesign');
    assertBodyClass(editor, 'mce-content-readonly', false);
    setMode(editor, 'customReadonly');
    assertMode(editor, 'customReadonly');
    assertBodyClass(editor, 'mce-content-readonly', true);
  });

  it('test failing to activate a readonly-like mode leaves the editor in design', () => {
    const editor = hook.editor();
    setMode(editor, 'design');
    setMode(editor, 'failingActivateReadonly');
    assertMode(editor, 'design');
    assertBodyClass(editor, 'mce-content-readonly', false);
  });

  it('test failing to deactivate a design-like mode still switches to readonly', () => {
    const editor = hook.editor();
    setMode(editor, 'failingDeactivateDesign');
    setMode(editor, 'readonly');
    assertMode(editor, 'readonly');
    assertBodyClass(editor, 'mce-content-readonly', true);
  });
});
