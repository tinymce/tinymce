import { describe, it } from '@ephox/bedrock-client';
import { Css, SelectorFind } from '@ephox/sugar';
import { TinyHooks, TinyDom } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';

describe('browser.tinymce.plugins.fullscreen.FullScreenSinkTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'fullscreen',
    toolbar: 'fullscreen',
    base_url: '/project/tinymce/js/tinymce',
    ui_mode: 'split'
  }, [ FullscreenPlugin ]);

  it('TINY-10335: Sink should have fixed css position when fullscreen is on (ui_mode="split")', () => {
    const editor = hook.editor();
    const container = TinyDom.container(editor);
    const sink = SelectorFind.sibling(container, '.tox-silver-sink').getOrDie('Could not find sink');
    assert.equal(Css.get(sink, 'position'), 'relative');
    editor.execCommand('mceFullScreen');
    assert.equal(Css.get(sink, 'position'), 'fixed');
    editor.execCommand('mceFullScreen');
    assert.equal(Css.get(sink, 'position'), 'relative');
  });
});
