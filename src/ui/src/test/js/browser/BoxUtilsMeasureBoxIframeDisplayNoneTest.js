asynctest(
  'browser.tinymce.ui.BoxUtilsMeasureBoxIframeDisplayNoneTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'global!document',
    'tinymce.themes.modern.Theme',
    'tinymce.ui.BoxUtils'
  ],
  function (Assertions, Logger, Pipeline, Step, document, ModernTheme, BoxUtils) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();

    Pipeline.async({}, [
      Logger.t(
        'firefox specific test, boxutils should not throw error when used on hidden iframe',
        Step.async(function (next, die) {
          var iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          document.body.appendChild(iframe);

          iframe.addEventListener('load', function () {
            try {
              var measured = BoxUtils.measureBox(iframe.contentDocument.body.firstChild, 'border');
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
  }
);