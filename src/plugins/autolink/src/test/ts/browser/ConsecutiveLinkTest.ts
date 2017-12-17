import { GeneralSteps } from '@ephox/agar';
import { Keys } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { TinyActions } from '@ephox/mcagar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import Env from 'tinymce/core/Env';
import AutolinkPlugin from 'tinymce/plugins/autolink/Plugin';
import KeyUtils from '../module/test/KeyUtils';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.autolink.ConsecutiveLinkTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  ModernTheme();
  AutolinkPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var tinyApis = TinyApis(editor);
    var steps = Env.ie ? [] : [
      tinyApis.sFocus,
      Logger.t('Chrome adds a nbsp between link and text', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><a href="http://www.domain.com">www.domain.com</a>&nbsp;www.domain.com</p>'),
        tinyApis.sSetCursor([0, 1], 15),
        Step.sync(function () {
          KeyUtils.type(editor, ' ');
        }),
        tinyApis.sAssertContent('<p><a href="http://www.domain.com">www.domain.com</a>&nbsp;<a href="http://www.domain.com">www.domain.com</a></p>')
      ])),
      Logger.t('FireFox does not seem to add a nbsp between link and text', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><a href="http://www.domain.com">www.domain.com</a> www.domain.com</p>'),
        tinyApis.sSetCursor([0, 1], 15),
        Step.sync(function () {
          KeyUtils.type(editor, ' ');
        }),
        tinyApis.sAssertContent('<p><a href="http://www.domain.com">www.domain.com</a> <a href="http://www.domain.com">www.domain.com</a></p>')
      ]))
    ];

    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    plugins: 'autolink',
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

