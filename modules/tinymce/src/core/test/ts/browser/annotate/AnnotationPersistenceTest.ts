import { Assertions, Chain, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { AnnotatorSettings } from 'tinymce/core/api/Annotator';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

import { sAnnotate } from '../../module/test/AnnotationAsserts';

UnitTest.asynctest('browser.tinymce.core.annotate.AnnotationPersistenceTest', (success, failure) => {
  Theme();

  const sUndoLevel = (editor: Editor) => Step.sync(() => {
    editor.undoManager.add();
  });

  const sRunTinyWithSettings = (annotation: AnnotatorSettings, getSteps: (tinyApis: any, editor: Editor) => any[]) => Step.async((next, die) => {
    const settings = {
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed: Editor) => {
        ed.on('init', () => {
          ed.annotator.register('test-annotation', annotation);
        });
      }
    };
    TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
      const tinyApis = TinyApis(editor);
      Pipeline.async({}, getSteps(tinyApis, editor), onSuccess, onFailure);
    }, settings, next, die);
  });

  const settingsWithPersistence = {
    persistent: true,
    decorate: (uid, data) => {
      return {
        attributes: {
          'data-test-anything': data.anything
        },
        classes: [ ]
      };
    }
  };

  const settingsWithDefaultPersistence = {
    decorate: (uid, data) => {
      return {
        attributes: {
          'data-test-anything': data.anything
        },
        classes: [ ]
      };
    }
  };

  const settingsWithoutPersistence = {
    persistent: false,
    decorate: (uid, data) => {
      return {
        attributes: {
          'data-test-anything': data.anything
        },
        classes: [ ]
      };
    }
  };

  const sSetupSingleAnnotation = (tinyApis, editor) => GeneralSteps.sequence([
    // '<p>This is the only p|ar|agraph</p>'
    tinyApis.sSetContent('<p>This is the only paragraph <em>here</em></p>'),
    sUndoLevel(editor),
    tinyApis.sSetSelection([ 0, 0 ], 'This is the only p'.length, [ 0, 0 ], 'This is the only par'.length),
    sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'one-paragraph' }),
    tinyApis.sAssertContentPresence({
      '.mce-annotation': 1,
      'p:contains("This is the only paragraph here")': 1
    }),
    Step.sync(() => {
      editor.execCommand('undo');
    }),
    tinyApis.sAssertContentPresence({
      '.mce-annotation': 0,
      'p:contains("This is the only paragraph here")': 1
    }),
    Step.sync(() => {
      editor.execCommand('redo');
    }),
    tinyApis.sAssertContentPresence({
      '.mce-annotation': 1,
      'p:contains("This is the only paragraph here")': 1
    })
  ]);

  const sContentContains = (tinyApis: any, ed: Editor, pattern: string, isContained: boolean) => {
    return Chain.asStep({ }, [
      Chain.mapper(() => ed.getContent()),
      Chain.op((content) => {
        Assertions.assertEq(
          'editor.getContent() should contain: ' + pattern + ' = ' + isContained,
          true,
          content.indexOf(pattern) > -1 === isContained
        );
      })
    ]);
  };

  Pipeline.async({ }, [
    Logger.t(
      'Testing configuration with persistence',
      sRunTinyWithSettings(settingsWithPersistence, (tinyApis: any, ed: Editor) => [
        sSetupSingleAnnotation(tinyApis, ed),
        sContentContains(tinyApis, ed, 'mce-annotation', true)
      ])
    ),

    Logger.t(
      'Testing configuration with *no* persistence',
      sRunTinyWithSettings(settingsWithoutPersistence, (tinyApis: any, ed: Editor) => [
        sSetupSingleAnnotation(tinyApis, ed),
        sContentContains(tinyApis, ed, 'mce-annotation', false)
      ])
    ),

    Logger.t(
      'Testing configuration with default persistence',
      sRunTinyWithSettings(settingsWithDefaultPersistence, (tinyApis: any, ed: Editor) => [
        sSetupSingleAnnotation(tinyApis, ed),
        sContentContains(tinyApis, ed, 'mce-annotation', true)
      ])
    ),
  ], () => success(), failure);
});
