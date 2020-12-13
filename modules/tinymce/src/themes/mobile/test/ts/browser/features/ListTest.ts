import { GeneralSteps, Pipeline } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { SugarBody, Traverse } from '@ephox/sugar';

import * as TestTheme from '../../module/test/theme/TestTheme';
import * as TestUi from '../../module/test/ui/TestUi';

UnitTest.asynctest('Browser Test: features.ListTest', (success, failure) => {

  /* This test is going to create a toolbar with both list items on it */
  const body = SugarBody.body();

  TestTheme.setup({
    container: body,
    items: [ 'bullist', 'numlist' ]
  }, success, failure).use(
    (realm, apis, toolbar, socket, buttons, onSuccess, onFailure) => {

      const sSetP1 = apis.sSetSelection([ 0, 0, 0 ], 'Thi'.length, [ 0, 0, 0 ], 'Thi'.length);
      const sSetP2 = apis.sSetSelection([ 1, 0 ], 'Norma'.length, [ 1, 0 ], 'Norma'.length);
      const sSetP3 = apis.sSetSelection([ 2, 0, 0 ], 'Bu'.length, [ 2, 0, 0 ], 'Bu'.length);

      const sCheckComponent = (label, state) => {
        return (memento) => {
          return TestUi.sWaitForToggledState(label, state, realm, memento);
        };
      };

      const sCheckLists = (situation, stateOfNumlist, stateOfBullist) => {
        return GeneralSteps.sequence([
          sCheckComponent('checking numlist: ' + situation, stateOfNumlist)(buttons.numlist),
          sCheckComponent('checking bullist: ' + situation, stateOfBullist)(buttons.bullist)
        ]);
      };

      const sCheckInNumlist = (situation) => {
        return sCheckLists(situation, true, false);
      };

      const sCheckInBullist = (situation) => {
        return sCheckLists(situation, false, true);
      };

      const sCheckInNoList = (situation) => {
        return sCheckLists(situation, false, false);
      };

      const sCheckP1 = (situation) => {
        return GeneralSteps.sequence([
          sSetP1,
          sCheckInNumlist(situation)
        ]);
      };

      const sCheckP2 = (situation) => {
        return GeneralSteps.sequence([
          sSetP2,
          sCheckInNoList(situation)
        ]);
      };

      const sCheckP3 = (situation) => {
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
        apis.sFocus(),
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
