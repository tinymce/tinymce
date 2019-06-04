import { Log, Pipeline, UiFinder, Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
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
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>One <a href="http://tiny.cloud">link</a> Two</p>'),
          tinyApis.sSetCursor([ 0, 1, 0 ], 'L'.length),
          UiFinder.sWaitForVisible('Waiting for toolbar', Body.body(), '.tox-pop'),
          // NOTE: This internally fires a nodeChange
          tinyApis.sSetCursor([ 0, 0 ], 'O'.length),
          Waiter.sTryUntil(
            'Waint for dialog to disappear after nodeChange',
            UiFinder.sNotExists(Body.body(), '.tox-pop'),
            100,
            1000
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
    () => {
      success();
    },
    failure
  );
});
