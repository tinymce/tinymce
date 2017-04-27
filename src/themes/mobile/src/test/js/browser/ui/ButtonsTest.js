asynctest(
  'Browser Test: ui.ButtonsTest',

  [
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.test.GuiSetup',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.search.Traverse',
    'tinymce.themes.mobile.test.ui.TestEditor',
    'tinymce.themes.mobile.test.ui.TestStyles',
    'tinymce.themes.mobile.ui.Buttons',
    'tinymce.themes.mobile.ui.IosRealm'
  ],

  function (Mouse, Pipeline, Attachment, GuiSetup, Body, Traverse, TestEditor, TestStyles, Buttons, IosRealm) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var realm = IosRealm();

    var body = Body.body();
    Attachment.attachSystem(body, realm.system());

    var doc = Traverse.owner(body);

    TestStyles.addStyles();
    
    var unload = function () {
      TestStyles.removeStyles();
      Attachment.detachSystem(realm.system());
    };

    var tEditor = TestEditor();


    realm.setToolbarGroups([
      {
        label: 'group1',
        items: [
          Buttons.forToolbarCommand(tEditor.editor(), 'alpha')
        ]
      }
    ]);

    Pipeline.async({}, [
      GuiSetup.mAddStyles(doc, [
        '.tinymce-mobile-icon-alpha:before { content: "ALPHA"; }'
      ]),
      TestStyles.sWaitForToolstrip(realm),
      tEditor.sAssertEq('Initially empty', [ ]),
      Mouse.sClickOn(realm.system().element(), '.tinymce-mobile-icon-alpha'),
      tEditor.sAssertEq('After clicking on alpha', [
        {
          method: 'execCommand',
          data: {
            'alpha': undefined
          }
        }
      ]),
      function () { }
    ], function () {
      unload(); success();
    }, failure);
  }
);
