import { Fun, Id } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Attribute, Css, Insert, Remove, SugarElement, Traverse } from '@ephox/sugar';

const offscreen = {
  position: 'absolute',
  left: '-9999px'
};

const tokenSelector = Fun.constant('span[id^="ephox-alloy-aria-voice"]');

// INVESTIGATE: Aria is special for insertion. Think about it more.
const create = (doc: SugarElement<Document>, text: string): SugarElement<HTMLSpanElement> => {
  const span = SugarElement.fromTag('span', doc.dom);
  Attribute.set(span, 'role', 'presentation');
  // This stops it saying other things (possibly blank) between transitions.
  const contents = SugarElement.fromText(text, doc.dom);
  Insert.append(span, contents);
  return span;
};

const linkToDescription = (item: SugarElement<Element>, token: SugarElement<Element>): void => {
  const id = Id.generate('ephox-alloy-aria-voice');
  Attribute.set(token, 'id', id);
  Attribute.set(item, 'aria-describedby', id);
};

const describe = (item: SugarElement<Element>, description: string): SugarElement<HTMLSpanElement> => {
  const doc = Traverse.owner(item);
  const token = create(doc, description);

  // We may not be able to get rid of them, so we'll make them display: none;
  Css.set(token, 'display', 'none');
  Attribute.set(token, 'aria-hidden', 'true'); // aria-hidden needs to be in sync with dom visibility
  // Although described-by does not appear to work in IE10, we are currently only supporting JAWS in Firefox (and IE11),
  // and this does work for those browsers.
  linkToDescription(item, token);

  return token;
};

const base = (getAttrs: (string: string) => { }, parent: SugarElement<Element>, text: string): void => {
  const doc = Traverse.owner(parent);

  // firefox needs aria-describedby to speak a role=alert token, which causes IE11 to read twice
  const token = create(doc, text);
  if (PlatformDetection.detect().browser.isFirefox()) {
    linkToDescription(parent, token);
  }

  // Make it speak as soon as it is in the DOM (politely)
  Attribute.setAll(token, getAttrs(text));
  Css.setAll(token, offscreen);

  Insert.append(parent, token);

  // Remove the token later.
  setTimeout(() => {
    // If you don't remove this attribute, IE11 speaks the removal
    Attribute.remove(token, 'aria-live');
    Remove.remove(token);
  }, 1000);
};

const getSpeakAttrs = (text: string) => ({
  // Make it speak as soon as it is in the DOM (politely)
  'aria-live': 'polite',
  'aria-atomic': 'true',
  'aria-label': text
});

const getShoutAttrs = (_text: string) => ({
  // Don't put aria-label in alerts. It will read it twice on JAWS+Firefox.
  'aria-live': 'assertive',
  'aria-atomic': 'true',
  'role': 'alert'
});

const speak = (parent: SugarElement<Element>, text: string): void => base(getSpeakAttrs, parent, text);

const shout = (parent: SugarElement<Element>, text: string): void => base(getShoutAttrs, parent, text);

export {
  describe,
  speak,
  shout,
  tokenSelector
};
