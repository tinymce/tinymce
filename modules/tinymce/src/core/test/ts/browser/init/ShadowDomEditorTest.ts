import { Pipeline, Step, Chain, NamedChain } from '@ephox/agar';
import { document, StyleSheet, ShadowRoot } from '@ephox/dom-globals';
import { TinyLoader, Editor as McEditor } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';
import { ShadowDom, Element, Insert, Body, Remove, SelectorFilter } from '@ephox/sugar';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import { Arr, Strings } from '@ephox/katamari';

const isSkin = (ss: StyleSheet) => ss.href !== null && Strings.contains(ss.href, 'skin.min.css');

UnitTest.asynctest('Skin stylesheets should be loaded in ShadowRoot when editor is in ShadowRoot', (success, failure) => {
  if (!ShadowDom.isSupported()) {
    return success();
  }

  Theme();

  TinyLoader.setupInShadowRoot((editor: Editor, shadowRoot: Element<ShadowRoot>, onSuccess, onFailure) => {
    Pipeline.async({}, [
      Step.sync(() => {
        // TODO TINY-6144: Test that there are no skin stylesheets in the head. We will need to clean up existing stylesheets first, which may require a StyleSheetLoader.removeAll() function
        Assert.eq(
          'There should be a skin stylesheet in the ShadowRoot',
          true,
          Arr.exists(shadowRoot.dom().styleSheets, isSkin)
        );
      })
    ], onSuccess, onFailure);
  }, {
    toolbar_sticky: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});

UnitTest.asynctest('Only one skin stylesheet should be loaded for multiple editors in a ShadowRoot', (success, failure) => {
  if (!ShadowDom.isSupported()) {
    return success();
  }

  Theme();
  const shadowHost = Element.fromTag('div', document);
  Insert.append(Body.body(), shadowHost);
  const sr = Element.fromDom(shadowHost.dom().attachShadow({ mode: 'open' }));
  const mkEditor = () => {
    const editorDiv = Element.fromTag('div', document);
    Insert.append(sr, editorDiv);
    return McEditor.cFromElement(editorDiv, { base_url: '/project/tinymce/js/tinymce' });
  };
  const nc = NamedChain.asChain([
    NamedChain.write('editor1', mkEditor()),
    NamedChain.write('editor2', mkEditor()),
    NamedChain.write('editor3', mkEditor()),
    Chain.op(() => {
      Assert.eq(
        'There should only be 1 skin stylesheet in the ShadowRoot',
        1,
        Arr.filter(sr.dom().styleSheets, isSkin).length
      );
    }),
    NamedChain.read('editor1', McEditor.cRemove),
    NamedChain.read('editor2', McEditor.cRemove),
    NamedChain.read('editor3', McEditor.cRemove),
    Chain.op(() => {
      Remove.remove(shadowHost);
    })
  ]);
  Pipeline.async({}, [ Chain.asStep({}, [ nc ]) ], () => success(), failure);
});

UnitTest.asynctest('aux div should be within shadow root', (success, failure) => {
  if (!ShadowDom.isSupported()) {
    return success();
  }

  Theme();

  TinyLoader.setupInShadowRoot((editor, shadowRoot: Element<ShadowRoot>, onSuccess, onFailure) => {
    Pipeline.async({}, [
      Step.sync(() => {
        Assert.eq('Should be no aux divs in the document', 0, SelectorFilter.descendants(Body.body(), '.tox-tinymce-aux').length);
        Assert.eq('Should be 1 aux div in the shadow root', 1, SelectorFilter.descendants(shadowRoot, '.tox-tinymce-aux').length);
      })
    ], onSuccess, onFailure);
  }, {
    toolbar_sticky: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
