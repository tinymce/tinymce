import { Assertions, Chain, FocusTools, Guard, Keyboard, Keys, Log, Pipeline, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Attr, Body, Element } from '@ephox/sugar';
import CharmapPlugin from 'tinymce/plugins/charmap/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.charmap.SearchTest', (success, failure) => {
  // TODO: Replicate this test with only one category of characters.
  CharmapPlugin();
  SilverTheme();

  // Move into shared library
  const cFakeEvent = function (name) {
    return Chain.control(
      Chain.op(function (elm: Element) {
        const evt = document.createEvent('HTMLEvents');
        evt.initEvent(name, true, true);
        elm.dom().dispatchEvent(evt);
      }),
      Guard.addLogging('Fake event')
    );
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);
    const doc = Element.fromDom(document);

    Pipeline.async({},
      Log.steps('TBA', 'Charmap: Open dialog, Search for "euro", Euro should be first option', [
        tinyApis.sFocus,
        tinyUi.sClickOnToolbar('click charmap', 'button[aria-label="Special character"]'),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('wait for popup', 'div[role="dialog"]'),
        ]),
        FocusTools.sTryOnSelector('Focus should start on', doc, '[role="tab"]'), // TODO: Remove duped startup of these tests
        Keyboard.sKeydown(doc, Keys.tab(), { }),
        FocusTools.sTryOnSelector('Focus should have moved to input', doc, 'input'),
        FocusTools.sSetActiveValue(doc, 'euro'),
        Chain.asStep(doc, [
          FocusTools.cGetFocused,
          cFakeEvent('input')
        ]),
        Waiter.sTryUntil(
          'Wait until Euro is the first choice (search should filter)',
          Chain.asStep(Body.body(), [
            UiFinder.cFindIn('.tox-collection__item:first'),
            Chain.mapper((item) => {
              return Attr.get(item, 'data-collection-item-value');
            }),
            Assertions.cAssertEq('Search should show euro', '€')
          ]),
          100,
          1000
        ),
        Keyboard.sKeydown(doc, Keys.tab(), { }),
        FocusTools.sTryOnSelector('Focus should have moved to collection', doc, '.tox-collection__item'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        Waiter.sTryUntil(
          'Waiting for content update',
          tinyApis.sAssertContent('<p>&euro;</p>'),
          100,
          1000
        )
      ])
    , onSuccess, onFailure);
  }, {
    plugins: 'charmap',
    toolbar: 'charmap',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
