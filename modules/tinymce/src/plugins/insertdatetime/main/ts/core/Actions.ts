/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Settings from '../api/Settings';

const daysShort = 'Sun Mon Tue Wed Thu Fri Sat Sun'.split(' ');
const daysLong = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday Sunday'.split(' ');
const monthsShort = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
const monthsLong = 'January February March April May June July August September October November December'.split(' ');

const addZeros = function (value, len) {
  value = '' + value;

  if (value.length < len) {
    for (let i = 0; i < (len - value.length); i++) {
      value = '0' + value;
    }
  }

  return value;
};

const getDateTime = function (editor, fmt, date?) {
  date = date || new Date();

  fmt = fmt.replace('%D', '%m/%d/%Y');
  fmt = fmt.replace('%r', '%I:%M:%S %p');
  fmt = fmt.replace('%Y', '' + date.getFullYear());
  fmt = fmt.replace('%y', '' + date.getYear());
  fmt = fmt.replace('%m', addZeros(date.getMonth() + 1, 2));
  fmt = fmt.replace('%d', addZeros(date.getDate(), 2));
  fmt = fmt.replace('%H', '' + addZeros(date.getHours(), 2));
  fmt = fmt.replace('%M', '' + addZeros(date.getMinutes(), 2));
  fmt = fmt.replace('%S', '' + addZeros(date.getSeconds(), 2));
  fmt = fmt.replace('%I', '' + ((date.getHours() + 11) % 12 + 1));
  fmt = fmt.replace('%p', '' + (date.getHours() < 12 ? 'AM' : 'PM'));
  fmt = fmt.replace('%B', '' + editor.translate(monthsLong[date.getMonth()]));
  fmt = fmt.replace('%b', '' + editor.translate(monthsShort[date.getMonth()]));
  fmt = fmt.replace('%A', '' + editor.translate(daysLong[date.getDay()]));
  fmt = fmt.replace('%a', '' + editor.translate(daysShort[date.getDay()]));
  fmt = fmt.replace('%%', '%');

  return fmt;
};

const updateElement = function (editor, timeElm, computerTime, userTime) {
  const newTimeElm = editor.dom.create('time', { datetime: computerTime }, userTime);
  timeElm.parentNode.insertBefore(newTimeElm, timeElm);
  editor.dom.remove(timeElm);
  editor.selection.select(newTimeElm, true);
  editor.selection.collapse(false);
};

const insertDateTime = function (editor, format) {
  if (Settings.shouldInsertTimeElement(editor)) {
    const userTime = getDateTime(editor, format);
    let computerTime;

    if (/%[HMSIp]/.test(format)) {
      computerTime = getDateTime(editor, '%Y-%m-%dT%H:%M');
    } else {
      computerTime = getDateTime(editor, '%Y-%m-%d');
    }

    const timeElm = editor.dom.getParent(editor.selection.getStart(), 'time');

    if (timeElm) {
      updateElement(editor, timeElm, computerTime, userTime);
    } else {
      editor.insertContent('<time datetime="' + computerTime + '">' + userTime + '</time>');
    }
  } else {
    editor.insertContent(getDateTime(editor, format));
  }
};

export {
  insertDateTime,
  getDateTime
};
