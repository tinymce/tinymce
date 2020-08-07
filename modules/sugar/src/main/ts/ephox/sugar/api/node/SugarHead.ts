import { SugarElement } from './SugarElement';

export const head = (): SugarElement<HTMLHeadElement> => getHead(SugarElement.fromDom(document));

export const getHead = (doc: SugarElement<Document>): SugarElement<HTMLHeadElement> => {
  /*
   * IE9 and above per
   * https://developer.mozilla.org/en-US/docs/Web/API/Document/head
   */
  const b = doc.dom.head;
  if (b === null || b === undefined) {
    throw new Error('Head is not available yet');
  }
  return SugarElement.fromDom(b);
};
