asynctest(
  'Browser Test: features.ListTest',

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

    /* This test is going to create a toolbar with both list items on it */
    var body = Body.body();

    TestTheme.setup({
      container: body,
      items: [ 'bullist', 'numlist' ]
    }, success, failure).use(
      function (realm, apis, toolbar, socket, buttons, onSuccess, onFailure) {

        var sSetP1 = apis.sSetSelection([ 0, 0, 0 ], 'Thi'.length, [ 0, 0, 0 ], 'Thi'.length);
        var sSetP2 = apis.sSetSelection([ 1, 0 ], 'Norma'.length, [ 1, 0 ], 'Norma'.length);
        var sSetP3 = apis.sSetSelection([ 2, 0, 0 ], 'Bu'.length, [ 2, 0, 0 ], 'Bu'.length);

        var sCheckComponent = function (label, state) {
          return function (memento) {
            return TestUi.sWaitForToggledState(label, state, realm, memento);
          };
        };

        var sCheckLists = function (situation, stateOfNumlist, stateOfBullist) {
          return GeneralSteps.sequence([
            sCheckComponent('checking numlist: ' + situation, stateOfNumlist)(buttons.numlist),
            sCheckComponent('checking bullist: ' + situation, stateOfBullist)(buttons.bullist)
          ]);
        };

        var sCheckInNumlist = function (situation) {
          return sCheckLists(situation, true, false);
        };

        var sCheckInBullist = function (situation) {
          return sCheckLists(situation, false, true);
        };

        var sCheckInNoList = function (situation) {
          return sCheckLists(situation, false, false);
        };

        var sCheckP1 = function (situation) {
          return GeneralSteps.sequence([
            sSetP1,
            sCheckInNumlist(situation)
          ]);
        };

        var sCheckP2 = function (situation) {
          return GeneralSteps.sequence([
            sSetP2,
            sCheckInNoList(situation)
          ]);
        };

        var sCheckP3 = function (situation) {
          return GeneralSteps.sequence([
            sSetP3,
            sCheckInBullist(situation)
          ]);
        };

        Pipeline.async({}, [
          GuiSetup.mAddStyles(Traverse.owner(body), [
            '.tinymce-mobile-toolbar-button { padding: 2px; border: 1px solid black; background: white; }',
            '.tinymce-mobile-toolbar-button.tinymce-mobile-toolbar-button-selected { background: #cadbee; }',
            '.tinymce-mobile-icon-unordered-list:before { content: "ul"; }',
            '.tinymce-mobile-icon-ordered-list:before { content: "ol"; }'
          ]),
          apis.sFocus,
          apis.sSetContent(
            '<ol><li>This is an ordered list</li></ol><p>Normal paragraph</p><ul><li>Bullet list</li></ul>'
          ),
          sCheckP1('initial selection in ol'),
          sCheckP2('ol >>> p'),
          sCheckP3('p >>> ul'),
          sCheckP1('ul >>> ol'),

          TestUi.sClickComponent(realm, buttons.bullist),
          sCheckInBullist('ol converted to ul'),
          TestUi.sClickComponent(realm, buttons.numlist),
          sCheckInNumlist('ul converted back to ol'),
          TestUi.sClickComponent(realm, buttons.numlist),
          sCheckInNoList('ol converted to p'),
          GuiSetup.mRemoveStyles
        ], onSuccess, onFailure);
      }
    );
  }
);
