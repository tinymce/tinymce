import { Arr, Cell, Option, Options, Fun } from '@ephox/katamari';

import { LinkDialogData, LinkDialogInfo, ListItem, ListValue } from './DialogTypes';

const findTextByValue = (value: string, catalog: ListItem[]): Option<ListValue> => {
  return Options.findMap(catalog, (item) => {
    return 'items' in item ? findTextByValue(value, item.items) :
      Option.some(item).filter((i) => i.value === value);
  });
};
const getDelta = (previousText: string, fieldName: string, catalog: ListItem[], data: Partial<LinkDialogData>): Option<{url, text: string}> => {
  const value = data[fieldName];
  const currentText = data.text;
  const shouldReplaceText = currentText === '' || previousText === currentText;
  return value !== undefined ? findTextByValue(value, catalog).map((i) => {
    return {
      url: {
        value: i.value,
        meta: {
          text: shouldReplaceText ? i.text : currentText,
          attach: Fun.noop
        }
      },
      text: shouldReplaceText ? i.text : currentText
    };
  }) : Option.none();
};

const findCatalog = (settings: LinkDialogInfo, fieldName: string): Option<ListItem[]> => {
  if (fieldName === 'link') {
    return settings.catalogs.link;
  } else if (fieldName === 'anchor') {
    return settings.catalogs.anchor;
  } else {
    return Option.none();
  }
};

const init = (initialData: LinkDialogData, linkSettings: LinkDialogInfo) => {
  const previousText = Cell(initialData.text);

  const onUrlChange = (data: LinkDialogData) => {
    // We are going to change the text, because it hasn't changed since our last update.
    if (data.text === previousText.get() || (data.text !== undefined && data.text.length === 0)) {
      const urlText = data.url.meta.text !== undefined ? data.url.meta.text : data.url.value;
      previousText.set(urlText);
      return Option.some({
        text: previousText.get()
      });
    } else {
      return Option.none();
    }

  };

  const onCatalogChange = (data: LinkDialogData, change: { name: string }): Option<Partial<LinkDialogData>> => {
    const catalog = findCatalog(linkSettings, change.name).getOr([ ]);
    const optDelta = getDelta(previousText.get(), change.name, catalog, data);
    optDelta.each((delta) => {
      previousText.set(delta.text);
    });
    return optDelta;
  };

  const onChange = (getData: () => LinkDialogData, change: { name: string }): Option<Partial<LinkDialogData>> => {
    if (change.name === 'url') {
      return onUrlChange(getData());
    } else if (Arr.contains([ 'anchor', 'link' ], change.name)) {
      return onCatalogChange(getData(), change);
    } else {
      return Option.none();
    }
  };

  return {
    onChange
  };
};

export const DialogChanges = {
  init,
  getDelta
};