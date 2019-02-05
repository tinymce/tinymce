import { GeneralSteps, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Body, Traverse } from '@ephox/sugar';

import TestTheme from '../../module/test/theme/TestTheme';
import TestUi from '../../module/test/ui/TestUi';
import { TestHelpers } from '@ephox/alloy';

UnitTest.asynctest('Browser Test: features.ListTest', function (success, failure) {

  /* This test is going to create a toolbar with both list items on it */
  const body = Body.body();

  TestTheme.setup({
    container: body,
    items: [ 'bullist', 'numlist' ]
  }, success, failure).use(
    function (realm, apis, toolbar, socket, buttons, onSuccess, onFailure) {

      const sSetP1 = apis.sSetSelection([ 0, 0, 0 ], 'Thi'.length, [ 0, 0, 0 ], 'Thi'.length);
      const sSetP2 = apis.sSetSelection([ 1, 0 ], 'Norma'.length, [ 1, 0 ], 'Norma'.length);
      const sSetP3 = apis.sSetSelection([ 2, 0, 0 ], 'Bu'.length, [ 2, 0, 0 ], 'Bu'.length);

      const sCheckComponent = function (label, state) {
        return function (memento) {
          return TestUi.sWaitForToggledState(label, state, realm, memento);
        };
      };

      const sCheckLists = function (situation, stateOfNumlist, stateOfBullist) {
        return GeneralSteps.sequence([
          sCheckComponent('checking numlist: ' + situation, stateOfNumlist)(buttons.numlist),
          sCheckComponent('checking bullist: ' + situation, stateOfBullist)(buttons.bullist)
        ]);
      };

      const sCheckInNumlist = function (situation) {
        return sCheckLists(situation, true, false);
      };

      const sCheckInBullist = function (situation) {
        return sCheckLists(situation, false, true);
      };

      const sCheckInNoList = function (situation) {
        return sCheckLists(situation, false, false);
      };

      const sCheckP1 = function (situation) {
        return GeneralSteps.sequence([
          sSetP1,
          sCheckInNumlist(situation)
        ]);
      };

      const sCheckP2 = function (situation) {
        return GeneralSteps.sequence([
          sSetP2,
          sCheckInNoList(situation)
        ]);
      };

      const sCheckP3 = function (situation) {
        return GeneralSteps.sequence([
          sSetP3,
          sCheckInBullist(situation)
        ]);
      };

      Pipeline.async({}, [
        TestHelpers.GuiSetup.mAddStyles(Traverse.owner(body), [
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
        TestHelpers.GuiSetup.mRemoveStyles
      ], onSuccess, onFailure);
    }
  );
});
