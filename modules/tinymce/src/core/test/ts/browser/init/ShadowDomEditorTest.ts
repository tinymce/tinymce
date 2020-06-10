import { Pipeline, Step } from '@ephox/agar';
import { document, StyleSheet } from '@ephox/dom-globals';
import { TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';
import { ShadowDom, Element, Insert, Body, Remove } from '@ephox/sugar';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import { Arr, Strings } from '@ephox/katamari';

UnitTest.asynctest('Skin stylesheets should be loaded in ShadowRoot when editor is in ShadowRoot', (success, failure) => {

  if (ShadowDom.isSupported()) {
    Theme();

    const shadowHost = Element.fromTag('div', document);
    Insert.append(Body.body(), shadowHost);
    const sr = Element.fromDom(shadowHost.dom().attachShadow({ mode: 'open' }));
    const editorDiv = Element.fromTag('div', document);
    Insert.append(sr, editorDiv);

    TinyLoader.setupFromElement((editor: Editor, onSuccess, onFailure) => {
      const isSkin = (ss: StyleSheet) => ss.href !== null && Strings.contains(ss.href, 'skin.min.css');
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
        })
      ], () => {
        Remove.remove(shadowHost);
        success();
      }, onFailure);
    }, {
      toolbar_sticky: false,
      base_url: '/project/tinymce/js/tinymce'
    }, editorDiv, success, failure);
  } else {
    success();
  }
});
