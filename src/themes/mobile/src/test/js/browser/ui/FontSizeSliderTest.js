asynctest(
  'Browser Test: ui.FontSizeSliderTest',

  [
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.alloy.api.system.Attachment',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.properties.Class',
    'tinymce.themes.mobile.test.ui.TestFrameEditor',
    'tinymce.themes.mobile.test.ui.TestSelectors',
    'tinymce.themes.mobile.test.ui.TestStyles',
    'tinymce.themes.mobile.ui.FontSizeSlider',
    'tinymce.themes.mobile.ui.IosRealm'
  ],

  function (Mouse, Pipeline, Step, Attachment, PlatformDetection, Body, Class, TestFrameEditor, TestSelectors, TestStyles, FontSizeSlider, IosRealm) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var detection = PlatformDetection.detect();

    var realm = IosRealm();
    // Make toolbar appear
    Class.add(realm.system().element(), 'tinymce-mobile-fullscreen-maximized');

    var body = Body.body();
    Attachment.attachSystem(body, realm.system());

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
        ]
      }
    ]);

    Pipeline.async({}, detection.browser.isChrome() ? [
      TestStyles.sWaitForToolstrip(realm),
      Step.sync(function () {
        tEditor.editor().focus();
      }),
      Mouse.sClickOn(realm.system().element(), TestSelectors.fontsize()),
      tEditor.sAssertEq('on first showing, the font size slider should not have fired execCommand', [ ])

      // Think about how to do the slider events
    ] : [], function () {
      unload(); success();
    }, failure);


  }
);
