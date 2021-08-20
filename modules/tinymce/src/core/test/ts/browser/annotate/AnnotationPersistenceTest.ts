import { before, describe, it } from '@ephox/bedrock-client';
import { McEditor, TinyAssertions, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import { AnnotatorSettings } from 'tinymce/core/api/Annotator';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

import { annotate } from '../../module/test/AnnotationAsserts';

describe('browser.tinymce.core.annotate.AnnotationPersistenceTest', () => {
  before(() => {
    Theme();
  });

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

  const settingsWithPersistence = {
    persistent: true,
    decorate: (uid, data) => ({
      attributes: {
        'data-test-anything': data.anything
      },
      classes: [ ]
    })
  };

  const settingsWithDefaultPersistence = {
    decorate: (uid, data) => ({
      attributes: {
        'data-test-anything': data.anything
      },
      classes: [ ]
    })
  };

  const settingsWithoutPersistence = {
    persistent: false,
    decorate: (uid, data) => ({
      attributes: {
        'data-test-anything': data.anything
      },
      classes: [ ]
    })
  };

  const setupSingleAnnotation = (editor: Editor) => {
    // '<p>This is the only p|ar|agraph</p>'
    editor.setContent('<p>This is the only paragraph <em>here</em></p>');
    editor.undoManager.add();
    TinySelections.setSelection(editor, [ 0, 0 ], 'This is the only p'.length, [ 0, 0 ], 'This is the only par'.length);
    annotate(editor, 'test-annotation', 'test-uid', { anything: 'one-paragraph' });
    TinyAssertions.assertContentPresence(editor, {
      '.mce-annotation': 1,
      'p:contains("This is the only paragraph here")': 1
    });
    editor.execCommand('undo');
    TinyAssertions.assertContentPresence(editor, {
      '.mce-annotation': 0,
      'p:contains("This is the only paragraph here")': 1
    });
    editor.execCommand('redo');
    TinyAssertions.assertContentPresence(editor, {
      '.mce-annotation': 1,
      'p:contains("This is the only paragraph here")': 1
    });
  };

  const contentContains = (editor: Editor, pattern: string, isContained: boolean) => {
    const content = editor.getContent();
    if (isContained) {
      assert.include(content, pattern, 'editor.getContent() should contain: ' + pattern);
    } else {
      assert.notInclude(content, pattern, 'editor.getContent() should not contain: ' + pattern);
    }
  };

  it('testing configuration with persistence', () => {
    return runTinyWithSettings(settingsWithPersistence, (ed) => {
      setupSingleAnnotation(ed);
      contentContains(ed, 'mce-annotation', true);
    });
  });

  it('testing configuration with *no* persistence', () => {
    return runTinyWithSettings(settingsWithoutPersistence, (ed) => {
      setupSingleAnnotation(ed);
      contentContains(ed, 'mce-annotation', false);
    });
  });

  it('testing configuration with default persistence', () => {
    return runTinyWithSettings(settingsWithDefaultPersistence, (ed) => {
      setupSingleAnnotation(ed);
      contentContains(ed, 'mce-annotation', true);
    });
  });
});
