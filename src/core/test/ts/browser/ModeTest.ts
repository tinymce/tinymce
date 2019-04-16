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
    const sOverrideDefaultMode = Step.label('validate default modes cannot be overwritten', Step.async((next, die) => {
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

    const sRegisterTestModes = Step.sync(() => {
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

      editor.mode.register('failingActivateReadonly', {
        activate: Fun.die('whoops'),
        deactivate: Fun.noop,
        editorReadOnly: true
      });
      editor.mode.register('failingDeactivateDesign', {
        activate: Fun.noop,
        deactivate: Fun.die('haha'),
        editorReadOnly: false
      });
    });

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
        sOverrideDefaultMode,
        sRegisterTestModes,
        // default API
        sAssertMode('readonly'),
        sAssertBodyClass(editor, 'mce-content-readonly', true),
        sSetMode('design'),
        sAssertMode('design'),
        sAssertBodyClass(editor, 'mce-content-readonly', false),
        sSetMode('readonly'),
        sAssertMode('readonly'),
        sAssertBodyClass(editor, 'mce-content-readonly', true),

        // custom modes (aliases of design and readonly)
        sSetMode('customDesign'),
        sAssertMode('customDesign'),
        sAssertBodyClass(editor, 'mce-content-readonly', false),
        sSetMode('customReadonly'),
        sAssertMode('customReadonly'),
        sAssertBodyClass(editor, 'mce-content-readonly', true),

        // failing to activate a readonly-like mode leaves the editor in design
        sSetMode('design'),
        sSetMode('failingActivateReadonly'),
        sAssertMode('design'),
        sAssertBodyClass(editor, 'mce-content-readonly', false),

        // failing to deactivate a design-like mode still switches to readonly
        sSetMode('failingDeactivateDesign'),
        sSetMode('readonly'),
        sAssertMode('readonly'),
        sAssertBodyClass(editor, 'mce-content-readonly', true),
      ]))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    readonly: true
  }, success, failure);
});
