import { Assertions, Chain, UiFinder, Waiter } from '@ephox/agar';
import { Id } from '@ephox/katamari';
import { Attr, Class, Css, Element, Insert, Remove, SelectorFind } from '@ephox/sugar';

const styleClass = Id.generate('ui-test-styles');

const addStyles = function () {
  const link = Element.fromTag('link');
  Attr.setAll(link, {
    rel: 'Stylesheet',
    href: '/project/js/tinymce/skins/lightgray/skin.mobile.min.css',
    type: 'text/css'
  });
  Class.add(link, styleClass);

  const head = Element.fromDom(document.head);
  Insert.append(head, link);
};

const removeStyles = function () {
  const head = Element.fromDom(document.head);
  SelectorFind.descendant(head, '.' + styleClass).each(Remove.remove);
};

const sWaitForToolstrip = function (realm) {
  return Waiter.sTryUntil(
    'Waiting until CSS has loaded',
    Chain.asStep(realm.element(), [
      UiFinder.cFindIn('.tinymce-mobile-toolstrip'),
      Chain.op(function (toolstrip) {
        if (navigator.userAgent.indexOf('PhantomJS') === -1) {
          Assertions.assertEq('Checking toolstrip is flex', 'flex', Css.get(toolstrip, 'display'));
        }
      })
    ]),
    100,
    8000
  );
};

export default {
  addStyles,
  removeStyles,
  sWaitForToolstrip
};