import { Arr } from '@ephox/katamari';

export interface SelectorFormatItem {
  readonly title: string;
  readonly format: string;
}

export interface SelectorMenuItem {
  readonly title: string;
  readonly items: SelectorFormatItem[];
}

export interface SelectorModel {
  readonly addItemToGroup: (groupTitle: string, itemInfo: SelectorFormatItem) => void;
  readonly addItem: (itemInfo: SelectorFormatItem) => void;
  readonly toFormats: () => Array<SelectorMenuItem | SelectorFormatItem>;
}

const generate = (): SelectorModel => {
  const ungroupedOrder: SelectorFormatItem[] = [ ];
  const groupOrder: string[] = [ ];

  const groups: Record<string, SelectorFormatItem[]> = { };

  const addItemToGroup = (groupTitle: string, itemInfo: SelectorFormatItem) => {
    if (groups[groupTitle]) {
      groups[groupTitle].push(itemInfo);
    } else {
      groupOrder.push(groupTitle);
      groups[groupTitle] = [ itemInfo ];
    }
  };

  const addItem = (itemInfo: SelectorFormatItem) => {
    ungroupedOrder.push(itemInfo);
  };

  const toFormats = (): Array<SelectorMenuItem | SelectorFormatItem> => {
    const groupItems = Arr.bind(groupOrder, (g): Array<SelectorMenuItem | SelectorFormatItem> => {
      const items = groups[g];
      return items.length === 0 ? [ ] : [{
        title: g,
        items
      }];
    });

    return groupItems.concat(ungroupedOrder);
  };

  return {
    addItemToGroup,
    addItem,
    toFormats
  };
};

export {
  generate
};
