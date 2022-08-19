import { Arr, Fun, Obj, Optional, Optionals } from '@ephox/katamari';

import { LinkDialogCatalog, LinkDialogData, LinkDialogUrlData, ListGroup, ListItem, ListValue } from './DialogTypes';

export interface DialogDelta {
  readonly url: LinkDialogUrlData;
  readonly text: string;
}

export interface DialogChanges {
  readonly onChange: (getData: () => LinkDialogData, change: { name: string }) => Optional<Partial<LinkDialogData>>;
}

const isListGroup = (item: ListItem): item is ListGroup =>
  Obj.hasNonNullableKey(item as Record<string, any>, 'items');

const findTextByValue = (value: string, catalog: ListItem[]): Optional<ListValue> =>
  Arr.findMap(catalog, (item) => {
    if (isListGroup(item)) {
      return findTextByValue(value, item.items);
    } else {
      return Optionals.someIf(item.value === value, item);
    }
  });

const getDelta = (persistentText: string, fieldName: 'link' | 'anchor', catalog: ListItem[], data: Partial<LinkDialogData>): Optional<DialogDelta> => {
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
  })) : Optional.none();
};

const findCatalog = (catalogs: LinkDialogCatalog, fieldName: string): Optional<ListItem[]> => {
  if (fieldName === 'link') {
    return catalogs.link;
  } else if (fieldName === 'anchor') {
    return catalogs.anchor;
  } else {
    return Optional.none();
  }
};

const init = (initialData: LinkDialogData, linkCatalog: LinkDialogCatalog): DialogChanges => {
  const persistentData = {
    text: initialData.text,
    title: initialData.title
  };

  const getTitleFromUrlChange = (url: LinkDialogUrlData): Optional<string> =>
    Optionals.someIf(persistentData.title.length <= 0, Optional.from(url.meta?.title).getOr(''));

  const getTextFromUrlChange = (url: LinkDialogUrlData): Optional<string> =>
    Optionals.someIf(persistentData.text.length <= 0, Optional.from(url.meta?.text).getOr(url.value));

  const onUrlChange = (data: LinkDialogData): Optional<Partial<LinkDialogData>> => {
    const text = getTextFromUrlChange(data.url);
    const title = getTitleFromUrlChange(data.url);
    // We are going to change the text/title because it has not been manually entered by the user.
    if (text.isSome() || title.isSome()) {
      return Optional.some({
        ...text.map((text) => ({ text })).getOr({ }),
        ...title.map((title) => ({ title })).getOr({ })
      });
    } else {
      return Optional.none();
    }
  };

  const onCatalogChange = (data: LinkDialogData, change: 'link' | 'anchor'): Optional<Partial<LinkDialogData>> => {
    const catalog = findCatalog(linkCatalog, change).getOr([ ]);
    return getDelta(persistentData.text, change, catalog, data);
  };

  const onChange = (getData: () => LinkDialogData, change: { name: string }): Optional<Partial<LinkDialogData>> => {
    const name = change.name;
    if (name === 'url') {
      return onUrlChange(getData());
    } else if (Arr.contains([ 'anchor', 'link' ], name)) {
      return onCatalogChange(getData(), name as 'anchor' | 'link');
    } else if (name === 'text' || name === 'title') {
      // Update the persistent text/title state, as a user has input custom text
      persistentData[name] = getData()[name];
      return Optional.none();
    } else {
      return Optional.none();
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
