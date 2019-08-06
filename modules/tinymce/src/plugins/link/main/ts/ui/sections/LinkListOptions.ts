/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Settings from '../../api/Settings';
import { Future, Option, Type } from '@ephox/katamari';
import XHR from 'tinymce/core/api/util/XHR';
import { ListItem } from '../DialogTypes';
import { ListOptions } from '../../core/ListOptions';

const parseJson = (text: string): Option<ListItem[]> => {
  // Do some proper modelling.
  try {
    return Option.some(JSON.parse(text));
  } catch (err) {
    return Option.none();
  }
};

const getLinks = (editor): Future<Option<ListItem[]>> => {
  const extractor = (item) => editor.convertURL(item.value || item.url, 'href');

  const linkList = Settings.getLinkList(editor);
  return Future.nu<Option<ListItem[]>>((callback) => {
    // TODO - better handling of failure
    if (Type.isString(linkList)) {
      XHR.send({
        url: linkList,
        success: (text) => callback(parseJson(text)),
        error: (_) => callback(Option.none())
      });
    } else if (Type.isFunction(linkList)) {
      linkList((output) => callback(Option.some(output)));
    } else {
      callback(Option.from(linkList as ListItem[]));
    }
  }).map((optItems) => {
    return optItems.bind(ListOptions.sanitizeWith(extractor)).map((items) => {
      if (items.length > 0) {
        return [{ text: 'None', value: '' }].concat(items);
      } else {
        return items;
      }
    });
  });
};

export const LinkListOptions = {
  getLinks
};
