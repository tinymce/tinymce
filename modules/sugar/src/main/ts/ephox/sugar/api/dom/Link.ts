import * as ClickBehavior from '../../impl/ClickBehavior';
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

const generatePreventClicksOnLinksScript = (
  fn: (isMetaKeyPressed: (e: MouseEvent) => boolean) => void,
  isMetaKeyPressed: (e: MouseEvent) => boolean
): string => {
  return `<script>(${fn.toString()})(${isMetaKeyPressed.toString()})</script>`;
};

const getPreventClicksOnLinksScript = (): string => {
  const isMetaKeyPressed = (e: MouseEvent): boolean =>
    Platform.isMacOS() || Platform.isiOS()
      ? e.metaKey
      : e.ctrlKey && !e.altKey;

  const script = generatePreventClicksOnLinksScript(
    ClickBehavior.preventDefaultClickLinkBehavior,
    isMetaKeyPressed
  );

  return script;
};

export {
  addStylesheet,
  getPreventClicksOnLinksScript
};
