asynctest(
  'UiChainsTest',

  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Chain',
    'ephox.mcagar.api.ApiChains',
    'ephox.mcagar.api.UiChains',
    'ephox.mcagar.api.Editor'
  ],

  function (Pipeline, Chain, ApiChains, UiChains, Editor) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Pipeline.async({}, [
      Chain.asStep({}, [
        Editor.cFromSettings({
          plugins: 'link',
          toolbar: 'undo redo | bold | link unlink'
        }),
        ApiChains.cSetContent('<p>some text</p>'),
        ApiChains.cSetSelection([0, 0], 0, [0, 0], 4),
        UiChains.cClickOnToolbar("click Bold button", '[role="button"][aria-label="Bold"]'),
        ApiChains.cAssertContent('<p><strong>some</strong> text</p>'),

        UiChains.cClickOnToolbar("click Link button", '[role="button"][aria-label="Insert/edit link"]'),
        UiChains.cFillActiveDialog({
          href: 'http://example.com',
          title: "Example URL",
          target: '_blank'
        }),
        // selector is optional, if not specified current active popup will be processed
        UiChains.cSubmitDialog(),
        ApiChains.cAssertContent('<p><a title="Example URL" href="http://example.com" target="_blank" rel="noopener"><strong>some</strong></a> text</p>'),

        Editor.cRemove
      ])
    ], function () {
      success();
    }, failure);
  }
);