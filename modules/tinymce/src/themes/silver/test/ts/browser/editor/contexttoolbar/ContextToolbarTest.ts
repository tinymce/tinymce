import { Log, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('Editor ContextToolbar test', (success, failure) => {
  SilverTheme();

  const store = TestHelpers.TestStore();

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const tinyApis = TinyApis(editor);

      Pipeline.async({ }, [
        Log.stepsAsStep('TBA', 'Moving selection away from the context toolbar predicate should make it disappear', [
          tinyApis.sSetContent('<p>One <a href="http://tiny.cloud">link</a> Two</p>'),
          // Need to wait a little before checking the context toolbar isn't shown,
          // since we don't have anything we can wait for a change in
          Step.wait(100),
          UiFinder.sNotExists(SugarBody.body(), '.tox-pop'),
          tinyApis.sSetCursor([ 0, 1, 0 ], 'L'.length),
          tinyApis.sFocus(),
          UiFinder.sWaitForVisible('Waiting for toolbar', SugarBody.body(), '.tox-pop'),
          // NOTE: This internally fires a nodeChange
          tinyApis.sSetCursor([ 0, 0 ], 'O'.length),
          Waiter.sTryUntil(
            'Wait for dialog to disappear after nodeChange',
            UiFinder.sNotExists(SugarBody.body(), '.tox-pop')
          )
        ])
      ], onSuccess, onFailure);
    },
    {
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed: Editor) => {
        ed.ui.registry.addButton('alpha', {
          text: 'Alpha',
          onAction: store.adder('alpha-exec')
        });
        ed.ui.registry.addContextToolbar('test-toolbar', {
          predicate: (node) => node.nodeName && node.nodeName.toLowerCase() === 'a',
          items: 'alpha'
        });
      }
    },
    success,
    failure
  );
});
