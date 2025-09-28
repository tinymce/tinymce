import { Optional, Type } from '@ephox/katamari';

import { SugarElement } from '../node/SugarElement';
import * as SugarHead from '../node/SugarHead';
import * as Attribute from '../properties/Attribute';
import * as Platform from '../view/Platform';

import * as Insert from './Insert';

const blockHandlerKey = '__mce_link_block_handler';

const addToHead = (doc: SugarElement<Document>, tag: SugarElement<Node>): void => {
  const head = SugarHead.getHead(doc);
  Insert.append(head, tag);
};

const addStylesheet = (url: string, scope?: SugarElement<Document>): SugarElement<HTMLLinkElement> => {
  const doc = scope || SugarElement.fromDom(document);

  const link = SugarElement.fromTag('link', doc.dom); // We really need to fix that SugarElement API

  Attribute.setAll(link, {
    rel: 'stylesheet',
    type: 'text/css',
    href: url
  });

  addToHead(doc, link);
  return link;
};

const getPreventClicksOnLinksScript = (): string => {
  const isMacOSOrIOS = Platform.isMacOS() || Platform.isiOS();

  const fn = (isMacOSOrIOS: boolean) => {
    document.addEventListener('click', (e) => {
      for (let elm = e.target as Node | null; elm; elm = elm.parentNode) {
        if (elm.nodeName === 'A') {
          const anchor = elm as HTMLElement;
          const href = anchor.getAttribute('href');

          if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetElement = document.getElementById(href.substring(1));

            if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth' });
            }

            return;
          }

          const isMetaKeyPressed = isMacOSOrIOS ? e.metaKey : e.ctrlKey && !e.altKey;

          if (!isMetaKeyPressed) {
            e.preventDefault();
          }
        }
      }
    }, false);
  };

  return `<script>(${fn.toString()})(${isMacOSOrIOS})</script>`;
};

const preventClicksOnLinks = (scope?: SugarElement<Document>): void => {
  const doc = scope ?? SugarElement.fromDom(document);

  const existingHandler = (doc.dom as any)[blockHandlerKey] as ((e: MouseEvent) => void) | undefined;
  if (existingHandler) {
    doc.dom.removeEventListener('click', existingHandler, false);
  }

  const isMacOSOrIOS = Platform.isMacOS() || Platform.isiOS();

  const handler = (e: MouseEvent) => {
    for (let elm = e.target as Node | null; Type.isNonNullable(elm); elm = elm.parentNode) {
      if ((elm as Element).nodeName === 'A') {
        const anchor = elm as HTMLElement;
        const href = anchor.getAttribute('href');

        if (Type.isString(href) && href.startsWith('#')) {
          e.preventDefault();
          Optional.from(doc.dom.getElementById(href.substring(1))).each((target) => {
            target.scrollIntoView({ behavior: 'smooth' });
          });
          return;
        }

        const isMetaKeyPressed = isMacOSOrIOS ? e.metaKey : e.ctrlKey && !e.altKey;

        if (!isMetaKeyPressed) {
          e.preventDefault();
        }

        return;
      }
    }
  };

  doc.dom.addEventListener('click', handler, false);
  (doc.dom as any)[blockHandlerKey] = handler;
};

export {
  addStylesheet,
  getPreventClicksOnLinksScript,
  preventClicksOnLinks
};
