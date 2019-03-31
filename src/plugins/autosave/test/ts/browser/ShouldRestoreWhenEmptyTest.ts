import { UnitTest } from '@ephox/bedrock';
import Editor from 'tinymce/core/api/Editor';
import { Editor as McEditor, ApiChains } from '@ephox/mcagar';
import { Pipeline, Logger, Chain, RawAssertions } from '@ephox/agar';
import Theme from 'tinymce/themes/silver/Theme';
import Plugin from 'tinymce/plugins/autosave/Plugin';

UnitTest.asynctest('browser.tinymce.plugins.autosave.ShouldRestoreWhenEmptyTest', (success, failure) => {
  Theme();
  Plugin();

  const cAssertHasDraft = (expected: boolean) => Chain.op((editor: Editor) => {
    RawAssertions.assertEq(`should${!expected ? 'n\'t' : ''} have draft`, expected, editor.plugins.autosave.hasDraft());
  });

  const cStoreDraft = Chain.op((editor: Editor) => {
    editor.plugins.autosave.storeDraft();
  });

  const cRemoveDraft = Chain.op((editor: Editor) => {
    editor.plugins.autosave.removeDraft();
  });

  const cAddUndoLevel = Chain.op((editor: Editor) => {
    editor.undoManager.add();
  });

  const testingPrefix = Math.random().toString(36).substring(7);
  Pipeline.async({}, [
    Logger.t('should restore draft when empty with setting', Chain.asStep({}, [
      McEditor.cFromSettings({ base_url: '/project/tinymce/js/tinymce', plugins: 'autosave', autosave_prefix: testingPrefix }),
      cAssertHasDraft(false),
      ApiChains.cSetContent('<p>X</p>'),
      cAddUndoLevel,
      cStoreDraft,
      cAssertHasDraft(true),
      McEditor.cRemove,
      McEditor.cFromSettings({ autosave_restore_when_empty: true, base_url: '/project/tinymce/js/tinymce', plugins: 'autosave', autosave_prefix: testingPrefix }),
      cAssertHasDraft(true),
      ApiChains.cAssertContent('<p>X</p>'),
      cRemoveDraft,
      McEditor.cRemove
    ])),
    Logger.t('shouldn\'t restore draft when empty without setting', Chain.asStep({}, [
      McEditor.cFromSettings({ base_url: '/project/tinymce/js/tinymce', plugins: 'autosave', autosave_prefix: testingPrefix }),
      cAssertHasDraft(false),
      ApiChains.cSetContent('<p>X</p>'),
      cAddUndoLevel,
      cStoreDraft,
      cAssertHasDraft(true),
      McEditor.cRemove,
      McEditor.cFromSettings({ base_url: '/project/tinymce/js/tinymce', plugins: 'autosave', autosave_prefix: testingPrefix }),
      cAssertHasDraft(true),
      ApiChains.cAssertContent(''),
      cRemoveDraft,
      McEditor.cRemove
    ]))
  ], () => success(), failure);
});
