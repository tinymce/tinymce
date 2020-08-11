/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, HTMLAnchorElement } from '@ephox/dom-globals';

const namedAnchorSelector = 'a:not([href])';

const isEmptyString = (str: string): boolean => !str;

const getIdFromAnchor = (elm: HTMLAnchorElement): string => {
  const id = elm.getAttribute('id') || elm.getAttribute('name');
  return id || '';
};

const isAnchor = (elm: Node): elm is HTMLAnchorElement =>
  elm && elm.nodeName.toLowerCase() === 'a';

const isNamedAnchor = (elm: Node): elm is HTMLAnchorElement =>
  isAnchor(elm) && !elm.getAttribute('href') && getIdFromAnchor(elm) !== '';

const isEmptyNamedAnchor = (elm: Node): elm is HTMLAnchorElement =>
  isNamedAnchor(elm) && !elm.firstChild;

export {
  namedAnchorSelector,
  isEmptyString,
  getIdFromAnchor,
  isNamedAnchor,
  isEmptyNamedAnchor
};
