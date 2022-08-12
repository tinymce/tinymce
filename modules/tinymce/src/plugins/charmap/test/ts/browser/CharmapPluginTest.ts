import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import Plugin from 'tinymce/plugins/charmap/Plugin';

describe('browser.tinymce.plugins.charmap.CharMapPluginTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'charmap',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TBA: Replace characters by array', () => {
    const editor = hook.editor();
    editor.options.set('charmap', [
      [ 65, 'Latin A' ],
      [ 66, 'Latin B' ]
    ]);

    assert.deepEqual(editor.plugins.charmap.getCharMap(), [
      {
        name: 'User Defined',
        characters: [
          [ 65, 'Latin A' ],
          [ 66, 'Latin B' ]
        ]
      }
    ]);
  });

  it('TBA: Replace characters by function', () => {
    const editor = hook.editor();
    editor.options.set('charmap', () => [
      [ 65, 'Latin A fun' ],
      [ 66, 'Latin B fun' ]
    ]);

    assert.deepEqual(editor.plugins.charmap.getCharMap(), [
      {
        name: 'User Defined',
        characters: [
          [ 65, 'Latin A fun' ],
          [ 66, 'Latin B fun' ]
        ]
      }
    ]);
  });

  it('TBA: Append characters by array', () => {
    const editor = hook.editor();
    editor.options.set('charmap', [
      [ 67, 'Latin C' ]
    ]);

    editor.options.set('charmap_append', [
      [ 65, 'Latin A' ],
      [ 66, 'Latin B' ]
    ]);

    assert.deepEqual(editor.plugins.charmap.getCharMap(), [
      {
        name: 'User Defined',
        characters: [
          [ 67, 'Latin C' ],
          [ 65, 'Latin A' ],
          [ 66, 'Latin B' ]
        ]
      }
    ]);
  });

  it('TBA: Append characters by function', () => {
    const editor = hook.editor();
    editor.options.set('charmap', [
      [ 67, 'Latin C' ]
    ]);

    editor.options.set('charmap_append', () => [
      [ 65, 'Latin A fun' ],
      [ 66, 'Latin B fun' ]
    ]);

    assert.deepEqual(editor.plugins.charmap.getCharMap(), [
      {
        name: 'User Defined',
        characters: [
          [ 67, 'Latin C' ],
          [ 65, 'Latin A fun' ],
          [ 66, 'Latin B fun' ]]
      }
    ]);
  });

  it('TBA: Insert character', () => {
    const editor = hook.editor();
    let lastEvt: EditorEvent<{ chr: string }> | undefined;

    editor.on('InsertCustomChar', (e) => {
      lastEvt = e;
    });

    editor.plugins.charmap.insertChar('A');
    assert.equal(lastEvt?.chr, 'A');
  });
});
