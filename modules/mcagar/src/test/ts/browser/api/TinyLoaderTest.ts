import { Assertions, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import TinyLoader from 'ephox/mcagar/api/TinyLoader';
import TinyUi from 'ephox/mcagar/api/TinyUi';

UnitTest.asynctest('TinyLoaderTest', (success, failure) => {
  let clickedOn = false;

  const sAssertState = (expected: boolean, label: string) => {
    return Step.sync(() => {
      Assertions.assertEq(label, expected, clickedOn);
    });
  };

  const silverSetup = (ed) => {
    ed.ui.registry.addButton('test-button', {
      text: 'test-button',
      onAction: () => clickedOn = true
    });
  };

  TinyLoader.setup((editor, loadSuccess, loadFailure) => {
    const ui = TinyUi(editor);
    clickedOn = false;

    Pipeline.async({}, [
      sAssertState(false, 'Expected clickedOn to be false, because'),
      Logger.t(
        'Trying to click on custom button.\nNote, if the button could not be found, it is likely that the setup function has not triggered\n',
        ui.sClickOnToolbar('Click on the test-button to trigger its action', 'button:contains("test-button")')
      ),
      sAssertState(true, 'Expected clickedOn to be true, because the button action sets it to be.')
    ], loadSuccess, loadFailure);

  }, {
      setup: silverSetup,
      toolbar: 'test-button',
      base_url: '/project/tinymce/js/tinymce',
    }, success, failure);
});
