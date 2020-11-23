import { Assertions, Chain, Log, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Insert, Remove, SugarBody, SugarElement, Width } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('Editor fixed_toolbar_container resize test', (success, failure) => {
  Theme();

  const expectedWidth = 300;
  const toolbarContainer = SugarElement.fromHtml(`<div id="toolbar" style="width: ${expectedWidth}px;"></div>`);

  Insert.append(SugarBody.body(), toolbarContainer);

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({ }, [
      Log.stepsAsStep('TINY-6683', 'Should not resize the sink to the body width', [
        tinyApis.sSetContent('fixed_toolbar_container test'),
        tinyApis.sFocus(),

        Chain.asStep(SugarBody.body(), [
          UiFinder.cWaitFor('Wait for the sink to be rendered', '.tox-silver-sink'),
          Chain.mapper((sink) => Width.get(sink)),
          Assertions.cAssertEq(`Sink should be ${expectedWidth}px wide`, expectedWidth)
        ])
      ])
    ], onSuccess, onFailure);
  },
  {
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    fixed_toolbar_container: '#toolbar',
    inline: true,
  }, () => {
    Remove.remove(toolbarContainer);
    success();
  }, failure);
});