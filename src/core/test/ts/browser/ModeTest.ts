import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import { EditorMode, getMode, setMode } from 'tinymce/core/Mode';
import { Editor } from 'tinymce/core/api/Editor';
import {  Class, Element } from '@ephox/sugar';

UnitTest.asynctest('browser.tinymce.core.ModeTest', (success, failure) => {
  Theme();

  const sAssertMode = (editor: Editor, expectedMode: EditorMode) => {
    return Step.label('sAssertMode: checking editor is in mode ' + expectedMode, Step.sync(() => {
      Assertions.assertEq('Should be the expected mode', expectedMode, getMode(editor));
    }));
  };

  const sAssertBodyClass = (editor: Editor, cls: string, state: boolean) => {
    return Step.label('sAssertBodyClass: checking editor ' + (state ? 'has' : 'doesn\'t have') + ' class ' + cls, Step.sync(() => {
      Assertions.assertEq('Should be the expected class state', state, Class.has(Element.fromDom(editor.getBody()), cls));
    }));
  };

  const sSetMode = (editor: Editor, mode: EditorMode) => {
    return Step.label('sSetMode: setting the editor mode to ' + mode, Step.sync(() => {
      setMode(editor, mode);
    }));
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, [
      Logger.t('Should toggle readonly on/off and have a readonly class', GeneralSteps.sequence([
        sAssertMode(editor, EditorMode.ReadOnly),
        sAssertBodyClass(editor, 'mce-content-readonly', true),
        sSetMode(editor, EditorMode.Design),
        sAssertMode(editor, EditorMode.Design),
        sAssertBodyClass(editor, 'mce-content-readonly', false),
        sSetMode(editor, EditorMode.ReadOnly),
        sAssertMode(editor, EditorMode.ReadOnly),
        sAssertBodyClass(editor, 'mce-content-readonly', true)
      ]))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/js/tinymce',
    readonly: true
  }, success, failure);
});
