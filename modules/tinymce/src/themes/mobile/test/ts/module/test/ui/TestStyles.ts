import { Assertions, Chain, PhantomSkipper, UiFinder, Waiter } from '@ephox/agar';
import { Id } from '@ephox/katamari';
import { Attribute, Class, Css, Insert, Remove, SelectorFind, SugarElement } from '@ephox/sugar';

const styleClass = Id.generate('ui-test-styles');

const addStyles = () => {
  const link = SugarElement.fromTag('link');
  Attribute.setAll(link, {
    rel: 'Stylesheet',
    href: '/project/tinymce/js/tinymce/skins/ui/oxide/skin.mobile.min.css',
    type: 'text/css'
  });
  Class.add(link, styleClass);

  const head = SugarElement.fromDom(document.head);
  Insert.append(head, link);
};

const removeStyles = () => {
  const head = SugarElement.fromDom(document.head);
  SelectorFind.descendant(head, '.' + styleClass).each(Remove.remove);
};

const sWaitForToolstrip = (realm) => {
  return Waiter.sTryUntil(
    'Waiting until CSS has loaded',
    Chain.asStep(realm.element, [
      UiFinder.cFindIn('.tinymce-mobile-toolstrip'),
      Chain.op((toolstrip) => {
        if (!PhantomSkipper.detect()) {
          Assertions.assertEq('Checking toolstrip is flex', 'flex', Css.get(toolstrip, 'display'));
        }
      })
    ])
  );
};

export {
  addStyles,
  removeStyles,
  sWaitForToolstrip
};
