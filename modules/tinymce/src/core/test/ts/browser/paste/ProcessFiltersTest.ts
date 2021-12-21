import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { PastePostProcessEvent, PastePreProcessEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as ProcessFilters from 'tinymce/core/paste/ProcessFilters';

type PreProcessHandler = (e: EditorEvent<PastePreProcessEvent>) => void;
type PostProcessHandler = (e: EditorEvent<PastePostProcessEvent>) => void;

describe('browser.tinymce.core.paste.ProcessFiltersTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    extended_valid_elements: 'b[*]'
  }, []);

  const processPre = (editor: Editor, html: string, internal: boolean, preProcess: PreProcessHandler) => {
    editor.on('PastePreProcess', preProcess);
    const result = ProcessFilters.process(editor, html, internal);
    editor.off('PastePreProcess', preProcess);
    return result;
  };

  const processPrePost = (editor: Editor, html: string, internal: boolean, preProcess: PreProcessHandler, postProcess: PostProcessHandler) => {
    editor.on('PastePreProcess', preProcess);
    editor.on('PastePostProcess', postProcess);

    const result = ProcessFilters.process(editor, html, internal);

    editor.off('PastePreProcess', preProcess);
    editor.off('PastePostProcess', postProcess);

    return result;
  };

  const preventHandler = (e: EditorEvent<any>) => {
    e.preventDefault();
  };

  const preProcessHandler = (): PreProcessHandler => (e) => {
    e.content += 'X';
  };

  const postProcessHandler = (editor: Editor): PostProcessHandler => (e) => {
    editor.dom.remove(editor.dom.select('b', e.node), true);
  };

  const assertInternal = (expectedFlag: boolean) => (e: EditorEvent<{ internal: boolean }>) => {
    assert.equal(e.internal, expectedFlag, 'Should be expected internal flag');
  };

  it('TBA: Paste pre process only', () => {
    const editor = hook.editor();
    const result = processPre(editor, 'a', true, preProcessHandler());
    assert.deepEqual(result, { content: 'aX', cancelled: false }, 'Should be preprocessed by adding a X');
  });

  it('TBA: Paste pre/post process passthough as is', () => {
    const editor = hook.editor();
    const result = processPrePost(editor, 'a', true, Fun.noop, Fun.noop);
    assert.deepEqual(result, { content: 'a', cancelled: false }, 'Should be unchanged with safe content');
  });

  it('TBA: Paste pre/post process passthough unsafe content', () => {
    const editor = hook.editor();
    const result = processPrePost(editor, `<img src="non-existent.png" onerror="alert('!')">`, true, Fun.noop, Fun.noop);
    assert.deepEqual(result, { content: '<img src="non-existent.png">', cancelled: false }, 'Should be changed if dangerous content');
  });

  it('TBA: Paste pre/post process assert internal false', () => {
    const editor = hook.editor();
    const result = processPrePost(editor, 'a', false, assertInternal(false), assertInternal(false));
    assert.deepEqual(result, { content: 'a', cancelled: false }, 'Should be unchanged');
  });

  it('TBA: Paste pre/post process assert internal true', () => {
    const editor = hook.editor();
    const result = processPrePost(editor, 'a', true, assertInternal(true), assertInternal(true));
    assert.deepEqual(result, { content: 'a', cancelled: false }, 'Should be unchanged');
  });

  it('TBA: Paste pre/post process alter on preprocess', () => {
    const editor = hook.editor();
    const result = processPrePost(editor, 'a', true, preProcessHandler(), Fun.noop);
    assert.deepEqual(result, { content: 'aX', cancelled: false }, 'Should be preprocessed by adding a X');
  });

  it('TBA: Paste pre/post process alter on postprocess', () => {
    const editor = hook.editor();
    const result = processPrePost(editor, 'a<b>b</b>c', true, Fun.noop, postProcessHandler(editor));
    assert.deepEqual(result, { content: 'abc', cancelled: false }, 'Should have all b elements removed');
  });

  it('TBA: Paste pre/post process alter on preprocess/postprocess', () => {
    const editor = hook.editor();
    const result = processPrePost(editor, 'a<b>b</b>c', true, preProcessHandler(), postProcessHandler(editor));
    assert.deepEqual(result, { content: 'abcX', cancelled: false }, 'Should have all b elements removed and have a X added');
  });

  it('TBA: Paste pre/post process prevent default on preProcess', () => {
    const editor = hook.editor();
    const result = processPrePost(editor, 'a<b>b</b>c', true, preventHandler, postProcessHandler(editor));
    assert.deepEqual(result, { content: 'a<b>b</b>c', cancelled: true }, 'Should have all b elements removed and be cancelled');
  });

  it('TBA: Paste pre/post process prevent default on postProcess', () => {
    const editor = hook.editor();
    const result = processPrePost(editor, 'a<b>b</b>c', true, preProcessHandler(), preventHandler);
    assert.deepEqual(result, { content: 'a<b>b</b>cX', cancelled: true }, 'Should have a X added and be cancelled');
  });
});
