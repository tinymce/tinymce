import { GeneralSteps, Pipeline } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { SugarBody, Traverse } from '@ephox/sugar';

import * as TestTheme from '../../module/test/theme/TestTheme';
import * as TestUi from '../../module/test/ui/TestUi';

UnitTest.asynctest('Browser Test: features.UnlinkTest', (success, failure) => {

  /* This test is going to create a toolbar with bold, italic, underline in it */
  const body = SugarBody.body();

  TestTheme.setup({
    container: body,
    items: [ 'link', 'unlink' ]
  }, success, failure).use(
    (realm, apis, toolbar, socket, buttons, onSuccess, onFailure) => {

      const sSetS1 = apis.sSetSelection([ 0, 0 ], 'n'.length, [ 0, 0 ], 'n'.length);
      const sSetS2 = apis.sSetSelection([ 0, 1, 0 ], 'tin'.length, [ 0, 1, 0 ], 'tin'.length);

      const sCheckComponent = (label, state) => {
        return (memento) => {
          return TestUi.sWaitForToggledState(label, state, realm, memento);
        };
      };

      const sCheckS1 = (situation) => {
        return GeneralSteps.sequence([
          sSetS1,
          sCheckLink(situation, false)
        ]);
      };

      const sCheckS2 = (situation) => {
        return GeneralSteps.sequence([
          sSetS2,
          sCheckLink(situation, true)
        ]);
      };

      const sCheckLink = (situation, expected) => {
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
        apis.sFocus(),

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
