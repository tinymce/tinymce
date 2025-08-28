import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { PostProcessEvent, PreProcessEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

describe('browser.tinymce.core.dom.SerializerEventsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    inline: true,
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('Pre/post process events', () => {
    const editor = hook.editor();
    let preProcessArgs: EditorEvent<PreProcessEvent> | undefined;
    let postProcessArgs: EditorEvent<PostProcessEvent> | undefined;

    editor.on('PreProcess', (o) => {
      preProcessArgs = o;
      editor.dom.setAttrib(preProcessArgs.node.getElementsByTagName('span')[0], 'class', 'abc');
    });

    editor.on('PostProcess', (o) => {
      o.content = o.content.replace(/<em>/g, '<em class="123">');
      postProcessArgs = o;
    });

    editor.setContent('<p><span id="test2"><em>abc</em></span>123<a href="file.html" data-mce-href="file.html">link</a>');
    Assertions.assertHtml(
      'Should be expected altered html',
      '<p><span id="test2" class="abc"><em class="123">abc</em></span>123<a href="file.html">link</a></p>',
      editor.serializer.serialize(editor.getBody(), { test: 'abc', getInner: true })
    );

    assert.equal(preProcessArgs?.test, 'abc', 'Should be expected preprocess custom arg');
    assert.equal(preProcessArgs?.format, 'html', 'Should be expected preprocess format');
    assert.equal(preProcessArgs?.node.firstChild?.nodeName, 'P', 'Should be expected element child');
    assert.equal(postProcessArgs?.test, 'abc', 'Should be expected postprocess custom arg');
    assert.equal(postProcessArgs?.format, 'html', 'Should be expected postprocess format');
    assert.equal(
      postProcessArgs?.content,
      '<p><span id="test2" class="abc"><em class="123">abc</em></span>123<a href="file.html">link</a></p>',
      'Should be expected postprocess format'
    );
  });
});
