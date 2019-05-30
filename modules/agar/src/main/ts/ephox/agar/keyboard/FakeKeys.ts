import { Document, HTMLElement } from '@ephox/dom-globals';
import { PlatformDetection } from '@ephox/sand';
import { Element } from '@ephox/sugar';

export interface OldKeyModifiers {
  shift?: boolean;
  meta?: boolean;
  ctrl?: boolean;
  alt?: boolean;
}

export interface KeyModifiers {
  shiftKey?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
}

export type MixedKeyModifiers = OldKeyModifiers | KeyModifiers;

const isNewKeyModifiers = (modifiers: MixedKeyModifiers): modifiers is KeyModifiers =>
  'shiftKey' in modifiers || 'metaKey' in modifiers || 'ctrlKey' in modifiers || 'altKey' in modifiers;

const newModifiers = (modifiers: MixedKeyModifiers): KeyModifiers => isNewKeyModifiers(modifiers) ? modifiers :
  { shiftKey: modifiers.shift, metaKey: modifiers.meta, ctrlKey: modifiers.ctrl, altKey: modifiers.alt };

// Take from Orwellophile's answer on
// http://stackoverflow.com/questions/10455626/keydown-simulation-in-chrome-fires-normally-but-not-the-correct-key
const keyevent = function (type: string, doc: Element, value: number, modifiers: MixedKeyModifiers, focus?: Element) {
  const domDoc: Document = doc.dom();
  const mod = newModifiers(modifiers);
  const oEvent = domDoc.createEvent('KeyboardEvent');
  const getter = function () {
    return value;
  };
  const defineGetter = function (obj, key: string, propGetter) {
    Object.defineProperty(obj, key, { get: propGetter, enumerable: true });
  };
  const dispatcher = focus !== undefined ? focus : doc;

  const platform = PlatformDetection.detect();
  if (platform.browser.isSafari() || platform.browser.isIE()) {
    safari(type, doc, value, mod, dispatcher);
  } else {

    if (platform.browser.isChrome() || platform.browser.isEdge() || platform.browser.isFirefox()) {
      defineGetter(oEvent, 'keyCode', getter);
      defineGetter(oEvent, 'which', getter);
      defineGetter(oEvent, 'shiftKey', function () { return mod.shiftKey === true; });
      defineGetter(oEvent, 'metaKey', function () { return mod.metaKey === true; });
      defineGetter(oEvent, 'ctrlKey', function () { return mod.ctrlKey === true; });
      defineGetter(oEvent, 'altKey', function () { return mod.altKey === true; });
    }

    const canBubble = true;
    const cancellable = true;
    const ctrlKey = mod.ctrlKey === true;
    const altKey = mod.altKey === true;
    const shiftKey = mod.shiftKey === true;
    const metaKey = mod.metaKey === true;

    if (oEvent.initKeyboardEvent) {
      // Note: typescript thinks the arguments are wrong so we should probably test it
      (<any>oEvent).initKeyboardEvent(type, canBubble, cancellable, domDoc.defaultView, ctrlKey, altKey, shiftKey, metaKey, value, value);
    } else {
      // this is unknown to typescript
      (<any>oEvent).initKeyEvent(type, canBubble, cancellable, domDoc.defaultView, ctrlKey, altKey, shiftKey, metaKey, value, type === 'keypress' && platform.browser.isFirefox() ? value : 0);
    }

    dispatcher.dom().dispatchEvent(oEvent);
  }
};

const safari = function (type: string, doc: Element, value: number, modifiers: KeyModifiers, dispatcher: Element) {
  const oEvent = (<Document>doc.dom()).createEvent('Events');
  oEvent.initEvent(type, true, true);

  (<any>oEvent).which = value;
  (<any>oEvent).keyCode = value;
  (<any>oEvent).shiftKey = modifiers.shiftKey === true;
  (<any>oEvent).ctrlKey = modifiers.ctrlKey === true;
  (<any>oEvent).metaKey = modifiers.metaKey === true;
  (<any>oEvent).altKey = modifiers.altKey === true;

  (<HTMLElement>dispatcher.dom()).dispatchEvent(oEvent);
};

export {
  newModifiers,
  keyevent
};