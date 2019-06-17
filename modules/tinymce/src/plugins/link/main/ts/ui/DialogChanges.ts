/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Cell, Option, Options, Fun } from '@ephox/katamari';

import { LinkDialogData, LinkDialogInfo, ListItem, ListValue, LinkDialogUrlData } from './DialogTypes';

export interface DialogDelta {
  url: LinkDialogUrlData;
  text: string;
}

const findTextByValue = (value: string, catalog: ListItem[]): Option<ListValue> => {
  return Options.findMap(catalog, (item) => {
    // TODO TINY-2236 re-enable this (support will need to be added to bridge)
    // return 'items' in item ? findTextByValue(value, item.items) :
     return Option.some(item).filter((i) => i.value === value);
  });
};
const getDelta = (persistentText: string, fieldName: string, catalog: ListItem[], data: Partial<LinkDialogData>): Option<DialogDelta> => {
  const value = data[fieldName];
  const hasPersistentText = persistentText.length > 0;
  return value !== undefined ? findTextByValue(value, catalog).map((i) => {
    return {
      url: {
        value: i.value,
        meta: {
          text: hasPersistentText ? persistentText : i.text,
          attach: Fun.noop
        }
      },
      text: hasPersistentText ? persistentText : i.text
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
  const persistentText = Cell(initialData.text);

  const onUrlChange = (data: LinkDialogData) => {
    // We are going to change the text, because it has not been manually entered by the user.
    if (persistentText.get().length <= 0) {
      const urlText = data.url.meta.text !== undefined ? data.url.meta.text : data.url.value;
      return Option.some({
        text: urlText
      });
    } else {
      return Option.none();
    }

  };

  const onCatalogChange = (data: LinkDialogData, change: { name: string }): Option<Partial<LinkDialogData>> => {
    const catalog = findCatalog(linkSettings, change.name).getOr([ ]);
    return getDelta(persistentText.get(), change.name, catalog, data);
  };

  const onChange = (getData: () => LinkDialogData, change: { name: string }): Option<Partial<LinkDialogData>> => {
    if (change.name === 'url') {
      return onUrlChange(getData());
    } else if (Arr.contains([ 'anchor', 'link' ], change.name)) {
      return onCatalogChange(getData(), change);
    } else if (change.name === 'text') {
      // Update the persistent text state, as a user has input custom text
      persistentText.set(getData().text);
      return Option.none();
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