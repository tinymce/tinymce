/**
 * LocalStorage.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class will simulate LocalStorage on IE 7 and return the native version on modern browsers.
 * Storage is done using userData on IE 7 and a special serialization format. The format is designed
 * to be as small as possible by making sure that the keys and values doesn't need to be encoded. This
 * makes it possible to store for example HTML data.
 *
 * Storage format for userData:
 * <base 32 key length>,<key string>,<base 32 value length>,<value>,...
 *
 * For example this data key1=value1,key2=value2 would be:
 * 4,key1,6,value1,4,key2,6,value2
 *
 * @class tinymce.util.LocalStorage
 * @static
 * @version 4.0
 * @example
 * tinymce.util.LocalStorage.setItem('key', 'value');
 * var value = tinymce.util.LocalStorage.getItem('key');
 */

const localStorage = window.localStorage;

export default localStorage;
