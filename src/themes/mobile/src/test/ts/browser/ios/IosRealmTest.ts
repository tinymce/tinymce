import { Assertions } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { Replacing } from '@ephox/alloy';
import { GuiFactory } from '@ephox/alloy';
import { Attachment } from '@ephox/alloy';
import { Fun } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Insert } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { DomEvent } from '@ephox/sugar';
import { Body } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Attr } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { WindowSelection } from '@ephox/sugar';
import TestUi from '../../module/test/ui/TestUi';
import IosRealm from 'tinymce/themes/mobile/ui/IosRealm';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('Browser Test: ios.IosRealmTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];
  var detection = PlatformDetection.detect();

  var realm = IosRealm();

  var unload = function () {
    Remove.remove(iframe);
    Attachment.detachSystem(realm.system());
  };



  var iframe = Element.fromTag('iframe');
  Css.set(iframe, 'height', '400px');
  var onload = DomEvent.bind(iframe, 'load', function () {
    var head = Element.fromDom(iframe.dom().contentWindow.document.head);
    var body = Element.fromDom(iframe.dom().contentWindow.document.body);
    Attachment.attachSystem(body, realm.system());

    Css.set(body, 'margin', '0px');

    var css = Element.fromTag('link');
    Attr.setAll(css, {
      href: '/project/src/skins/lightgray/dist/lightgray/skin.mobile.min.css',
      rel: 'Stylesheet',
      type: 'text/css'
    });
    Insert.append(head, css);
    onload.unbind();


    var editor = Element.fromTag('iframe');
    Attr.set(editor, 'src', '/project/src/themes/mobile/src/test/html/editor.html');
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
        getFrame: function () {
          return editor;
        },
        onDomChanged: function () {
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

  var getCursorY = function (target) {
    /* The y position on the cursor for the viewer is a combination of y position of the editor frame and the y
     * y position of the target
     */
    var editorY = iframe.dom().contentWindow.document.querySelector('iframe').getBoundingClientRect().top;
    var targetY = target.dom().getBoundingClientRect().top;
    console.log('editorY', editorY, 'targetY', targetY);
    return editorY + targetY;
  };

  var mShowKeyboard = function (selector, index) {
    var keyboardHeight = 200;
    return Step.stateful(function (value, next, die) {
      var pageBody = iframe.dom().contentWindow.document.body;
      var editorBody = pageBody.querySelector('iframe').contentWindow.document.body;
      var target = Option.from(editorBody.querySelectorAll(selector)[index]).map(Element.fromDom).getOrDie('no index ' + index + ' for selector: ' + selector);
      WindowSelection.setExact(editorBody.ownerDocument.defaultView, target, 0, target, 0);
      var socket = pageBody.querySelector('.tinymce-mobile-editor-socket');
      socket.scrollTop = target.dom().getBoundingClientRect().top - 100 - keyboardHeight;
      pageBody.style.setProperty('margin-bottom', '2000px');
      pageBody.ownerDocument.defaultView.scrollTo(0, keyboardHeight);

      //
      var cursorY = getCursorY(target);
      var newValue = Merger.deepMerge(
        value,
        {
          target: target,
          cursorY: cursorY
        }
      );
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
      var toolstrip = iframe.dom().contentWindow.document.querySelector('.tinymce-mobile-toolstrip');
      Assertions.assertEq('Checking that the toolstrip is off screen when window moves', true, toolstrip.getBoundingClientRect().top < 0);
    }),
    Step.wait(3000),
    Step.sync(function () {
      var toolstrip = iframe.dom().contentWindow.document.querySelector('.tinymce-mobile-toolstrip');
      Assertions.assertEq('Checking that the toolstrip is at top of screen after scroll recognised', 0, toolstrip.getBoundingClientRect().top);
    }),
    Step.stateful(function (value, next, die) {
      var nowCursorY = getCursorY(value.target);
      Assertions.assertEq('Checking visual position values are approximately equal after scrolling', true, Math.abs(nowCursorY - value.cursorY) < 10);
      next(value);
    })
  ] : [], function () { unload(); success(); }, failure);
});

