/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLAnchorElement } from '@ephox/dom-globals';
import { Option, Arr } from '@ephox/katamari';
import { ListValue } from '../DialogTypes';

// NOTE: you currently need anchors in the content for this field to appear

const getAnchors = (editor): Option<ListValue[]> => {
  const anchorNodes = editor.dom.select('a:not([href])');
  const anchors = Arr.bind(anchorNodes, function (anchor: HTMLAnchorElement) {
    const id = anchor.name || anchor.id;
    return id ? [{ text: id, value: '#' + id }] : [ ];
  });

  return anchors.length > 0 ? Option.some([{ text: 'None', value: '' }].concat(anchors)) : Option.none();
};

export const AnchorListOptions = {
  getAnchors
};
