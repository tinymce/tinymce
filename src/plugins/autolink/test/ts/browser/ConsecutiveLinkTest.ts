import { GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Env from 'tinymce/core/api/Env';
import AutolinkPlugin from 'tinymce/plugins/autolink/Plugin';
import KeyUtils from '../module/test/KeyUtils';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.autolink.ConsecutiveLinkTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  AutolinkPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const steps = Env.ie ? [] : [
      tinyApis.sFocus,
      Logger.t('Chrome adds a nbsp between link and text', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><a href="http://www.domain.com">www.domain.com</a>&nbsp;www.domain.com</p>'),
        tinyApis.sSetCursor([0, 1], 15),
        Step.sync(function () {
          KeyUtils.type(editor, ' ');
        }),
        tinyApis.sAssertContent('<p><a href="http://www.domain.com">www.domain.com</a>&nbsp;<a href="http://www.domain.com">www.domain.com</a>&nbsp;</p>')
      ])),
      Logger.t('FireFox does not seem to add a nbsp between link and text', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><a href="http://www.domain.com">www.domain.com</a> www.domain.com</p>'),
        tinyApis.sSetCursor([0, 1], 15),
        Step.sync(function () {
          KeyUtils.type(editor, ' ');
        }),
        tinyApis.sAssertContent('<p><a href="http://www.domain.com">www.domain.com</a> <a href="http://www.domain.com">www.domain.com</a>&nbsp;</p>')
      ]))
    ];

    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    plugins: 'autolink',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
