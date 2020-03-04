/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement } from '@ephox/dom-globals';

const trimPx = function (value: string) {
  return value.replace(/px$/, '');
};

const addPx = function (value: string) {
  return /^[0-9.]+$/.test(value) ? (value + 'px') : value;
};

const getSize = function (name: string) {
  return function (elm: HTMLElement): string {
    return elm ? trimPx(elm.style[name]) : '';
  };
};

const setSize = function (name: string) {
  return function (elm: HTMLElement, value: string) {
    if (elm) {
      elm.style[name] = addPx(value);
    }
  };
};

const getMaxWidth = getSize('maxWidth');
const getMaxHeight = getSize('maxHeight');
const setMaxWidth = setSize('maxWidth');
const setMaxHeight = setSize('maxHeight');

export {
  getMaxWidth,
  getMaxHeight,
  setMaxWidth,
  setMaxHeight
};
