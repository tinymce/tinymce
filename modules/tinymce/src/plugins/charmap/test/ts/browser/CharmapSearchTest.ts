import { Assertions, Chain, FocusTools, Guard, Keyboard, Keys, Log, Pipeline, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { Attribute, SugarBody, SugarElement } from '@ephox/sugar';
import CharmapPlugin from 'tinymce/plugins/charmap/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.charmap.SearchTest', (success, failure) => {
  // TODO: TINY-6598: Test is broken on Chromium Edge 86, so we need to investigate
  const platform = PlatformDetection.detect();
  if (platform.browser.isChrome() && platform.os.isWindows()) {
    return success();
  }

  // TODO: Replicate this test with only one category of characters.
  CharmapPlugin();
  SilverTheme();

  // Move into shared library
  const cFakeEvent = function (name) {
    return Chain.control(
      Chain.op(function (elm: SugarElement) {
        const evt = document.createEvent('HTMLEvents');
        evt.initEvent(name, true, true);
        elm.dom.dispatchEvent(evt);
      }),
      Guard.addLogging('Fake event')
    );
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);
    const doc = SugarElement.fromDom(document);

    Pipeline.async({},
      Log.steps('TBA', 'Charmap: Open dialog, Search for "euro", Euro should be first option', [
        tinyApis.sFocus(),
        tinyUi.sClickOnToolbar('click charmap', 'button[aria-label="Special character"]'),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('wait for popup', 'div[role="dialog"]')
        ]),
        FocusTools.sTryOnSelector('Focus should start on', doc, 'input'), // TODO: Remove duped startup of these tests
        FocusTools.sSetActiveValue(doc, 'euro'),
        Chain.asStep(doc, [
          FocusTools.cGetFocused,
          cFakeEvent('input')
        ]),
        Waiter.sTryUntil(
          'Wait until Euro is the first choice (search should filter)',
          Chain.asStep(SugarBody.body(), [
            UiFinder.cFindIn('.tox-collection__item:first'),
            Chain.mapper((item) => Attribute.get(item, 'data-collection-item-value')),
            Assertions.cAssertEq('Search should show euro', '€')
          ])
        ),
        Keyboard.sKeydown(doc, Keys.tab(), { }),
        FocusTools.sTryOnSelector('Focus should have moved to collection', doc, '.tox-collection__item'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        Waiter.sTryUntil(
          'Waiting for content update',
          tinyApis.sAssertContent('<p>&euro;</p>')
        )
      ])
      , onSuccess, onFailure);
  }, {
    plugins: 'charmap',
    toolbar: 'charmap',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
