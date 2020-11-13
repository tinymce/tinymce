import { ApproxStructure, Assertions, Chain, GeneralSteps, Guard, Log, Pipeline, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader } from '@ephox/mcagar';
import { SugarBody, SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.themes.silver.editor.DisableTest', (success, failure) => {
  Theme();

  TinyLoader.setup(
    (editor: Editor, onSuccess, onFailure) => {

      const sAssertUiDisabled = (label: string, disabled: boolean) => Step.label(label, GeneralSteps.sequence([
        Chain.asStep(SugarBody.body(), [
          UiFinder.cFindIn('.tox-toolbar-overlord'),
          Chain.control(
            Assertions.cAssertStructure('Toolbar should be in correct disabled state', ApproxStructure.build((s, str, arr) =>
              s.element('div', {
                classes: [
                  arr.has('tox-toolbar-overlord'),
                  disabled ? arr.has('tox-tbtn--disabled') : arr.not('tox-tbtn--disabled')
                ],
                attrs: { 'aria-disabled': str.is(disabled ? 'true' : 'false') }
              })
            )),
            Guard.tryUntil('Waiting for toolbar state')
          )
        ]),
        Step.sync(() => {
          Assertions.assertStructure(
            'Editor container should have disabled class if disabled',
            ApproxStructure.build((s, str, arr) => s.element('div', {
              classes: [ arr.has('tox-tinymce') ].concat(disabled ? [ arr.has('tox-tinymce--disabled') ] : [])
            })),
            SugarElement.fromDom(editor.editorContainer)
          );
        }),
        Step.sync(() => {
          Assertions.assertEq('Editor isDisabled should return current disabled state', disabled, editor.ui.isDisabled());
        })
      ]));

      Pipeline.async({ }, [
        Log.stepsAsStep('TINY-6397', 'Test disable/enable APIs', [
          Step.label('Should be able to enable and disable the UI', GeneralSteps.sequence([
            Step.sync(() => editor.ui.disable()),
            sAssertUiDisabled('Editor UI should be disabled', true),
            Step.sync(() => editor.ui.enable()),
            sAssertUiDisabled('Editor UI should be enabled', false)
          ])),

          Step.label('Should not be able to enable the UI when in readonly mode', GeneralSteps.sequence([
            Step.sync(() => editor.mode.set('readonly')),
            sAssertUiDisabled('Sanity check, should be disabled since editor is in readonly mode', true),
            Step.sync(() => editor.ui.enable()),
            sAssertUiDisabled('Should remain disabled since editor is in readonly mode', true),
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
