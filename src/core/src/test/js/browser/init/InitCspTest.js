asynctest(
  'browser.tinymce.core.init.InitCspTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'global!document',
    'global!navigator',
    'global!window',
    'tinymce.core.EditorManager',
    'tinymce.core.test.ViewBlock',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, GeneralSteps, Logger, Pipeline, Step, document, navigator, window, EditorManager, ViewBlock, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var viewBlock = new ViewBlock();
    var csp = "default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self';";
    var tinymceScriptUrl = '/project/js/tinymce/tinymce.js';
    var tinymceInitUrl = '/project/src/core/src/test/js/browser/init/InitCspIframeScript.js';

    Theme();

    var mCreateIframeSandbox = Step.stateful(function (state, next, die) {
      window.cspInitInstanceCallback = function (editor) {
        delete window.cspInitInstanceCallback;
        next({ editor: editor });
      };

      var ifr = document.createElement('iframe');
      viewBlock.get().appendChild(ifr);
      ifr.contentWindow.document.open();
      ifr.contentWindow.document.write([
        '<!DOCTYPE html>',
        '<html>',
        '<head>',
        '<meta http-equiv="Content-Security-Policy" content="' + csp + '" />',
        '</head>',
        '<body>',
        '<textarea></textarea>',
        '<script src="' + tinymceScriptUrl + '"></script>',
        '<script src="' + tinymceInitUrl + '"></script>',
        '</body>',
        '</html>'
      ].join(''));
      ifr.contentWindow.document.close();
    });

    var mSetContent = function (html) {
      return Step.stateful(function (state, next, die) {
        state.editor.setContent(html);
        next(state);
      });
    };

    var mAssertContent = function (expectedContent) {
      return Step.stateful(function (state, next, die) {
        var actualContent = state.editor.getContent();
        Assertions.assertHtml('Should be expected contents', expectedContent, actualContent);
        next(state);
      });
    };

    var mDestoryEditor = Step.stateful(function (state, next, die) {
      state.editor.remove();
      next(state);
    });

    viewBlock.attach();

    // Disables the csp test on Firefox since an iframe will change the sandbox of the parent document
    Pipeline.async({}, navigator.userAgent.indexOf('Firefox/') === -1 ? [
      Logger.t('Load editor into csp restricted iframe and do some basic operations', GeneralSteps.sequence([
        mCreateIframeSandbox,
        mSetContent('<p>test</p>'),
        mAssertContent('<p>test</p>'),
        mDestoryEditor
      ]))
    ] : [], function () {
      EditorManager.remove();
      viewBlock.detach();
      success();
    }, failure);
  }
);
