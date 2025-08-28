import { FocusTools } from '@ephox/agar';
import { SugarDocument, SugarElement } from '@ephox/sugar';

const pAssertFocusOnItem = (label: string, selector: string): Promise<SugarElement<HTMLElement>> =>
  FocusTools.pTryOnSelector(`Focus should be on: ${label}`, SugarDocument.getDocument(), selector);

export {
  pAssertFocusOnItem
};
