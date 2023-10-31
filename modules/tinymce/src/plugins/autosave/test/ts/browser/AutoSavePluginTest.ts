import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyApis, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/autosave/Plugin';

describe('browser.tinymce.plugins.autosave.AutoSavePluginTest', () => {
  const baseSettings = {
    plugins: 'autosave',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  };

  const hook = TinyHooks.bddSetupLight<Editor>(baseSettings, [ Plugin ]);

  const checkIfEmpty = (editor: Editor, html: string, isEmpty: boolean): void => {
    const result = isEmpty ? 'empty.' : 'not empty.';

    assert.equal(editor.plugins.autosave.isEmpty(html), isEmpty, `The HTML "${html}" is ${result}`);
  };

  it('TBA: isEmpty true', () => {
    const editor = hook.editor();
    checkIfEmpty(editor, '', true);
    checkIfEmpty(editor, '   ', true);
    checkIfEmpty(editor, '\t\t\t', true);

    checkIfEmpty(editor, '<p id="x"></p>', true);
    checkIfEmpty(editor, '<p></p>', true);
    checkIfEmpty(editor, '<p> </p>', true);
    checkIfEmpty(editor, '<p>\t</p>', true);

    checkIfEmpty(editor, '<p><br></p>', true);
    checkIfEmpty(editor, '<p><br /></p>', true);
    checkIfEmpty(editor, '<p><br data-mce-bogus="true" /></p>', true);
    checkIfEmpty(editor, '<p><br data-mce-bogus="true" /></p>', true);

    checkIfEmpty(editor, '<h1></h1>', true);
    checkIfEmpty(editor, '<p><br data-mce-bogus="true" /><br data-mce-bogus="true" /></p>', true);
  });

  it('TBA: isEmpty false', () => {
    const editor = hook.editor();
    checkIfEmpty(editor, 'X', false);
    checkIfEmpty(editor, '   X', false);
    checkIfEmpty(editor, '\t\t\tX', false);

    checkIfEmpty(editor, '<p>X</p>', false);
    checkIfEmpty(editor, '<p> X</p>', false);
    checkIfEmpty(editor, '<p>\tX</p>', false);

    checkIfEmpty(editor, '<p><br>X</p>', false);
    checkIfEmpty(editor, '<p><br />X</p>', false);
    checkIfEmpty(editor, '<p><br data-mce-bogus="true" />X</p>', false);

    checkIfEmpty(editor, '<p><br><br></p>', false);
    checkIfEmpty(editor, '<p><br /><br /></p>', false);
    checkIfEmpty(editor, '<p><br><br>X</p>', false);
    checkIfEmpty(editor, '<p><br /><br />X</p>', false);
    checkIfEmpty(editor, '<p><br data-mce-bogus="true" /><br data-mce-bogus="true" />X</p>', false);

    checkIfEmpty(editor, '<img src="x" />', false);
  });

  it('TBA: hasDraft/storeDraft/restoreDraft', () => {
    const editor = hook.editor();
    assert.isFalse(editor.plugins.autosave.hasDraft(), 'Check if it starts with a draft');

    editor.setContent('X');
    editor.undoManager.add();
    editor.plugins.autosave.storeDraft();

    assert.isTrue(editor.plugins.autosave.hasDraft(), 'Check that adding a draft adds a draft');

    editor.setContent('Y');
    editor.undoManager.add();

    editor.plugins.autosave.restoreDraft();
    assert.equal(editor.getContent(), '<p>X</p>', 'Check that a draft can be restored');
    editor.plugins.autosave.removeDraft();
  });

  it('TBA: recognises location hash change', () => {
    const editor = hook.editor();
    assert.isFalse(editor.plugins.autosave.hasDraft(), 'Check if it starts with a draft');

    editor.setContent('X');
    editor.undoManager.add();
    editor.plugins.autosave.storeDraft();

    window.location.hash = 'test' + Math.random().toString(36).substring(7);
    assert.isFalse(editor.plugins.autosave.hasDraft(), 'Check if it notices a hash change');
    window.history.replaceState('', document.title, window.location.pathname + window.location.search);
    editor.plugins.autosave.removeDraft();
  });

  context('Content XSS', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      ...baseSettings,
      valid_elements: '*'
    }, [ Plugin ]);

    const xssFnName = 'xssfn';

    const storeAndRestoreDraft = (editor: Editor, content: string): void => {
      assert.isFalse(editor.plugins.autosave.hasDraft(), 'Check if it starts with a draft');
      TinyApis(editor).setRawContent(content);
      editor.undoManager.add();
      editor.plugins.autosave.storeDraft();
      editor.setContent('New');
      editor.undoManager.add();
      editor.plugins.autosave.restoreDraft();
      editor.plugins.autosave.removeDraft();
    };

    const testContentMxssOnRestoreDraft = (content: string) => () => {
      const editor = hook.editor();
      let hasXssOccurred = false;
      (editor.getWin() as any)[xssFnName] = () => hasXssOccurred = true;
      storeAndRestoreDraft(editor, content);
      assert.isFalse(hasXssOccurred, 'XSS should not have occurred');
      (editor.getWin() as any)[xssFnName] = null;
    };

    it('TINY-10236: Excluding data-mce-bogus="all" elements does not cause mXSS',
      testContentMxssOnRestoreDraft(`<!--<br data-mce-bogus="all">><iframe onload="window.${xssFnName}();">->`));

    it('TINY-10236: Excluding temporary attributes does not cause mXSS',
      testContentMxssOnRestoreDraft(`<!--data-mce-selected="x"><iframe onload="window.${xssFnName}();">->`));

    it('TINY-10236: Excluding ZWNBSP in comment nodes does not cause mXSS',
      testContentMxssOnRestoreDraft(`<!--\uFEFF><iframe onload="window.${xssFnName}();">->`));

    Arr.each([ 'noscript', 'script', 'xmp', 'iframe', 'noembed', 'noframes' ], (parent) => {
      it(`TINY-10305: Excluding ZWNBSP in ${parent} does not cause mXSS`,
        testContentMxssOnRestoreDraft(`<${parent}><\uFEFF/${parent}><\uFEFFiframe onload="window.${xssFnName}();"></${parent}>`));
    });
  });
});
