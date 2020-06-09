import Element from 'ephox/sugar/api/node/Element';
import { document, Element as DomElement, HTMLIFrameElement, ShadowRoot, Window } from '@ephox/dom-globals';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Body from 'ephox/sugar/api/node/Body';
import * as Remove from 'ephox/sugar/api/dom/Remove';

export const withNormalElement = (f: (d: Element<DomElement>) => void): void => {
  const div = Element.fromTag('div');
  Insert.append(Body.body(), div);

  try {
    f(div);
  } finally {
    Remove.remove(div);
  }
};

const withShadowElementInMode = (mode: 'open' | 'closed', f: (sr: Element<ShadowRoot>, innerDiv: Element<DomElement>, shadowHost: Element<DomElement>) => void) => {
  const shadowHost = Element.fromTag('div', document);
  Insert.append(Body.body(), shadowHost);
  const sr = Element.fromDom(shadowHost.dom().attachShadow({ mode }));
  const innerDiv = Element.fromTag('div', document);

  Insert.append(sr, innerDiv);

  try {
    f(sr, innerDiv, shadowHost);
  } finally {
    Remove.remove(shadowHost);
  }
};

export const withShadowElement = (f: (shadowRoot: Element<ShadowRoot>, innerDiv: Element<DomElement>, shadowHost: Element<DomElement>) => void): void => {
  withShadowElementInMode('open', f);
  withShadowElementInMode('closed', f);
};


export const withIframe = (f: (div: Element<DomElement>, iframe: Element<HTMLIFrameElement>, cw: Window) => void): void => {
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
  try {
    f(div, iframe, cw);
  } finally {
    Remove.remove(iframe);
  }
};
