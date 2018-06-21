import { Keys, Pipeline, RawAssertions, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';

import TabfocusPlugin from 'tinymce/plugins/tabfocus/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.plugins.tabfocus.TabfocusSanityTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  TabfocusPlugin();

  const sAddInputs = function (editor) {
    return Step.sync(function () {
      const container = editor.getContainer();
      const input1 = document.createElement('input');
      input1.id = 'tempinput1';

      container.parentNode.insertBefore(input1, container);
    });
  };

  const sRemoveInputs = Step.sync(function () {
    const input1 = document.getElementById('tempinput1');

    input1.parentNode.removeChild(input1);
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyActions = TinyActions(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      sAddInputs(editor),
      tinyApis.sFocus,
      Step.sync(function () {
        RawAssertions.assertEq('should be same', 'IFRAME', document.activeElement.nodeName);
      }),
      tinyActions.sContentKeystroke(Keys.tab(), {}),
      Waiter.sTryUntil('vait for focus',
        Step.sync(function () {
          const input = document.getElementById('tempinput1');
          RawAssertions.assertEq('should be same', input.outerHTML, document.activeElement.outerHTML);
        }), 100, 4000),
      sRemoveInputs
    ], onSuccess, onFailure);
  }, {
    plugins: 'tabfocus',
    tabfocus_elements: 'tempinput1',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
