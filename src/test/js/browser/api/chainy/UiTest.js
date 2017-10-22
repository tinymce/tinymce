asynctest(
  'UiTest',

  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Chain',
    'ephox.mcagar.api.chainy.Api',
    'ephox.mcagar.api.chainy.Ui',
    'ephox.mcagar.api.chainy.Editor'
  ],

  function (Pipeline, Chain, Api, Ui, Editor) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Pipeline.async({}, [
      Chain.asStep({}, [
        Editor.cFromSettings({
          plugins: 'link',
          toolbar: 'undo redo | bold | link unlink'
        }),
        Api.cSetContent('<p>some text</p>'),
        Api.cSetSelection([0, 0], 0, [0, 0], 4),
        Ui.cClickOnToolbar("click Bold button", '[role="button"][aria-label="Bold"]'),
        Api.cAssertContent('<p><strong>some</strong> text</p>'),

        Ui.cClickOnToolbar("click Link button", '[role="button"][aria-label="Insert/edit link"]'),
        Ui.cFillDialog({
          href: 'http://example.com',
          title: "Example URL",
          target: '_blank'
        }),
        Ui.cSubmitDialog(),
        Api.cAssertContent('<p><a title="Example URL" href="http://example.com" target="_blank" rel="noopener noreferrer"><strong>some</strong></a> text</p>'),

        Editor.cRemove
      ])
    ], function () {
      success();
    }, failure);
  }
);