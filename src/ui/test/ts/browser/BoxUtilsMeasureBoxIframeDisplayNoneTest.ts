import { Assertions, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';

import ModernTheme from 'tinymce/themes/modern/Theme';
import BoxUtils from 'tinymce/ui/BoxUtils';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.ui.BoxUtilsMeasureBoxIframeDisplayNoneTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();

  Pipeline.async({}, [
    Logger.t(
      'firefox specific test, boxutils should not throw error when used on hidden iframe',
      Step.async(function (next, die) {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        iframe.addEventListener('load', function () {
          try {
            const measured = BoxUtils.measureBox(iframe.contentDocument.body.firstChild, 'border');
            Assertions.assertEq('should return 0', 0, measured.top);
            iframe.parentNode.removeChild(iframe);
            next();
          } catch (e) {
            die('Should not throw error, ' + e.message);
          }
        }, false);

        iframe.contentDocument.open();
        iframe.contentDocument.write('<html><body><div>a</div></body></html>');
        iframe.contentDocument.close();
      })
    )
  ], function () {
    success();
  }, failure);
});
