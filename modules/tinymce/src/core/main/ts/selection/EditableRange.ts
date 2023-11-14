import DOMUtils from '../api/dom/DOMUtils';

export const isEditableRange = (dom: DOMUtils, rng: Range | StaticRange): boolean => {
  if (rng.collapsed) {
    return dom.isEditable(rng.startContainer);
  } else {
    return dom.isEditable(rng.startContainer) && dom.isEditable(rng.endContainer);
  }
};
