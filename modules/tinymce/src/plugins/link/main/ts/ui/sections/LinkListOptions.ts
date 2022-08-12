import { Optional, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../../api/Options';
import { ListOptions } from '../../core/ListOptions';
import { ListItem, UserListItem } from '../DialogTypes';

const parseJson = (text: string): Optional<ListItem[]> => {
  // Do some proper modelling.
  try {
    return Optional.some(JSON.parse(text));
  } catch (err) {
    return Optional.none();
  }
};

const getLinks = (editor: Editor): Promise<Optional<ListItem[]>> => {
  const extractor = (item: UserListItem) => editor.convertURL(item.value || item.url || '', 'href');

  const linkList = Options.getLinkList(editor);
  return new Promise<Optional<UserListItem[]>>((resolve) => {
    // TODO - better handling of failure
    if (Type.isString(linkList)) {
      fetch(linkList)
        .then((res) => res.ok ? res.text().then(parseJson) : Promise.reject())
        .then(resolve, () => resolve(Optional.none()));
    } else if (Type.isFunction(linkList)) {
      linkList((output) => resolve(Optional.some(output)));
    } else {
      resolve(Optional.from(linkList));
    }
  }).then((optItems) => optItems.bind(ListOptions.sanitizeWith(extractor)).map((items) => {
    if (items.length > 0) {
      const noneItem: ListItem[] = [{ text: 'None', value: '' }];
      return noneItem.concat(items);
    } else {
      return items;
    }
  }));
};

export const LinkListOptions = {
  getLinks
};
