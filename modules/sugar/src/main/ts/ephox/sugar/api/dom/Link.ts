import { SugarElement } from '../node/SugarElement';
import * as SugarHead from '../node/SugarHead';
import * as Attribute from '../properties/Attribute';
import * as Platform from '../view/Platform';
import * as Insert from './Insert';

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

export {
  addStylesheet,
  getPreventClicksOnLinksScript
};
