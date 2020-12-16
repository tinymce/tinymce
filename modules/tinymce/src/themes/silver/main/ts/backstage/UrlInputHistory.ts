/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj, Type } from '@ephox/katamari';
import LocalStorage from 'tinymce/core/api/util/LocalStorage';

const STORAGE_KEY = 'tinymce-url-history';
const HISTORY_LENGTH = 5;

// validation functions
const isHttpUrl = (url: any): boolean => Type.isString(url) && /^https?/.test(url);

const isArrayOfUrl = (a: any): boolean => Type.isArray(a) && a.length <= HISTORY_LENGTH && Arr.forall(a, isHttpUrl);

const isRecordOfUrlArray = (r: any): boolean => Type.isObject(r) && Obj.find(r, (value) => !isArrayOfUrl(value)).isNone();

const getAllHistory = (): Record<string, string[]> => {
  const unparsedHistory = LocalStorage.getItem(STORAGE_KEY);
  if (unparsedHistory === null) {
    return {};
  }
  // parse history
  let history;
  try {
    history = JSON.parse(unparsedHistory);
  } catch (e) {
    if (e instanceof SyntaxError) {
      // eslint-disable-next-line no-console
      console.log('Local storage ' + STORAGE_KEY + ' was not valid JSON', e);
      return {};
    }
    throw e;
  }
  // validate the parsed value
  if (!isRecordOfUrlArray(history)) {
    // eslint-disable-next-line no-console
    console.log('Local storage ' + STORAGE_KEY + ' was not valid format', history);
    return {};
  }
  return history;
};

const setAllHistory = (history: Record<string, string[]>) => {
  if (!isRecordOfUrlArray(history)) {
    throw new Error('Bad format for history:\n' + JSON.stringify(history));
  }
  LocalStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

const getHistory = (fileType: string): string[] => {
  const history = getAllHistory();
  return Object.prototype.hasOwnProperty.call(history, fileType) ? history[fileType] : [];
};

const addToHistory = (url: string, fileType: string) => {
  if (!isHttpUrl(url)) {
    return;
  }
  const history = getAllHistory();
  const items = Object.prototype.hasOwnProperty.call(history, fileType) ? history[fileType] : [];
  const itemsWithoutUrl = Arr.filter(items, (item) => item !== url);
  history[fileType] = [ url ].concat(itemsWithoutUrl).slice(0, HISTORY_LENGTH);
  setAllHistory(history);
};

const clearHistory = () => {
  LocalStorage.removeItem(STORAGE_KEY);
};

export {
  getHistory,
  addToHistory,
  clearHistory
};
