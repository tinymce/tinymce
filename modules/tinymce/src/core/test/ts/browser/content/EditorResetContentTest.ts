import { GeneralSteps, Logger, Pipeline, Step, Assertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.core.content.EditorResetContentTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const sResetContent = (content?: string) => {
      return Step.sync(() => {
        editor.resetContent(content);
      });
    };

    const sAssertEditorState = (content: string) => {
      return Step.sync(() => {
        const html = editor.getContent();
        Assertions.assertHtml('Editor content should be expected html', content, html);
        Assertions.assertEq('Editor should not be dirty', false, editor.isDirty());
        Assertions.assertEq('UndoManager should not have any undo levels', false, editor.undoManager.hasUndo());
        Assertions.assertEq('UndoManager should not have any redo levels', false, editor.undoManager.hasRedo());
        Assertions.assertEq('Editor start content should match the original content', '<p><br data-mce-bogus="1"></p>', editor.startContent);
      });
    };

    Pipeline.async({}, [
      Logger.t('Reset editor content/state with initial content', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>some</p><p>content</p>'),
        sResetContent(),
        sAssertEditorState('')
      ])),
      Logger.t('Reset editor content/state with custom content', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>some</p><p>content</p>'),
        sResetContent('<p>html</p>'),
        sAssertEditorState('<p>html</p>')
      ])),
      Logger.t('Reset editor content/state with multiple undo levels', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>some</p><p>content</p>'),
        Step.sync(() => editor.undoManager.add()),
        tinyApis.sSetContent('<p>some</p><p>other</p><p>content</p>'),
        Step.sync(() => editor.undoManager.add()),
        tinyApis.sNodeChanged(),
        Step.sync(() => {
          Assertions.assertEq('Editor should be dirty', true, editor.isDirty());
          Assertions.assertEq('UndoManager should have some undo levels', true, editor.undoManager.hasUndo());
        }),
        sResetContent('<p>html</p>'),
        sAssertEditorState('<p>html</p>')
      ]))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
