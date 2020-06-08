import Element from 'ephox/sugar/api/node/Element';
import { document, Document } from '@ephox/dom-globals';

export const getDoc = (): Element<Document> =>
  Element.fromDom(document);
