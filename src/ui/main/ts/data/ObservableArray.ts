/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Observable from 'tinymce/core/api/util/Observable';
import Class from 'tinymce/core/api/util/Class';

/**
 * This class is an array that emmits events when mutation occurs.
 *
 * @private
 * @class tinymce.data.ObservableArray
 */

const push = Array.prototype.push, slice = Array.prototype.slice, splice = Array.prototype.splice;

const ObservableArray = Class.extend({
  Mixins: [Observable],

  /**
   * Number of items in array.
   *
   * @field length
   * @type Number
   */
  length: 0,

  /**
   * Constructs a new observable object instance.
   *
   * @constructor
   * @param {Object} data Optional initial data for the object.
   */
  init (data) {
    if (data) {
      this.push.apply(this, data);
    }
  },

  /**
   * Adds items to the end of array.
   *
   * @method push
   * @param {Object} item... Item or items to add to the end of array.
   * @return {Number} Number of items that got added.
   */
  push () {
    let args;
    const index = this.length;

    args = Array.prototype.slice.call(arguments);
    push.apply(this, args);

    this.fire('add', {
      items: args,
      index
    });

    return args.length;
  },

  /**
   * Pops the last item off the array.
   *
   * @method pop
   * @return {Object} Item that got popped out.
   */
  pop () {
    return this.splice(this.length - 1, 1)[0];
  },

  /**
   * Slices out a portion of the array as a new array.
   *
   * @method slice
   * @param {Number} begin Beginning of slice.
   * @param {Number} end End of slice.
   * @return {Array} Native array instance with items.
   */
  slice (begin, end) {
    return slice.call(this, begin, end);
  },

  /**
   * Removes/replaces/inserts items in the array.
   *
   * @method splice
   * @param {Number} index Index to splice at.
   * @param {Number} howMany Optional number of items to splice away.
   * @param {Object} item ... Item or items to insert at the specified index.
   */
  splice (index) {
    let added, removed;
    const args = slice.call(arguments);

    if (args.length === 1) {
      args[1] = this.length;
    }

    removed = splice.apply(this, args);
    added = args.slice(2);

    if (removed.length > 0) {
      this.fire('remove', { items: removed, index });
    }

    if (added.length > 0) {
      this.fire('add', { items: added, index });
    }

    return removed;
  },

  /**
   * Removes and returns the first item of the array.
   *
   * @method shift
   * @return {Object} First item of the array.
   */
  shift () {
    return this.splice(0, 1)[0];
  },

  /**
   * Appends an item to the top of array.
   *
   * @method unshift
   * @param {Object} item... Item or items to prepend to array.
   * @return {Number} Number of items that got added.
   */
  unshift () {
    const args = slice.call(arguments);
    this.splice.apply(this, [0, 0].concat(args));
    return args.length;
  },

  /**
   * Executes the callback for each item in the array.
   *
   * @method forEach
   * @param {function} callback Callback to execute for each item in array.
   * @param {Object} scope Optional scope for this when executing the callback.
   */
  forEach (callback, scope) {
    let i;

    scope = scope || this;
    for (i = 0; i < this.length; i++) {
      callback.call(scope, this[i], i, this);
    }
  },

  /**
   * Returns the index of the specified item or -1 if it wasn't found.
   *
   * @method indexOf
   * @return {Number} Index of item or null if it wasn't found.
   */
  indexOf (item) {
    for (let i = 0; i < this.length; i++) {
      if (this[i] === item) {
        return i;
      }
    }

    return -1;
  },

  /**
   * Filters the observable array into a new observable array
   * based on the true/false return value of the specified callback.
   *
   * @method filter
   * @param {function} callback Callback function to execute for each item and filter by.
   * @param {Object} thisArg Optional scope for this when executing the callback.
   * @return {tinymce.data.ObservableArray} Filtered observable array instance.
   */
  filter (callback, thisArg) {
    const self = this, out = new ObservableArray();

    this.forEach(function (item, index) {
      if (callback.call(thisArg || self, item, index, self)) {
        out.push(item);
      }
    });

    return out;
  }
});

export default ObservableArray;