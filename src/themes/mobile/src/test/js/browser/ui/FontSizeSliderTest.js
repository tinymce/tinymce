asynctest(
  'Browser Test: ui.FontSizeSliderTest',

  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.alloy.api.system.Attachment',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.Traverse',
    'tinymce.themes.mobile.test.ui.TestEditor',
    'tinymce.themes.mobile.test.ui.TestFrameEditor',
    'tinymce.themes.mobile.test.ui.TestStyles',
    'tinymce.themes.mobile.ui.FontSizeSlider',
    'tinymce.themes.mobile.ui.IosRealm'
  ],

  function (Pipeline, Step, Attachment, Body, Element, Traverse, TestEditor, TestFrameEditor, TestStyles, FontSizeSlider, IosRealm) {
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

    var tEditor = TestFrameEditor();

    realm.system().add(tEditor.component());


    realm.setToolbarGroups([
      {
        label: 'group1',
        items: [
          FontSizeSlider.sketch(realm, tEditor.editor())
          // Buttons.forToolbarCommand(tEditor.editor(), 'alpha'),
          // Buttons.forToolbarStateCommand(tEditor.editor(), 'beta'),
          // Buttons.forToolbarStateAction(tEditor.editor(), 'gamma-class', 'gamma-query', function () {
          //   tEditor.adder('gamma-action')();
          // })
        ]
      }
    ]);

    Pipeline.async({}, [
      TestStyles.sWaitForToolstrip(realm),
      tEditor.sPrepareState(Element.fromTag('span'), 'content'),
      Step.sync(function () {
        tEditor.editor().focus();
      }),
      function () { }
    ], function () {
      unload(); success();
    }, failure);


  }
);
