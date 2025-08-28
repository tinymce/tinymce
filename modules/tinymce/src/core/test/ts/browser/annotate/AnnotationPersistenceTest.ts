import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { McEditor, TinyAssertions, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import { AnnotatorSettings } from 'tinymce/core/api/Annotator';
import Editor from 'tinymce/core/api/Editor';

import { annotate, assertMarkings } from '../../module/test/AnnotationAsserts';

describe('browser.tinymce.core.annotate.AnnotationPersistenceTest', () => {

  const runTinyWithSettings = async (annotation: AnnotatorSettings, runTests: (editor: Editor) => void) => {
    const settings = {
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed: Editor) => {
        ed.on('init', () => {
          ed.annotator.register('test-annotation', annotation);
        });
      }
    };

    const editor = await McEditor.pFromSettings<Editor>(settings);
    runTests(editor);
    McEditor.remove(editor);
  };

  const settingsWithPersistence: AnnotatorSettings = {
    persistent: true,
    decorate: (uid, data) => ({
      attributes: {
        'data-test-anything': data.anything
      },
      classes: [ 'test-class' ]
    })
  };

  const settingsWithDefaultPersistence: AnnotatorSettings = {
    decorate: (uid, data) => ({
      attributes: {
        'data-test-anything': data.anything
      },
      classes: [ 'test-class' ]
    })
  };

  const settingsWithoutPersistence: AnnotatorSettings = {
    persistent: false,
    decorate: (uid, data) => ({
      attributes: {
        'data-test-anything': data.anything
      },
      classes: [ 'test-class' ]
    })
  };

  const setupSingleSpanAnnotation = (editor: Editor) => {
    // '<p>This is the only p|ar|agraph</p>'
    editor.resetContent('<p>This is the only paragraph <em>here</em></p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 'This is the only p'.length, [ 0, 0 ], 'This is the only par'.length);
    annotate(editor, 'test-annotation', 'test-uid', { anything: 'one-paragraph' });
    assertMarkings(editor, 1, 0);
    TinyAssertions.assertContentPresence(editor, {
      'p:contains("This is the only paragraph here")': 1
    });
    editor.execCommand('undo');
    assertMarkings(editor, 0, 0);
    TinyAssertions.assertContentPresence(editor, {
      'p:contains("This is the only paragraph here")': 1
    });
    editor.execCommand('redo');
    assertMarkings(editor, 1, 0);
    TinyAssertions.assertContentPresence(editor, {
      'p:contains("This is the only paragraph here")': 1
    });
  };

  const setupSingleBlockAnnotation = (editor: Editor) => {
    editor.resetContent(`<pre class="language-markup" contenteditable="false">test</pre>`);
    TinySelections.select(editor, 'pre', []);
    annotate(editor, 'test-annotation', 'test-uid', { anything: 'one-block' });
    assertMarkings(editor, 0, 2); // Extra one for offscreen selection
    editor.execCommand('undo');
    assertMarkings(editor, 0, 0);
    editor.execCommand('redo');
    assertMarkings(editor, 0, 2);
  };

  const contentContains = (editor: Editor, patterns: string[], isContained: boolean) => {
    const content = editor.getContent();
    if (isContained) {
      Arr.each(patterns, (pattern) => {
        assert.include(content, pattern, 'editor.getContent() should contain: ' + pattern);
      });
    } else {
      Arr.each(patterns, (pattern) => {
        assert.notInclude(content, pattern, 'editor.getContent() should not contain: ' + pattern);
      });
    }
  };

  it('testing configuration with persistence', () => {
    return runTinyWithSettings(settingsWithPersistence, (ed) => {
      setupSingleSpanAnnotation(ed);
      contentContains(ed, [ 'mce-annotation', 'test-class', 'one-paragraph' ], true);
      setupSingleBlockAnnotation(ed);
      contentContains(ed, [ 'mce-annotation', 'language-markup', 'test-class', 'one-block' ], true);
    });
  });

  it('testing configuration with *no* persistence', () => {
    return runTinyWithSettings(settingsWithoutPersistence, (ed) => {
      setupSingleSpanAnnotation(ed);
      contentContains(ed, [ 'mce-annotation', 'test-class', 'one-paragraph' ], false);
      setupSingleBlockAnnotation(ed);
      contentContains(ed, [ 'mce-annotation', 'test-class', 'one-block' ], false);
      contentContains(ed, [ 'language-markup' ], true);
    });
  });

  it('testing configuration with default persistence', () => {
    return runTinyWithSettings(settingsWithDefaultPersistence, (ed) => {
      setupSingleSpanAnnotation(ed);
      contentContains(ed, [ 'mce-annotation', 'test-class', 'one-paragraph' ], true);
      setupSingleBlockAnnotation(ed);
      contentContains(ed, [ 'mce-annotation', 'language-markup', 'test-class', 'one-block' ], true);
    });
  });
});
