import { Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Env from 'tinymce/core/api/Env';
import AutolinkPlugin from 'tinymce/plugins/autolink/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import * as KeyUtils from '../module/test/KeyUtils';

UnitTest.asynctest('browser.tinymce.plugins.autolink.ConsecutiveLinkTest', (success, failure) => {

  Theme();
  AutolinkPlugin();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const steps = Env.browser.isIE() ? [] : [
      tinyApis.sFocus(),
      Log.stepsAsStep('TBA', 'AutoLink: Chrome adds a nbsp between link and text', [
        tinyApis.sSetContent('<p><a href="http://www.domain.com">www.domain.com</a>&nbsp;www.domain.com</p>'),
        tinyApis.sSetCursor([ 0, 1 ], 15),
        Step.sync(() => {
          KeyUtils.type(editor, ' ');
        }),
        tinyApis.sAssertContent('<p><a href="http://www.domain.com">www.domain.com</a>&nbsp;<a href="http://www.domain.com">www.domain.com</a>&nbsp;</p>')
      ]),
      Log.stepsAsStep('TBA', 'AutoLink: FireFox does not seem to add a nbsp between link and text', [
        tinyApis.sSetContent('<p><a href="http://www.domain.com">www.domain.com</a> www.domain.com</p>'),
        tinyApis.sSetCursor([ 0, 1 ], 15),
        Step.sync(() => {
          KeyUtils.type(editor, ' ');
        }),
        tinyApis.sAssertContent('<p><a href="http://www.domain.com">www.domain.com</a> <a href="http://www.domain.com">www.domain.com</a>&nbsp;</p>')
      ])
    ];

    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    plugins: 'autolink',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
