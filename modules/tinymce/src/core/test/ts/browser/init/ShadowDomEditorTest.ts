import { Pipeline, Step, Chain, NamedChain } from '@ephox/agar';
import { document, StyleSheet } from '@ephox/dom-globals';
import { TinyLoader, Editor as McEditor } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';
import { ShadowDom, Element, Insert, Body, Remove } from '@ephox/sugar';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import { Arr, Strings } from '@ephox/katamari';

const isSkin = (ss: StyleSheet) => ss.href !== null && Strings.contains(ss.href, 'skin.min.css');

UnitTest.asynctest('Skin stylesheets should be loaded in ShadowRoot when editor is in ShadowRoot', (success, failure) => {

  if (!ShadowDom.isSupported()) {
    return success();
  }

  Theme();

  const shadowHost = Element.fromTag('div', document);
  Insert.append(Body.body(), shadowHost);
  const sr = Element.fromDom(shadowHost.dom().attachShadow({ mode: 'open' }));
  const editorDiv = Element.fromTag('div', document);
  Insert.append(sr, editorDiv);

  TinyLoader.setupFromElement((editor: Editor, onSuccess, onFailure) => {
    Pipeline.async({}, [
      Step.sync(() => {
        Assert.eq(
          'There should not be any skin stylesheets in the document',
          false,
          Arr.exists(document.styleSheets, isSkin)
        );
        Assert.eq(
          'There should be a skin stylesheet in the ShadowRoot',
          true,
          Arr.exists(sr.dom().styleSheets, isSkin)
        );
        Remove.remove(shadowHost);
      })
    ], onSuccess, onFailure);
  }, {
    toolbar_sticky: false,
    base_url: '/project/tinymce/js/tinymce'
  }, editorDiv, success, failure);
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
