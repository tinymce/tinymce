import { setTimeout } from '@ephox/dom-globals';
import { Id } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Attr, Css, Element, Insert, Remove, Traverse } from '@ephox/sugar';

import { SugarDocument } from '../alien/TypeDefinitions';

const isFirefox: boolean = PlatformDetection.detect().browser.isFirefox();

const offscreen = {
  position: 'absolute',
  left: '-9999px'
};

const tokenSelector = (): string => {
  return 'span[id^="ephox-alloy-aria-voice"]';
};

// INVESTIGATE: Aria is special for insertion. Think about it more.
const create = (doc: SugarDocument, text: string): Element => {
  const span: Element = Element.fromTag('span', doc.dom());
  Attr.set(span, 'role', 'presentation');
  // This stops it saying other things (possibly blank) between transitions.
  const contents: Element = Element.fromText(text, doc.dom());
  Insert.append(span, contents);
  return span;
};

const linkToDescription = (item: Element, token: Element): void => {
  const id = Id.generate('ephox-alloy-aria-voice');
  Attr.set(token, 'id', id);
  Attr.set(item, 'aria-describedby', id);
};

const describe = (item: Element, description: string): Element => {
  const doc = Traverse.owner(item);
  const token = create(doc, description);

  // We may not be able to get rid of them, so we'll make them display: none;
  Css.set(token, 'display', 'none');
  Attr.set(token, 'aria-hidden', 'true'); // aria-hidden needs to be in sync with dom visibility
  // Although described-by does not appear to work in IE10, we are currently only supporting JAWS in Firefox (and IE11),
  // and this does work for those browsers.
  linkToDescription(item, token);

  return token;
};

const base = (getAttrs: (string: string) => { }, parent: Element, text: string): void => {
  const doc: SugarDocument = Traverse.owner(parent);

  // firefox needs aria-describedby to speak a role=alert token, which causes IE11 to read twice
  const token = create(doc, text);
  if (isFirefox) { linkToDescription(parent, token); }

  // Make it speak as soon as it is in the DOM (politely)
  Attr.setAll(token, getAttrs(text));
  Css.setAll(token, offscreen);

  Insert.append(parent, token);

  // Remove the token later.
  setTimeout(() => {
    // If you don't remove this attribute, IE11 speaks the removal
    Attr.remove(token, 'aria-live');
    Remove.remove(token);
  }, 1000);
};

const getSpeakAttrs = (text: string) => {
  return {
    // Make it speak as soon as it is in the DOM (politely)
    'aria-live': 'polite',
    'aria-atomic': 'true',
    'aria-label': text
  };
};

const getShoutAttrs = (_text: string) => {
  return {
    // Don't put aria-label in alerts. It will read it twice on JAWS+Firefox.
    'aria-live': 'assertive',
    'aria-atomic': 'true',
    'role': 'alert'
  };
};

const speak = (parent: Element, text: string): void => base(getSpeakAttrs, parent, text);

const shout = (parent: Element, text: string): void => base(getShoutAttrs, parent, text);

export {
  describe,
  speak,
  shout,
  tokenSelector
};
