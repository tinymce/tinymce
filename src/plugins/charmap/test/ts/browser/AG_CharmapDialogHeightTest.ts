import 'tinymce/themes/silver/Theme';

import { Assertions, Chain, FocusTools, Guard, Keyboard, Keys, Log, Pipeline, UiFinder, Waiter, Step, NamedChain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Attr, Body, Element, Css, Traverse } from '@ephox/sugar';
import CharmapPlugin from 'tinymce/plugins/charmap/Plugin';
import { Result } from '@ephox/katamari';

UnitTest.asynctest('browser.tinymce.plugins.charmap.SearchTest', (success, failure) => {
  // TODO: Replicate this test with only one category of characters.
  CharmapPlugin();

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

  const cTabPanelHeight = Chain.binder<Element, string, string>((tabpanel) => {
    return Css.getRaw(tabpanel, 'height').fold(() => Result.error('tabpanel has no height'), Result.value);
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor, {toolBarSelector: '.tox-toolbar'});
    const doc = Element.fromDom(document);

    Pipeline.async({},
      Log.steps('TBA', 'Charmap: Search for items, dialog height should not change when fewer items returned', [
        tinyApis.sFocus,
        tinyUi.sClickOnToolbar('click charmap', '[role="button"][aria-label="Special character"]'),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('wait for popup', 'div[role="dialog"]'),
        ]),
        Keyboard.sKeydown(doc, Keys.tab(), { }),
        FocusTools.sTryOnSelector('Focus should have moved to input', doc, 'input'),
        Chain.asStep(Body.body() , [
          NamedChain.asChain([
            NamedChain.direct(NamedChain.inputName(), Chain.identity, 'body'),
            NamedChain.writeValue('doc', doc),
            NamedChain.direct('body', UiFinder.cFindIn('[role="dialog"] [role="tabpanel"]'), 'tabpanel'),
            NamedChain.direct('tabpanel', cTabPanelHeight, 'oldheight'),
            NamedChain.direct('body', FocusTools.cSetActiveValue('.'), '_'),
            NamedChain.direct('doc', FocusTools.cGetFocused, 'input'),
            NamedChain.direct('input', cFakeEvent('input'), '_'),
            // need to wait until '.tox-collection__group' has no children
            NamedChain.direct('body', UiFinder.cWaitForState('wait until ', '[role="dialog"] .tox-collection__group', (e) => Traverse.childNodesCount(e) === 0), '_'),
            NamedChain.direct('tabpanel', cTabPanelHeight, 'newheight'),
            NamedChain.bundle((errything) => {
              return errything.oldheight !== errything.newheight ?
                Result.error(`Old height and new height differ. Old height: '${errything.oldheight}' new height '${errything.newheight}'`) :
                Result.value({});
            })
          ])
        ])
      ])
    , onSuccess, onFailure);
  }, {
    plugins: 'charmap',
    toolbar: 'charmap',
    theme: 'silver',
    skin_url: '/project/js/tinymce/skins/oxide',
  }, success, failure);
});
