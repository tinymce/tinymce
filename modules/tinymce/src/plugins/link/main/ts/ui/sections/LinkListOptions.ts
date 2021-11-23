/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import XHR from 'tinymce/core/api/util/XHR';

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
  const extractor = (item: UserListItem) => editor.convertURL(item.value || item.url, 'href');

  const linkList = Options.getLinkList(editor);
  return new Promise<Optional<UserListItem[]>>((callback) => {
    // TODO - better handling of failure
    if (Type.isString(linkList)) {
      XHR.send({
        url: linkList,
        success: (text) => callback(parseJson(text)),
        error: (_) => callback(Optional.none())
      });
    } else if (Type.isFunction(linkList)) {
      linkList((output) => callback(Optional.some(output)));
    } else {
      callback(Optional.from(linkList));
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
