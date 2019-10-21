import { Keys, Log, Logger, Pipeline, Step, Waiter } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';

import TabfocusPlugin from 'tinymce/plugins/tabfocus/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.plugins.tabfocus.TabfocusSanityTest', (success, failure) => {

  Theme();
  TabfocusPlugin();

  const sAddInputs = function (editor) {
    return Logger.t('Add inputs', Step.sync(function () {
      const container = editor.getContainer();
      const input1 = document.createElement('input');
      input1.id = 'tempinput1';

      container.parentNode.insertBefore(input1, container);
    }));
  };

  const sRemoveInputs = Logger.t('Remove inputs', Step.sync(function () {
    const input1 = document.getElementById('tempinput1');

    input1.parentNode.removeChild(input1);
  }));

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyActions = TinyActions(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({},
      Log.steps('TBA', 'TabFocus: Add an input field outside the editor, focus on the editor, press the tab key and assert focus shifts to the input field', [
        sAddInputs(editor),
        tinyApis.sFocus(),
        Step.sync(function () {
          Assert.eq('should be same', 'IFRAME', document.activeElement.nodeName);
        }),
        tinyActions.sContentKeystroke(Keys.tab(), {}),
        Waiter.sTryUntil('wait for focus',
          Step.sync(function () {
            const input = document.getElementById('tempinput1');
            Assert.eq('should be same', input.outerHTML, document.activeElement.outerHTML);
          })),
        sRemoveInputs
      ])
    , onSuccess, onFailure);
  }, {
    plugins: 'tabfocus',
    tabfocus_elements: 'tempinput1',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
