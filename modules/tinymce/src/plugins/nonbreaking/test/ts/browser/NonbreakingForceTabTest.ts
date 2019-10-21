import { Keys, Log, Pipeline, Step } from '@ephox/agar';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import VK from 'tinymce/core/api/util/VK';
import NonbreakingPlugin from 'tinymce/plugins/nonbreaking/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.nonbreaking.NonbreakingForceTabTest', (success, failure) => {

    NonbreakingPlugin();
    SilverTheme();

    TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
      const tinyApis = TinyApis(editor);
      const tinyActions = TinyActions(editor);

      Pipeline.async({}, [
        Log.stepsAsStep('TBA', 'NonBreaking: Undo level on insert tab', [
          tinyActions.sContentKeystroke(Keys.tab(), {}),
          tinyApis.sAssertContent('<p><span class="mce-nbsp-wrap" contenteditable="false">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>'),
          Step.sync(function () {
            editor.undoManager.undo();
          }),
          tinyApis.sAssertContent('')
        ]),
        Log.step('TBA', 'NonBreaking: Prevent default and other handlers on insert tab',
          Step.sync(function () {
            const args = editor.fire('keydown', { keyCode: VK.TAB });
            Assert.eq('Default should be prevented', true, args.isDefaultPrevented());
            Assert.eq('Should not propagate', true, args.isImmediatePropagationStopped());
          })
        )
      ], onSuccess, onFailure);
    }, {
      plugins: 'nonbreaking',
      toolbar: 'nonbreaking',
      nonbreaking_force_tab: 5,
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
    }, success, failure);
  }
);
