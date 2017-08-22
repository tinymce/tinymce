asynctest(
  'Browser Test: ui.ButtonsTest',

  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.test.GuiSetup',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.search.Traverse',
    'tinymce.themes.mobile.channels.TinyChannels',
    'tinymce.themes.mobile.test.ui.TestEditor',
    'tinymce.themes.mobile.test.ui.TestStyles',
    'tinymce.themes.mobile.test.ui.TestUi',
    'tinymce.themes.mobile.ui.Buttons',
    'tinymce.themes.mobile.ui.IosRealm'
  ],

  function (
    GeneralSteps, Logger, Mouse, Pipeline, Step, Memento, Attachment, GuiSetup, Body, Class, Traverse, TinyChannels, TestEditor, TestStyles, TestUi, Buttons,
    IosRealm
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var realm = IosRealm();

    var body = Body.body();
    Attachment.attachSystem(body, realm.system());

    // Make toolbar appear
    Class.add(realm.system().element(), 'tinymce-mobile-fullscreen-maximized');

    var doc = Traverse.owner(body);

    TestStyles.addStyles();

    var unload = function () {
      TestStyles.removeStyles();
      Attachment.detachSystem(realm.system());
    };

    var tEditor = TestEditor();

    var memAlpha = Memento.record(
      Buttons.forToolbarCommand(tEditor.editor(), 'alpha')
    );

    var memBeta = Memento.record(
      Buttons.forToolbarStateCommand(tEditor.editor(), 'beta')
    );

    var memGamma = Memento.record(
      Buttons.forToolbarStateAction(tEditor.editor(), 'gamma-class', 'gamma-query', function () {
        tEditor.adder('gamma-action')();
      })
    );

    realm.setToolbarGroups([
      {
        label: 'group1',
        items: [
          memAlpha.asSpec(),
          memBeta.asSpec(),
          memGamma.asSpec()
        ]
      }
    ]);

    var sTestAlpha = GeneralSteps.sequence([
      tEditor.sAssertEq('Initially empty', [ ]),
      TestUi.sClickComponent(realm, memAlpha),
      tEditor.sAssertEq('After clicking on alpha', [
        {
          method: 'execCommand',
          data: {
            'alpha': undefined
          }
        }
      ]),
      tEditor.sClear
    ]);

    var sTestBeta = GeneralSteps.sequence([
      tEditor.sAssertEq('before beta, store is empty', [ ]),
      TestUi.sClickComponent(realm, memBeta),
      tEditor.sAssertEq('After clicking on beta', [
        {
          method: 'execCommand',
          data: {
            'beta': undefined
          }
        }
      ]),
      tEditor.sClear,
      TestUi.sTogglingIs(realm.system(), '.tinymce-mobile-icon-beta', false),
      // Fire a format change
      Step.sync(function () {
        realm.system().broadcastOn([ TinyChannels.formatChanged() ], {
          command: 'beta',
          state: true
        });
      }),
      Logger.t(
        'Checking toggle after broadcasting event for beta',
        TestUi.sTogglingIs(realm.system(), '.tinymce-mobile-icon-beta', true)
      ),
      tEditor.sClear
    ]);

    var sTestGamma = GeneralSteps.sequence([
      tEditor.sAssertEq('before gamma, store is empty', [ ]),
      Mouse.sClickOn(realm.system().element(), '.tinymce-mobile-icon-gamma-class'),
      tEditor.sAssertEq('After clicking on gamma', [ 'gamma-action' ]),
      tEditor.sClear,
      TestUi.sTogglingIs(realm.system(), '.tinymce-mobile-icon-gamma-class', false),
      // Fire a format change
      Step.sync(function () {
        realm.system().broadcastOn([ TinyChannels.formatChanged() ], {
          command: 'gamma-query',
          state: true
        });
      }),
      Logger.t(
        'Checking toggle after broadcasting event for gamma',
        TestUi.sTogglingIs(realm.system(), '.tinymce-mobile-icon-gamma-class', true)
      )
    ]);

    Pipeline.async({}, [
      GuiSetup.mAddStyles(doc, [
        '.tinymce-mobile-icon-alpha:before { content: "ALPHA"; }',
        '.tinymce-mobile-icon-beta:before { content: "BETA"; }',
        '.tinymce-mobile-icon-gamma-class:before { content: "GAMMA"; }'
      ]),
      TestStyles.sWaitForToolstrip(realm),
      sTestAlpha,
      sTestBeta,
      sTestGamma
    ], function () {
      unload(); success();
    }, failure);
  }
);
