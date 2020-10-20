import { ApproxStructure, Assertions, Chain, GeneralSteps, Guard, Log, Pipeline, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.themes.silver.editor.DisableTest', (success, failure) => {
  Theme();

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const sAssertToolbarState = (label: string, disabled: boolean) => Chain.asStep(SugarBody.body(), [
        UiFinder.cFindIn('.tox-toolbar-overlord'),
        Chain.control(
          Assertions.cAssertStructure(label, ApproxStructure.build((s, str, arr) =>
            s.element('div', {
              classes: [
                arr.has('tox-toolbar-overlord'),
                disabled ? arr.has('tox-tbtn--disabled') : arr.not('tox-tbtn--disabled')
              ],
              attrs: { 'aria-disabled': str.is(disabled + '') }
            })
          )),
          Guard.tryUntil('Waiting for toolbar state')
        )
      ]);

      Pipeline.async({ }, [
        Log.stepsAsStep('TINY-6397', 'Test disable/enable APIs', [
          Step.label('Should be able to enable and disable the UI', GeneralSteps.sequence([
            Step.sync(() => editor.ui.disable()),
            sAssertToolbarState('Toolbar should be disabled', true),
            Step.sync(() => editor.ui.enable()),
            sAssertToolbarState('Toolbar should be enabled', false)
          ])),

          Step.label('Should not be able to enable the UI when in readonly mode', GeneralSteps.sequence([
            Step.sync(() => editor.mode.set('readonly')),
            sAssertToolbarState('Sanity check, toolbar should be disabled since editor is in readonly mode', true),
            Step.sync(() => editor.ui.enable()),
            sAssertToolbarState('Toolbar should remain disabled since editor is in readonly mode', true),
            Step.sync(() => editor.mode.set('design'))
          ]))
        ])
      ], onSuccess, onFailure);
    },
    {
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce'
    },
    success,
    failure
  );
});
