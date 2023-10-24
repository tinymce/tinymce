import { Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { SugarElement } from '@ephox/sugar';

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
const keyevent = (type: string, doc: SugarElement<Document>, value: number, modifiers: MixedKeyModifiers, focus?: SugarElement<Node>): void => {
  const domDoc: Document = doc.dom;
  const mod = newModifiers(modifiers);
  const oEvent = domDoc.createEvent('KeyboardEvent');
  const getter = () => value;
  const defineGetter = (obj, key: string, propGetter) => {
    Object.defineProperty(obj, key, { get: propGetter, enumerable: true });
  };
  const dispatcher = focus !== undefined ? focus : doc;

  const platform = PlatformDetection.detect();
  if (platform.browser.isSafari()) {
    safari(type, doc, value, mod, dispatcher);
  } else {

    if (platform.browser.isChromium() || platform.browser.isFirefox()) {
      if (type === 'keypress') {
        defineGetter(oEvent, 'charCode', getter);
      }
      defineGetter(oEvent, 'keyCode', getter);
      defineGetter(oEvent, 'which', getter);
      defineGetter(oEvent, 'shiftKey', () => mod.shiftKey === true);
      defineGetter(oEvent, 'metaKey', () => mod.metaKey === true);
      defineGetter(oEvent, 'ctrlKey', () => mod.ctrlKey === true);
      defineGetter(oEvent, 'altKey', () => mod.altKey === true);
    }

    const canBubble = true;
    const cancellable = true;
    const ctrlKey = mod.ctrlKey === true;
    const altKey = mod.altKey === true;
    const shiftKey = mod.shiftKey === true;
    const metaKey = mod.metaKey === true;

    // this is unknown to typescript
    const anyEvent = oEvent as any;
    if (anyEvent.initKeyboardEvent) {
      anyEvent.initKeyboardEvent(type, canBubble, cancellable, domDoc.defaultView, ctrlKey, altKey, shiftKey, metaKey, value, value);
    } else {
      anyEvent.initKeyEvent(type, canBubble, cancellable, domDoc.defaultView, ctrlKey, altKey, shiftKey, metaKey, value, type === 'keypress' && platform.browser.isFirefox() ? value : 0);
    }

    dispatcher.dom.dispatchEvent(oEvent);
  }
};

const safari = (type: string, doc: SugarElement<Document>, value: number, modifiers: KeyModifiers, dispatcher: SugarElement<Node>): void => {
  const oEvent = doc.dom.createEvent('Events');
  oEvent.initEvent(type, true, true);

  if (type === 'keypress') {
    (oEvent as any).charCode = value;
  }
  (oEvent as any).which = value;
  (oEvent as any).keyCode = value;
  (oEvent as any).shiftKey = modifiers.shiftKey === true;
  (oEvent as any).ctrlKey = modifiers.ctrlKey === true;
  (oEvent as any).metaKey = modifiers.metaKey === true;
  (oEvent as any).altKey = modifiers.altKey === true;
  (oEvent as any).getModifierState = Fun.never;

  dispatcher.dom.dispatchEvent(oEvent);
};

export {
  newModifiers,
  keyevent
};
