import { Chain, FocusTools, Guard, Log, NamedChain, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Result } from '@ephox/katamari';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Css, SugarBody, SugarElement, Traverse } from '@ephox/sugar';
import CharmapPlugin from 'tinymce/plugins/charmap/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.charmap.DialogHeightTest', (success, failure) => {
  CharmapPlugin();
  SilverTheme();

  // Move into shared library
  const cFakeEvent = (name) => {
    return Chain.control(
      Chain.op((elm: SugarElement) => {
        const evt = document.createEvent('HTMLEvents');
        evt.initEvent(name, true, true);
        elm.dom.dispatchEvent(evt);
      }),
      Guard.addLogging('Fake event')
    );
  };

  const cTabPanelHeight = Chain.binder<SugarElement, string, string>((tabpanel) => Css.getRaw(tabpanel, 'height').fold(() => Result.error('tabpanel has no height'), Result.value));

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);
    const doc = SugarElement.fromDom(document);

    Pipeline.async({},
      Log.steps('TBA', 'Charmap: Search for items, dialog height should not change when fewer items returned', [
        tinyApis.sFocus(),
        tinyUi.sClickOnToolbar('click charmap', 'button[aria-label="Special character"]'),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('wait for popup', 'div[role="dialog"]')
        ]),
        FocusTools.sTryOnSelector('Focus should start on', doc, 'input'),
        Chain.asStep(SugarBody.body(), [
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
            NamedChain.bundle((bindings) =>
              // TODO: Use round pixel numbers in DialogTabHeight.ts
              parseInt(bindings.oldheight, 10) !== parseInt(bindings.newheight, 10) ?
                Result.error(`Old height and new height differ. Old height: '${bindings.oldheight}' new height '${bindings.newheight}'`) :
                Result.value({})
            )
          ])
        ])
      ])
      , onSuccess, onFailure);
  }, {
    plugins: 'charmap',
    toolbar: 'charmap',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
