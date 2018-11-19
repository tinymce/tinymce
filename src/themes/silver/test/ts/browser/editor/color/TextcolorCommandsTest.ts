import { Logger, Pipeline, RawAssertions, Step, Log, GeneralSteps } from '@ephox/agar';
import { Cell } from '@ephox/katamari';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import { PlatformDetection } from '@ephox/sand';

UnitTest.asynctest('TextcolorCommandsTest', (success, failure) => {
  const browser = PlatformDetection.detect().browser;

  // TODO FIXME TINY-2722
  // maybe remove this and depend on the default color pallete when the color_map property is changed from global
  const colorSettings = [
    '1abc9c', 'Black',
    '2ecc71', 'Black',
    '3498db', 'Black',
    '9b59b6', 'Black',
  ];

  const state = Cell(null);

  const sAssertState = function (expected) {
    return Logger.t(`Assert state ${expected}`, Step.sync(function () {
      RawAssertions.assertEq('should be same', expected, state.get());
    }));
  };

  const sResetState = Logger.t('Reset state', Step.sync(function () {
    state.set(null);
  }));

  TinyLoader.setup(function (editor, onSuccess, onFailure) {

    editor.on('execCommand', function (e) {
      state.set(e.command);
    });

    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, browser.isIE() ? [] : [
      Log.step('TBA', 'TextColor: apply and remove forecolor and make sure of the right command has been executed', GeneralSteps.sequence([
        Step.label('Focus editor', tinyApis.sFocus),
        Step.label('Set editor content to "hello test"', tinyApis.sSetContent('hello test')),
        Step.label('Select "hello"', tinyApis.sSetSelection([0, 0], 0, [0, 0], 5)),
        Step.label('Click forecolor chevron button', tinyUi.sClickOnToolbar('click forecolor', 'button[aria-label="Color"] + .tox-split-button__chevron')),
        Step.label('Wait for swatch to display', tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches')),
        Step.label('Click on color #1abc9c', tinyUi.sClickOnUi('click color', 'div[data-mce-color="#1abc9c"]')),
        Step.label('Check last execCommand was mceApplyTextcolor', sAssertState('mceApplyTextcolor')),
        Step.label('Reselect "hello"', tinyApis.sSetSelection([0, 0, 0], 0, [0, 0, 0], 5)),
        Step.label('Click forecolor chevron button (again)', tinyUi.sClickOnToolbar('click forecolor', 'button[aria-label="Color"] + .tox-split-button__chevron')),
        Step.label('Wait for swatch to display (again)', tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches')),
        Step.label('Click on remove color option', tinyUi.sClickOnUi('click remove color', '.tox-swatch--remove')),
        Step.label('Check last execCommand was mceRemoveTextcolor', sAssertState('mceRemoveTextcolor')),
        sResetState
      ])),
      Log.stepsAsStep('TBA', 'TextColor: apply and remove backcolor and make sure of the right command has been executed', [
        tinyApis.sFocus,
        tinyApis.sSetContent('hello test'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 5),
        tinyUi.sClickOnToolbar('click backcolor', 'button[aria-label="Background color"] + .tox-split-button__chevron'),
        tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
        tinyUi.sClickOnUi('click green color', 'div[data-mce-color="#1abc9c"]'),
        sAssertState('mceApplyTextcolor'),
        tinyApis.sSetSelection([0, 0, 0], 0, [0, 0, 0], 5),
        tinyUi.sClickOnToolbar('click backcolor', 'button[aria-label="Background color"] + .tox-split-button__chevron'),
        tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
        tinyUi.sClickOnUi('click remove color', '.tox-swatch--remove'),
        sAssertState('mceRemoveTextcolor'),
        sResetState
      ])
    ], onSuccess, onFailure);
  }, {
      toolbar: 'forecolor backcolor',
      skin_url: '/project/js/tinymce/skins/oxide',
      color_map: colorSettings
    }, success, failure);
}
);
