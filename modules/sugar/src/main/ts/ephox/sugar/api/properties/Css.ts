import { console, CSSStyleDeclaration, Element as DomElement, HTMLElement, Node as DomNode, window } from '@ephox/dom-globals';
import { Arr, Obj, Option, Strings, Type } from '@ephox/katamari';
import * as Style from '../../impl/Style';
import * as Body from '../node/Body';
import Element from '../node/Element';
import * as Node from '../node/Node';
import * as Attr from './Attr';

const internalSet = (dom: DomNode, property: string, value: string) => {
  // This is going to hurt. Apologies.
  // JQuery coerces numbers to pixels for certain property names, and other times lets numbers through.
  // we're going to be explicit; strings only.
  if (!Type.isString(value)) {
    // tslint:disable-next-line:no-console
    console.error('Invalid call to CSS.set. Property ', property, ':: Value ', value, ':: Element ', dom);
    throw new Error('CSS value must be a string: ' + value);
  }

  // removed: support for dom().style[property] where prop is camel case instead of normal property name
  if (Style.isSupported(dom)) {
    dom.style.setProperty(property, value);
  }
};

const internalRemove = (dom: DomNode, property: string) => {
  /*
   * IE9 and above - MDN doesn't have details, but here's a couple of random internet claims
   *
   * http://help.dottoro.com/ljopsjck.php
   * http://stackoverflow.com/a/7901886/7546
   */
  if (Style.isSupported(dom)) {
    dom.style.removeProperty(property);
  }
};

const set = (element: Element<DomNode>, property: string, value: string): void => {
  const dom = element.dom();
  internalSet(dom, property, value);
};

const setAll = (element: Element<DomNode>, css: Record<string, string>): void => {
  const dom = element.dom();

  Obj.each(css, (v, k) => {
    internalSet(dom, k, v);
  });
};

const setOptions = (element: Element<DomNode>, css: Record<string, Option<string>>): void => {
  const dom = element.dom();

  Obj.each(css, (v, k) => {
    v.fold(() => {
      internalRemove(dom, k);
    }, (value) => {
      internalSet(dom, k, value);
    });
  });
};

/*
 * NOTE: For certain properties, this returns the "used value" which is subtly different to the "computed value" (despite calling getComputedStyle).
 * Blame CSS 2.0.
 *
 * https://developer.mozilla.org/en-US/docs/Web/CSS/used_value
 */
const get = (element: Element<DomElement>, property: string): string => {
  const dom = element.dom();
  /*
   * IE9 and above per
   * https://developer.mozilla.org/en/docs/Web/API/window.getComputedStyle
   *
   * Not in numerosity, because it doesn't memoize and looking this up dynamically in performance critical code would be horrendous.
   *
   * JQuery has some magic here for IE popups, but we don't really need that.
   * It also uses element.ownerDocument.defaultView to handle iframes but that hasn't been required since FF 3.6.
   */
  const styles = window.getComputedStyle(dom);
  const r = styles.getPropertyValue(property);

  // jquery-ism: If r is an empty string, check that the element is not in a document. If it isn't, return the raw value.
  // Turns out we do this a lot.
  return (r === '' && !Body.inBody(element)) ? getUnsafeProperty(dom, property) : r;
};

// removed: support for dom().style[property] where prop is camel case instead of normal property name
// empty string is what the browsers (IE11 and Chrome) return when the propertyValue doesn't exists.
const getUnsafeProperty = (dom: DomNode, property: string) => Style.isSupported(dom) ? dom.style.getPropertyValue(property) : '';

/*
 * Gets the raw value from the style attribute. Useful for retrieving "used values" from the DOM:
 * https://developer.mozilla.org/en-US/docs/Web/CSS/used_value
 *
 * Returns NONE if the property isn't set, or the value is an empty string.
 */
const getRaw = (element: Element<DomNode>, property: string) => {
  const dom = element.dom();
  const raw = getUnsafeProperty(dom, property);

  return Option.from(raw).filter((r) => r.length > 0);
};

const getAllRaw = (element: Element<DomNode>) => {
  const css: Record<string, string> = {};
  const dom = element.dom();

  if (Style.isSupported(dom)) {
    for (let i = 0; i < dom.style.length; i++) {
      const ruleName = dom.style.item(i) as keyof CSSStyleDeclaration;
      css[ruleName] = dom.style[ruleName];
    }
  }
  return css;
};

const isValidValue = (tag: string, property: string, value: string) => {
  const element = Element.fromTag(tag);
  set(element, property, value);
  const style = getRaw(element, property);
  return style.isSome();
};

const remove = (element: Element<DomNode>, property: string) => {
  const dom = element.dom();

  internalRemove(dom, property);

  if (Attr.getOpt(element as Element<DomElement>, 'style').map(Strings.trim).is('')) {
    // No more styles left, remove the style attribute as well
    Attr.remove(element as Element<DomElement>, 'style');
  }
};

const preserve = <E extends DomElement, T> (element: Element<E>, f: (e: Element<E>) => T) => {
  const oldStyles = Attr.get(element, 'style');
  const result = f(element);
  if (oldStyles === undefined) {
    Attr.remove(element, 'style');
  } else {
    Attr.set(element, 'style', oldStyles);
  }
  return result;
};

const copy = (source: Element<DomNode>, target: Element<HTMLElement>) => {
  const sourceDom = source.dom();
  const targetDom = target.dom();
  if (Style.isSupported(sourceDom) && Style.isSupported(targetDom)) {
    targetDom.style.cssText = sourceDom.style.cssText;
  }
};

/* NOTE:
 * do not rely on this return value.
 * It's here so the closure compiler doesn't optimise the property access away.
 */
const reflow = (e: Element<HTMLElement>) => e.dom().offsetWidth;

const transferOne = (source: Element<DomNode>, destination: Element<DomNode>, style: string) => {
  getRaw(source, style).each((value) => {
    // NOTE: We don't want to clobber any existing inline styles.
    if (getRaw(destination, style).isNone()) {
      set(destination, style, value);
    }
  });
};

const transfer = (source: Element<DomNode>, destination: Element<DomNode>, styles: string[]) => {
  if (!Node.isElement(source) || !Node.isElement(destination)) {
    return;
  }
  Arr.each(styles, (style) => {
    transferOne(source, destination, style);
  });
};

export { copy, set, preserve, setAll, setOptions, remove, get, getRaw, getAllRaw, isValidValue, reflow, transfer };
