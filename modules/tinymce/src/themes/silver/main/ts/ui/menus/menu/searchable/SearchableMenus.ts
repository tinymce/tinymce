import { ItemTypes } from '@ephox/alloy';
import { Id } from '@ephox/katamari';

export const searchResultsClass = 'tox-collection--results__js';

// NOTE: this is operating on the the final AlloySpec
export const augmentWithAria = (item: ItemTypes.ItemSpec): ItemTypes.ItemSpec => {
  if (item.dom) {
    return {
      ...item,
      dom: {
        ...item.dom,
        attributes: {
          ...item.dom.attributes ?? { },
          'id': Id.generate('aria-item-search-result-id'),
          'aria-selected': 'false'
        }
      }
    };
  } else {
    return item;
  }
};