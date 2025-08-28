import { SugarElement } from './SugarElement';

export const getDocument = (): SugarElement<Document> =>
  SugarElement.fromDom(document);
