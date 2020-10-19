import { ApproxStructure, Assertions, Chain, ChainSequence, Guard, Log, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Editor as McEditor } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.themes.silver.editor.DisableTest', (success, failure) => {
  Theme();

  const cAssertToolbarState = (label: string, disabled: boolean) => Chain.fromIsolatedChainsWith(SugarBody.body(), [
    UiFinder.cFindIn('.tox-toolbar'),
    Chain.control(
      Assertions.cAssertStructure(label, ApproxStructure.build((s, str, arr) =>
        s.element('div', {
          classes: [
            arr.has('tox-toolbar'),
            disabled ? arr.has('tox-tbtn--disabled') : arr.not('tox-tbtn--disabled')
          ],
          attrs: { 'aria-disabled': str.is(disabled + '') }
        })
      )),
      Guard.tryUntil('Waiting for toolbar state')
    )
  ]);

  Pipeline.async({}, [
    Log.chainsAsStep('TINY-6397', 'Test disable/enable APIs', [
      McEditor.cFromSettings({
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce'
      }),

      Chain.label('Should be able to enable and disable the UI', ChainSequence.sequence([
        Chain.op((editor) => editor.ui.disable()),
        cAssertToolbarState('UI should be disabled', true),
        Chain.op((editor) => editor.ui.enable()),
        cAssertToolbarState('UI should be enabled', false)
      ])),

      Chain.label('Should not be able to enable the UI when in readonly mode', ChainSequence.sequence([
        Chain.op((editor) => editor.mode.set('readonly')),
        cAssertToolbarState('Sanity check, toolbar should be disabled since editor is in readonly mode', true),
        Chain.op((editor) => editor.ui.enable()),
        cAssertToolbarState('UI should remain disabled since editor is in readonly mode', true),
        Chain.op((editor) => editor.mode.set('design'))
      ])),

      McEditor.cRemove
    ])
  ], success, failure);
});
