import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.EmptyRowTableTest', (success, failure) => {
  Theme();
  Plugin();

  TinyLoader.setupLight((editor, success, failure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TINY-4679', 'Empty tr elements should not be removed', [
        tinyApis.sSetContent(`
          <div>
            <table>
              <colgroup><col></colgroup>
              <tbody>
                <tr><td rowspan="2" >TR 1</td></tr>
                <tr></tr>
                <tr><td>TR 3</td></tr>
                <tr><td >TR 4</td></tr>
              </tbody>
            </table>
          </div>
        `),
        tinyApis.sAssertContentPresence({ tr: 4 })
      ])
    ], success, failure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'table'
  }, success, failure);
});
