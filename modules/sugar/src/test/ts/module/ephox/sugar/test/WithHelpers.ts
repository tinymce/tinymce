import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as SugarBody from 'ephox/sugar/api/node/SugarBody';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as SugarShadowDom from 'ephox/sugar/api/node/SugarShadowDom';
import * as Attribute from 'ephox/sugar/api/properties/Attribute';

export const withNormalElement = (f: (d: SugarElement<Element>) => void): void => {
  const div = SugarElement.fromTag('div');
  Insert.append(SugarBody.body(), div);

  f(div);
  Remove.remove(div);
};

export const setupShadowRoot = (mode: 'open' | 'closed'): { shadowRoot: SugarElement<ShadowRoot>; innerDiv: SugarElement<HTMLElement>; shadowHost: SugarElement<HTMLElement> } => {
  const shadowHost = SugarElement.fromTag('div', document);
  Attribute.set(shadowHost, 'data-description', 'shadowHost');
  Insert.append(SugarBody.body(), shadowHost);
  const shadowRoot = SugarElement.fromDom(shadowHost.dom.attachShadow({ mode }));

  const innerDiv = SugarElement.fromTag('div', document);
  Attribute.set(innerDiv, 'data-description', 'innerDiv');

  Insert.append(shadowRoot, innerDiv);
  return { shadowHost, innerDiv, shadowRoot };
};

export const withShadowElementInMode = (mode: 'open' | 'closed', f: (sr: SugarElement<ShadowRoot>, innerDiv: SugarElement<HTMLElement>, shadowHost: SugarElement<HTMLElement>) => void): void => {
  if (SugarShadowDom.isSupported()) {
    const { shadowRoot, innerDiv, shadowHost } = setupShadowRoot(mode);
    f(shadowRoot, innerDiv, shadowHost);
    Remove.remove(shadowHost);
  }
};

export const withShadowElement = (f: (shadowRoot: SugarElement<ShadowRoot>, innerDiv: SugarElement<HTMLElement>, shadowHost: SugarElement<HTMLElement>) => void): void => {
  withShadowElementInMode('open', f);
  withShadowElementInMode('closed', f);
};

export const withIframe = (f: (div: SugarElement<HTMLElement>, iframe: SugarElement<HTMLIFrameElement>, cw: Window) => void): void => {
  const iframe = SugarElement.fromTag('iframe');
  Insert.append(SugarBody.body(), iframe);

  const cw = iframe.dom.contentWindow;
  if (cw === null) {
    throw new Error('contentWindow was null');
  }

  cw.document.open();
  cw.document.write('<html><head></head><body></body><html></html>');
  const div = SugarElement.fromTag('div', cw.document);
  Insert.append(SugarBody.getBody(SugarElement.fromDom(cw.document)), div);
  cw.document.close();
  f(div, iframe, cw);
  Remove.remove(iframe);
};
