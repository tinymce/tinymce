
import { Mouse } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';

describe('browser.tinymce.plugins.media.core.VideoMouseEventsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: [ 'media' ],
    toolbar: 'media',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const testMouseDownOnMediaElement = (name: string) => {
    const editor = hook.editor();
    let mouseDownCount = 0;

    const handler = () => {
      mouseDownCount++;
    };

    editor.on('mousedown', handler);
    editor.setContent(`<${name} src="about:blank"></${name}>`);
    Mouse.trueClickOn(TinyDom.body(editor), name);
    Mouse.trueClickOn(TinyDom.body(editor), name);
    assert.equal(mouseDownCount, 1, 'Should only have emitted mousedown for the initial selection click');
    editor.off('mousedown', handler);
  };

  it('TINY-10774: Mousedown should not bubble out of video elements when it is in a selected state', () => testMouseDownOnMediaElement('video'));
  it('TINY-10774: Mousedown should not bubble out of audio elements when it is in a selected state', () => testMouseDownOnMediaElement('audio'));
});
