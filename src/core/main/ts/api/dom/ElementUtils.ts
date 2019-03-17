/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Attr } from '@ephox/dom-globals';
import Bookmarks from '../../bookmark/Bookmarks';
import Tools from '../util/Tools';
import DOMUtils from './DOMUtils';

/**
 * Utility class for various element specific functions.
 *
 * @private
 * @class tinymce.dom.ElementUtils
 */

const each = Tools.each;

const ElementUtils = function (dom: DOMUtils) {
  /**
   * Compares two nodes and checks if it's attributes and styles matches.
   * This doesn't compare classes as items since their order is significant.
   *
   * @method compare
   * @param {Node} node1 First node to compare with.
   * @param {Node} node2 Second node to compare with.
   * @return {boolean} True/false if the nodes are the same or not.
   */
  this.compare = function (node1, node2) {
    // Not the same name
    if (node1.nodeName !== node2.nodeName) {
      return false;
    }

    /**
     * Returns all the nodes attributes excluding internal ones, styles and classes.
     *
     * @private
     * @param {Node} node Node to get attributes from.
     * @return {Object} Name/value object with attributes and attribute values.
     */
    const getAttribs = function (node) {
      const attribs = {};

      each(dom.getAttribs(node), function (attr: Attr) {
        const name = attr.nodeName.toLowerCase();

        // Don't compare internal attributes or style
        if (name.indexOf('_') !== 0 && name !== 'style' && name.indexOf('data-') !== 0) {
          attribs[name] = dom.getAttrib(node, name);
        }
      });

      return attribs;
    };

    /**
     * Compares two objects checks if it's key + value exists in the other one.
     *
     * @private
     * @param {Object} obj1 First object to compare.
     * @param {Object} obj2 Second object to compare.
     * @return {boolean} True/false if the objects matches or not.
     */
    const compareObjects = function (obj1, obj2) {
      let value, name;

      for (name in obj1) {
        // Obj1 has item obj2 doesn't have
        if (obj1.hasOwnProperty(name)) {
          value = obj2[name];

          // Obj2 doesn't have obj1 item
          if (typeof value === 'undefined') {
            return false;
          }

          // Obj2 item has a different value
          if (obj1[name] !== value) {
            return false;
          }

          // Delete similar value
          delete obj2[name];
        }
      }

      // Check if obj 2 has something obj 1 doesn't have
      for (name in obj2) {
        // Obj2 has item obj1 doesn't have
        if (obj2.hasOwnProperty(name)) {
          return false;
        }
      }

      return true;
    };

    // Attribs are not the same
    if (!compareObjects(getAttribs(node1), getAttribs(node2))) {
      return false;
    }

    // Styles are not the same
    if (!compareObjects(dom.parseStyle(dom.getAttrib(node1, 'style')), dom.parseStyle(dom.getAttrib(node2, 'style')))) {
      return false;
    }

    return !Bookmarks.isBookmarkNode(node1) && !Bookmarks.isBookmarkNode(node2);
  };
};

export default ElementUtils;