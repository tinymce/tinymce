import { Assertions, Logger, Pipeline, Step, TestLogs } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';

import { Editor } from 'ephox/mcagar/alien/EditorTypes';
import * as TinyLoader from 'ephox/mcagar/api/pipeline/TinyLoader';
import { TinyUi } from 'ephox/mcagar/api/pipeline/TinyUi';

UnitTest.asynctest('TinyLoaderTest', (success, failure) => {
  let clickedOn = false;

  const sAssertState = (expected: boolean, label: string) => Step.sync(() => {
    Assertions.assertEq(label, expected, clickedOn);
  });

  const silverSetup = (ed: Editor) => {
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
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});

UnitTest.asynctest('TinyLoader.setupInBodyAndShadowRoot passes logs through', (success, failure) => {
  let calls = 0;
  TinyLoader.setupInBodyAndShadowRoot((_editor, onSuccess, _onFailure) => {
    calls++;
    onSuccess('call' + calls, TestLogs.single('log' + calls));
  }, {
    base_url: '/project/tinymce/js/tinymce'
  }, (v, logs) => {
    try {
      Assert.eq('Value should come from second call', 'call2', v);
      Assert.eq('Logs should be concatenated', TestLogs.addLogEntry(TestLogs.single('log1'), 'log2'), logs);
      success();
    } catch (e: any) {
      failure(e);
    }
  }, failure);
});
