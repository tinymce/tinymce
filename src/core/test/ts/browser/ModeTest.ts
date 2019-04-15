import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import Editor from 'tinymce/core/api/Editor';
import {  Class, Element } from '@ephox/sugar';

UnitTest.asynctest('browser.tinymce.core.ModeTest', (success, failure) => {
  Theme();

  const sAssertBodyClass = (editor: Editor, cls: string, state: boolean) => {
    return Step.label('sAssertBodyClass: checking editor ' + (state ? 'has' : 'doesn\'t have') + ' class ' + cls, Step.sync(() => {
      Assertions.assertEq('Should be the expected class state', state, Class.has(Element.fromDom(editor.getBody()), cls));
    }));
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const sAssertMode = (expectedMode: string) => {
      return Step.label('sAssertMode: checking editor is in mode ' + expectedMode, Step.sync(() => {
        Assertions.assertEq('Should be the expected mode', expectedMode, editor.mode.get());
      }));
    };

    const sSetMode = (mode: string) => {
      return Step.label('sSetMode: setting the editor mode to ' + mode, Step.sync(() => {
        editor.mode.set(mode);
      }));
    };

    Pipeline.async({}, [
      Logger.t('Should toggle readonly on/off and have a readonly class', GeneralSteps.sequence([
        sAssertMode('readonly'),
        sAssertBodyClass(editor, 'mce-content-readonly', true),
        sSetMode('design'),
        sAssertMode('design'),
        sAssertBodyClass(editor, 'mce-content-readonly', false),
        sSetMode('readonly'),
        sAssertMode('readonly'),
        sAssertBodyClass(editor, 'mce-content-readonly', true)
      ]))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    readonly: true
  }, success, failure);
});
