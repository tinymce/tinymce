/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Option, Options } from '@ephox/katamari';

import { LinkDialogCatalog, LinkDialogData, LinkDialogUrlData, ListItem, ListValue } from './DialogTypes';

export interface DialogDelta {
  url: LinkDialogUrlData;
  text: string;
}

const findTextByValue = (value: string, catalog: ListItem[]): Option<ListValue> => Arr.findMap(catalog, (item) =>
// TODO TINY-2236 re-enable this (support will need to be added to bridge)
// return 'items' in item ? findTextByValue(value, item.items) :
  Options.someIf(item.value === value, item)
);

const getDelta = (persistentText: string, fieldName: string, catalog: ListItem[], data: Partial<LinkDialogData>): Option<DialogDelta> => {
  const value = data[fieldName];
  const hasPersistentText = persistentText.length > 0;
  return value !== undefined ? findTextByValue(value, catalog).map((i) => ({
    url: {
      value: i.value,
      meta: {
        text: hasPersistentText ? persistentText : i.text,
        attach: Fun.noop
      }
    },
    text: hasPersistentText ? persistentText : i.text
  })) : Option.none();
};

const findCatalog = (catalogs: LinkDialogCatalog, fieldName: string): Option<ListItem[]> => {
  if (fieldName === 'link') {
    return catalogs.link;
  } else if (fieldName === 'anchor') {
    return catalogs.anchor;
  } else {
    return Option.none();
  }
};

const init = (initialData: LinkDialogData, linkCatalog: LinkDialogCatalog) => {
  const persistentData = {
    text: initialData.text,
    title: initialData.title
  };

  const getTitleFromUrlChange = (url: LinkDialogUrlData): Option<string> =>
    Options.someIf(persistentData.title.length <= 0, Option.from(url.meta.title).getOr(''));

  const getTextFromUrlChange = (url: LinkDialogUrlData): Option<string> =>
    Options.someIf(persistentData.text.length <= 0, Option.from(url.meta.text).getOr(url.value));

  const onUrlChange = (data: LinkDialogData): Option<Partial<LinkDialogData>> => {
    const text = getTextFromUrlChange(data.url);
    const title = getTitleFromUrlChange(data.url);
    // We are going to change the text/title because it has not been manually entered by the user.
    if (text.isSome() || title.isSome()) {
      return Option.some({
        ...text.map((text) => ({ text })).getOr({ }),
        ...title.map((title) => ({ title })).getOr({ })
      });
    } else {
      return Option.none();
    }
  };

  const onCatalogChange = (data: LinkDialogData, change: { name: string }): Option<Partial<LinkDialogData>> => {
    const catalog = findCatalog(linkCatalog, change.name).getOr([ ]);
    return getDelta(persistentData.text, change.name, catalog, data);
  };

  const onChange = (getData: () => LinkDialogData, change: { name: string }): Option<Partial<LinkDialogData>> => {
    const name = change.name;
    if (name === 'url') {
      return onUrlChange(getData());
    } else if (Arr.contains([ 'anchor', 'link' ], name)) {
      return onCatalogChange(getData(), change);
    } else if (name === 'text' || name === 'title') {
      // Update the persistent text/title state, as a user has input custom text
      persistentData[name] = getData()[name];
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
