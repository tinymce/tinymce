import { GeneralSteps, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Body, Traverse } from '@ephox/sugar';

import TestTheme from '../../module/test/theme/TestTheme';
import TestUi from '../../module/test/ui/TestUi';
import { TestHelpers } from '@ephox/alloy';

UnitTest.asynctest('Browser Test: features.UnlinkTest', function (success, failure) {

  /* This test is going to create a toolbar with bold, italic, underline in it */
  const body = Body.body();

  TestTheme.setup({
    container: body,
    items: [ 'link', 'unlink' ]
  }, success, failure).use(
    function (realm, apis, toolbar, socket, buttons, onSuccess, onFailure) {

      const sSetS1 = apis.sSetSelection([ 0, 0 ], 'n'.length, [ 0, 0 ], 'n'.length);
      const sSetS2 = apis.sSetSelection([ 0, 1, 0 ], 'tin'.length, [ 0, 1, 0 ], 'tin'.length);

      const sCheckComponent = function (label, state) {
        return function (memento) {
          return TestUi.sWaitForToggledState(label, state, realm, memento);
        };
      };

      const sCheckS1 = function (situation) {
        return GeneralSteps.sequence([
          sSetS1,
          sCheckLink(situation, false)
        ]);
      };

      const sCheckS2 = function (situation) {
        return GeneralSteps.sequence([
          sSetS2,
          sCheckLink(situation, true)
        ]);
      };

      const sCheckLink = function (situation, expected) {
        return GeneralSteps.sequence([
          sCheckComponent(situation + ' (unlink state)', expected)(buttons.unlink),
          sCheckComponent(situation + ' (link state)', expected)(buttons.link)
        ]);
      };

      Pipeline.async({}, [
        TestHelpers.GuiSetup.mAddStyles(Traverse.owner(body), [
          '.tinymce-mobile-toolbar-button { padding: 2px; border: 1px solid black; background: white; }',
          '.tinymce-mobile-toolbar-button.tinymce-mobile-toolbar-button-selected { background: #cadbee; }',
          '.tinymce-mobile-icon-unlink:before { content: "UNLINK"; }',
          '.tinymce-mobile-icon-link:before { content: "LINK"; }'
        ]),
        apis.sFocus,

        apis.sSetContent(
          '<p>no link <a href="www.tinymce.com">tinymce</a></p>'
        ),
        sCheckS1('initial selection in text'),
        sCheckS2('normal >>> link'),
        sCheckS1('link >>> normal'),
        apis.sAssertContentPresence({
          a: 1
        }),

        sSetS2,
        TestUi.sClickComponent(realm, buttons.unlink),
        apis.sAssertContentPresence({
          a: 0
        }),

        // Tinymce moves the cursor after an unlink, so return the selection to the same spot
        apis.sSetSelection([ 0, 1 ], 'for'.length, [ 0, 1 ], 'for'.length),
        sCheckLink('link should be removed', false),
        TestHelpers.GuiSetup.mRemoveStyles
      ], onSuccess, onFailure);
    }
  );
});
