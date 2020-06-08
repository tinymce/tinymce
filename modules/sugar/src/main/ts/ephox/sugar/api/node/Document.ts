import Element from './Element';
import { document, Document as DomDocument } from '@ephox/dom-globals';

export const getDocument = (): Element<DomDocument> =>
  Element.fromDom(document);
