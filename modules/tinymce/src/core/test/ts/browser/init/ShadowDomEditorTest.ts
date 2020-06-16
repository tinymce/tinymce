import { Pipeline, Step } from '@ephox/agar';
import { document, setTimeout, StyleSheet } from '@ephox/dom-globals';
import { TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';
import { ShadowDom, Element, Insert, Body, Remove } from '@ephox/sugar';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import { Arr, Futures, Global, Strings } from '@ephox/katamari';
import { Future } from '@ephox/katamari/lib/main/ts/ephox/katamari/api/Future';

const isSkin = (ss: StyleSheet) => ss.href !== null && Strings.contains(ss.href, 'skin.min.css');

UnitTest.asynctest('Skin stylesheets should be loaded in ShadowRoot when editor is in ShadowRoot', (success, failure) => {

  if (ShadowDom.isSupported()) {
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
  } else {
    success();
  }
});

UnitTest.asynctest('Only one skin stylesheet should be loaded for multiple editors in a ShadowRoot', (success, failure) => {
  if (ShadowDom.isSupported()) {
    Theme();

    const shadowHost = Element.fromTag('div', document);
    Insert.append(Body.body(), shadowHost);
    const sr = Element.fromDom(shadowHost.dom().attachShadow({ mode: 'open' }));

    const createF = () => Future.nu((done) => {
      const editorDiv = Element.fromTag('div', document);
      Insert.append(sr, editorDiv);

      Global.tinymce.init({
        target: editorDiv.dom(),
        base_url: '/project/tinymce/js/tinymce',
        setup: (editor) => {
          editor.on('SkinLoaded', () => {
            setTimeout(() => {
              done(editor);
            }, 0);
          });
        }
      });
    });

    Futures.traverse([1, 2, 3], createF).get((editors: Editor[]) => {
      Pipeline.async({}, [
        Step.sync(() => {
          Assert.eq(
            'There should only be 1 skin stylesheet in the ShadowRoot',
            1,
            Arr.filter(sr.dom().styleSheets, isSkin).length
          );
          Remove.remove(shadowHost);
          Arr.each(editors, (e) => e.remove());
          TinyLoader.removeTinymceElements();
        })
      ], () => {
        success()
      }, failure);
    });
  } else {
    success();
  }
});
