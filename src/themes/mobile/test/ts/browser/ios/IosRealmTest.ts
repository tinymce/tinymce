import { Assertions, Pipeline, Step } from '@ephox/agar';
import { Attachment, GuiFactory, Replacing } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { console } from '@ephox/dom-globals';
import { Fun, Merger, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Attr, Body, Css, DomEvent, Element, Insert, Remove, WindowSelection } from '@ephox/sugar';

import IosRealm from 'tinymce/themes/mobile/ui/IosRealm';

import TestUi from '../../module/test/ui/TestUi';

UnitTest.asynctest('Browser Test: ios.IosRealmTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const detection = PlatformDetection.detect();

  const realm = IosRealm(Fun.noop);

  const unload = function () {
    Remove.remove(iframe);
    Attachment.detachSystem(realm.system());
  };

  const iframe = Element.fromTag('iframe');
  Css.set(iframe, 'height', '400px');
  const onload = DomEvent.bind(iframe, 'load', function () {
    const head = Element.fromDom(iframe.dom().contentWindow.document.head);
    const body = Element.fromDom(iframe.dom().contentWindow.document.body);
    Attachment.attachSystem(body, realm.system());

    Css.set(body, 'margin', '0px');

    const css = Element.fromTag('link');
    Attr.setAll(css, {
      href: '/project/tinymce/js/tinymce/skins/ui/oxide/skin.mobile.min.css',
      rel: 'Stylesheet',
      type: 'text/css'
    });
    Insert.append(head, css);
    onload.unbind();

    const editor = Element.fromTag('iframe');
    Attr.set(editor, 'src', '/project/tinymce/src/themes/mobile/test/html/editor.html');
    Replacing.append(
      realm.system().getByDom(Element.fromDom(
        realm.element().dom().querySelector('.tinymce-mobile-editor-socket'))
      ).getOrDie(),
      GuiFactory.external({
        element: editor
      })
    );

    realm.init({
      editor: {
        getFrame () {
          return editor;
        },
        onDomChanged () {
          return { unbind: Fun.noop };
        }
      },
      container: realm.element(),
      socket: Element.fromDom(realm.element().dom().querySelector('.tinymce-mobile-editor-socket')),
      toolstrip: Element.fromDom(realm.element().dom().querySelector('.tinymce-mobile-toolstrip')),
      toolbar: Element.fromDom(realm.element().dom().querySelector('.tinymce-mobile-toolbar')),
      alloy: realm.system(),
      dropup: realm.dropup()
    });
  });

  Insert.append(Body.body(), iframe);

  const getCursorY = function (target) {
    /* The y position on the cursor for the viewer is a combination of y position of the editor frame and the y
     * y position of the target
     */
    const editorY = iframe.dom().contentWindow.document.querySelector('iframe').getBoundingClientRect().top;
    const targetY = target.dom().getBoundingClientRect().top;
    // tslint:disable-next-line:no-console
    console.log('editorY', editorY, 'targetY', targetY);
    return editorY + targetY;
  };

  const mShowKeyboard = function (selector, index) {
    const keyboardHeight = 200;
    return Step.stateful(function (value, next, die) {
      const pageBody = iframe.dom().contentWindow.document.body;
      const editorBody = pageBody.querySelector('iframe').contentWindow.document.body;
      const target: any = Option.from(editorBody.querySelectorAll(selector)[index]).map(Element.fromDom).getOrDie('no index ' + index + ' for selector: ' + selector);
      WindowSelection.setExact(editorBody.ownerDocument.defaultView, target, 0, target, 0);
      const socket = pageBody.querySelector('.tinymce-mobile-editor-socket');
      socket.scrollTop = target.dom().getBoundingClientRect().top - 100 - keyboardHeight;
      pageBody.style.setProperty('margin-bottom', '2000px');
      pageBody.ownerDocument.defaultView.scrollTo(0, keyboardHeight);

      //
      const cursorY = getCursorY(target);
      const newValue = Merger.deepMerge(
        value,
        {
          target,
          cursorY
        }
      );
      // tslint:disable-next-line:no-console
      console.log('newValue', newValue);
      next(newValue);
    });
  };

  Pipeline.async({}, detection.browser.isChrome() ? [
    Step.wait(1000),
    TestUi.sStartEditor(realm.system()),
    Step.wait(1000),
    Step.sync(function () {
      // iframe.dom().contentWindow.document.querySelector('.tinymce-mobile-editor-socket').scrollTop = 200;
    }),
    Step.wait(1000),
    mShowKeyboard('p', 13),
    Step.sync(function () {
      const toolstrip = iframe.dom().contentWindow.document.querySelector('.tinymce-mobile-toolstrip');
      Assertions.assertEq('Checking that the toolstrip is off screen when window moves', true, toolstrip.getBoundingClientRect().top < 0);
    }),
    Step.wait(3000),
    Step.sync(function () {
      const toolstrip = iframe.dom().contentWindow.document.querySelector('.tinymce-mobile-toolstrip');
      Assertions.assertEq('Checking that the toolstrip is at top of screen after scroll recognised', 0, toolstrip.getBoundingClientRect().top);
    }),
    Step.stateful(function (value, next, die) {
      const nowCursorY = getCursorY(value.target);
      Assertions.assertEq('Checking visual position values are approximately equal after scrolling', true, Math.abs(nowCursorY - value.cursorY) < 10);
      next(value);
    })
  ] : [], function () { unload(); success(); }, failure);
});
