import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import Editor from 'tinymce/core/api/Editor';
import {  Class, Element } from '@ephox/sugar';
import { Fun } from '@ephox/katamari';

UnitTest.asynctest('browser.tinymce.core.ModeTest', (success, failure) => {
  Theme();

  const sAssertBodyClass = (editor: Editor, cls: string, state: boolean) => {
    return Step.label('sAssertBodyClass: checking editor ' + (state ? 'has' : 'doesn\'t have') + ' class ' + cls, Step.sync(() => {
      Assertions.assertEq('Should be the expected class state', state, Class.has(Element.fromDom(editor.getBody()), cls));
    }));
  };

  TinyLoader.setup(function (editor: Editor, onSuccess, onFailure) {
    const sRegisterDefaultMode = Step.label('validate default modes cannot be overwritten', Step.async((next, die) => {
      try {
        editor.mode.register('design', {
          activate: Fun.noop,
          deactivate: Fun.noop,
          editorReadOnly: false
        })
        die('registering a new design mode should fail');
      } catch (e) {
        //pass
      }
      try {
        editor.mode.register('readonly', {
          activate: Fun.noop,
          deactivate: Fun.noop,
          editorReadOnly: false
        })
        die('registering a new readonly mode should fail');
      } catch (e) {
        //pass
      }
      next();
    }));

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
        sRegisterDefaultMode,
        Step.sync(() => {
          // TODO: test order of activate and deactivate (or at least that they're actually used)
          editor.mode.register('customDesign', {
            activate: Fun.noop,
            deactivate: Fun.noop,
            editorReadOnly: false
          });
          editor.mode.register('customReadonly', {
            activate: Fun.noop,
            deactivate: Fun.noop,
            editorReadOnly: true
          });
        }),
        sAssertMode('readonly'),
        sAssertBodyClass(editor, 'mce-content-readonly', true),
        sSetMode('design'),
        sAssertMode('design'),
        sAssertBodyClass(editor, 'mce-content-readonly', false),
        sSetMode('readonly'),
        sAssertMode('readonly'),
        sAssertBodyClass(editor, 'mce-content-readonly', true),
        sSetMode('customDesign'),
        sAssertMode('customDesign'),
        sAssertBodyClass(editor, 'mce-content-readonly', false),
        sSetMode('customReadonly'),
        sAssertMode('customReadonly'),
        sAssertBodyClass(editor, 'mce-content-readonly', true),
      ]))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    readonly: true
  }, success, failure);
});
