import Element from 'ephox/sugar/api/node/Element';
import {
  document,
  Element as DomElement,
  HTMLElement,
  HTMLIFrameElement,
  ShadowRoot,
  Window
} from '@ephox/dom-globals';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Body from 'ephox/sugar/api/node/Body';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as ShadowDom from 'ephox/sugar/api/node/ShadowDom';
import * as Attr from 'ephox/sugar/api/properties/Attr';

export const withNormalElement = (f: (d: Element<DomElement>) => void): void => {
  const div = Element.fromTag('div');
  Insert.append(Body.body(), div);

  f(div);
  Remove.remove(div);
};

export const setupShadowRoot = (mode: 'open' | 'closed'): { shadowRoot: Element<ShadowRoot>; innerDiv: Element<HTMLElement>; shadowHost: Element<HTMLElement> } => {
  const shadowHost = Element.fromTag('div', document);
  Attr.set(shadowHost, 'data-description', 'shadowHost');
  Insert.append(Body.body(), shadowHost);
  const shadowRoot = Element.fromDom(shadowHost.dom().attachShadow({ mode }));

  const innerDiv = Element.fromTag('div', document);
  Attr.set(innerDiv, 'data-description', 'innerDiv');

  Insert.append(shadowRoot, innerDiv);
  return { shadowHost, innerDiv, shadowRoot };
};

export const withShadowElementInMode = (mode: 'open' | 'closed', f: (sr: Element<ShadowRoot>, innerDiv: Element<HTMLElement>, shadowHost: Element<HTMLElement>) => void) => {
  if (ShadowDom.isSupported()) {
    const { shadowRoot, innerDiv, shadowHost } = setupShadowRoot(mode);
    f(shadowRoot, innerDiv, shadowHost);
    Remove.remove(shadowHost);
  }
};

export const withShadowElement = (f: (shadowRoot: Element<ShadowRoot>, innerDiv: Element<HTMLElement>, shadowHost: Element<HTMLElement>) => void): void => {
  withShadowElementInMode('open', f);
  withShadowElementInMode('closed', f);
};

export const withIframe = (f: (div: Element<HTMLElement>, iframe: Element<HTMLIFrameElement>, cw: Window) => void): void => {
  const iframe = Element.fromTag('iframe');
  Insert.append(Body.body(), iframe);

  const cw = iframe.dom().contentWindow;
  if (cw === null) {
    throw new Error('contentWindow was null');
  }

  cw.document.open();
  cw.document.write('<html><head></head><body></body><html></html>');
  const div = Element.fromTag('div', cw.document);
  Insert.append(Body.getBody(Element.fromDom(cw.document)), div);
  cw.document.close();
  f(div, iframe, cw);
  Remove.remove(iframe);
};
