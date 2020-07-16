import { document, Document } from '@ephox/dom-globals';
import { SugarElement } from './SugarElement';

export const getDocument = (): SugarElement<Document> =>
  SugarElement.fromDom(document);
