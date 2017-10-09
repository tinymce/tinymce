asynctest(
  'Browser Test: features.BasicFormattingTest',

  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Pipeline',
    'ephox.alloy.test.GuiSetup',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.search.Traverse',
    'tinymce.themes.mobile.test.theme.TestTheme',
    'tinymce.themes.mobile.test.ui.TestUi'
  ],

  function (GeneralSteps, Pipeline, GuiSetup, Body, Traverse, TestTheme, TestUi) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    /* This test is going to create a toolbar with bold, italic, underline in it */
    var body = Body.body();

    TestTheme.setup({
      container: body,
      items: [ 'bold', 'italic', 'underline' ]
    }, success, failure).use(
      function (realm, apis, toolbar, socket, buttons, onSuccess, onFailure) {

        var sSetS1 = apis.sSetSelection([ 0, 0 ], 'n'.length, [ 0, 0 ], 'n'.length);
        var sSetS2 = apis.sSetSelection([ 0, 1, 0 ], 'for'.length, [ 0, 1, 0 ], 'for'.length);

        var sCheckComponent = function (label, state) {
          return function (memento) {
            return TestUi.sWaitForToggledState(label, state, realm, memento);
          };
        };

        var sTestFormatter = function (openTag, closeTag, name) {
          var sCheckS1 = function (situation) {
            return GeneralSteps.sequence([
              sSetS1,
              sCheckComponent(situation, false)(buttons[name])
            ]);
          };

          var sCheckS2 = function (situation) {
            return GeneralSteps.sequence([
              sSetS2,
              sCheckComponent(situation, true)(buttons[name])
            ]);
          };

          return GeneralSteps.sequence([
            apis.sSetContent(
              '<p>no format <' + openTag + '>format</' + closeTag + '>'
            ),
            sCheckS1('initial selection in text'),
            sCheckS2('normal >>> ' + name),
            sCheckS1(name + ' >>> normal'),

            TestUi.sClickComponent(realm, buttons[name]),
            sCheckComponent('"no" converted to ' + name, true)(buttons[name]),
            TestUi.sClickComponent(realm, buttons[name]),
            sCheckComponent('"no" reverted to normal', false)(buttons[name]),

            apis.sSetSelection([ 0, 1 + 1, 0 ], 'for'.length, [ 0, 1 + 1, 0 ], 'for'.length),
            sCheckComponent('moving back to ' + name, true)(buttons[name]),
            TestUi.sClickComponent(realm, buttons[name]),
            sCheckComponent('converting ' + name + ' to normal', false)(buttons[name]),
            TestUi.sClickComponent(realm, buttons[name]),
            sCheckComponent('reverting normal back to ' + name, true)(buttons[name])
          ]);
        };

        Pipeline.async({}, [
          GuiSetup.mAddStyles(Traverse.owner(body), [
            '.tinymce-mobile-toolbar-button { padding: 2px; border: 1px solid black; background: white; }',
            '.tinymce-mobile-toolbar-button.tinymce-mobile-toolbar-button-selected { background: #cadbee; }',
            '.tinymce-mobile-icon-bold:before { content: "BOLD"; }',
            '.tinymce-mobile-icon-italic:before { content: "ITALIC"; }',
            '.tinymce-mobile-icon-underline:before { content: "UNDERLINE"; }'
          ]),
          apis.sFocus,

          sTestFormatter('strong', 'strong', 'bold'),
          sTestFormatter('em', 'em', 'italic'),
          sTestFormatter('span style="text-decoration: underline;"', 'span', 'underline'),
          GuiSetup.mRemoveStyles
        ], onSuccess, onFailure);
      }
    );
  }
);
