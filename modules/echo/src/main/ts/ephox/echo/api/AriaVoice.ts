import AriaRegister from './AriaRegister';
import { Fun, Id } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Attr, Css, Element, Insert, Remove, Traverse } from '@ephox/sugar';
import { setTimeout } from '@ephox/dom-globals';

const isFirefox = PlatformDetection.detect().browser.isFirefox();

const offscreen = {
  position: 'absolute',
  left: '-9999px'
};

const tokenSelector = function () {
  return 'span[id^="ephox-echo-voice"]';
};

const create = function (doc, text) {
  const span = Element.fromTag('span', doc.dom());
  AriaRegister.presentation(span);
  // This stops it saying other things (possibly blank) between transitions.
  const contents = Element.fromText(text, doc.dom());
  Insert.append(span, contents);
  return span;
};

const linkToDescription = function (item, token) {
  const id = Id.generate('ephox-echo-voice');
  Attr.set(token, 'id', id);
  Attr.set(item, 'aria-describedby', id);
};

const describe = function (item, description) {
  const doc = Traverse.owner(item);
  const token = create(doc, description);

  // We may not be able to get rid of them, so we'll make them display: none;
  Css.set(token, 'display', 'none');
  AriaRegister.hidden(token, true);  // aria-hidden needs to be in sync with dom visibility
  // Although described-by does not appear to work in IE10, we are currently only supporting JAWS in Firefox (and IE11),
  // and this does work for those browsers.
  linkToDescription(item, token);

  return token;
};

const base = function (getAttrs, parent, text) {
  const doc = Traverse.owner(parent);

  // firefox needs aria-describedby to speak a role=alert token, which causes IE11 to read twice
  const token = create(doc, text);
  if (isFirefox) {
    linkToDescription(parent, token);
  }

  // Make it speak as soon as it is in the DOM (politely)
  Attr.setAll(token, getAttrs(text));
  Css.setAll(token, offscreen);

  Insert.append(parent, token);

  // Remove the token later.
  setTimeout(function () {
    // If you don't remove this attribute, IE11 speaks the removal
    Attr.remove(token, 'aria-live');
    Remove.remove(token);
  }, 1000);
};

const speak = Fun.curry(base, function (text) {
  return {
    // Make it speak as soon as it is in the DOM (politely)
    'aria-live': 'polite',
    'aria-atomic': 'true',
    'aria-label': text
  };
});

const shout = Fun.curry(base, Fun.constant({
  // Don't put aria-label in alerts. It will read it twice on JAWS+Firefox.
  'aria-live': 'assertive',
  'aria-atomic': 'true',
  'role': 'alert'
}));

export default <any> {
  describe,
  speak,
  shout,
  tokenSelector
};
