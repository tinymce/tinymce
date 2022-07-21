import { Arr, Obj, Strings, Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import Tools from '../api/util/Tools';
import * as Bookmarks from '../bookmark/Bookmarks';
import * as NodeType from './NodeType';

const internalAttributesPrefixes = [
  'data-ephox-',
  'data-mce-',
  'data-alloy-',
  'data-snooker-',
  '_'
];

/**
 * Utility class for various element specific functions.
 *
 * @private
 * @class tinymce.dom.ElementUtils
 */

const each = Tools.each;

export interface ElementUtils {
  readonly compare: (node1: Node, node2: Node) => boolean;
  readonly isAttributeInternal: (attribute: string) => boolean;
}

const ElementUtils = (editor: Editor): ElementUtils => {
  const dom = editor.dom;
  const internalAttributes = new Set<string>(editor.serializer.getTempAttrs());

  /**
   * Compares two nodes and checks if it's attributes and styles matches.
   * This doesn't compare classes as items since their order is significant.
   *
   * @method compare
   * @param {Node} node1 First node to compare with.
   * @param {Node} node2 Second node to compare with.
   * @return {Boolean} True/false if the nodes are the same or not.
   */
  const compare = (node1: Node, node2: Node) => {
    // Not the same name or type
    if (node1.nodeName !== node2.nodeName || node1.nodeType !== node2.nodeType) {
      return false;
    }

    /**
     * Returns all the nodes attributes excluding internal ones, styles and classes.
     *
     * @private
     * @param {Node} node Node to get attributes from.
     * @return {Object} Name/value object with attributes and attribute values.
     */
    const getAttribs = (node: Element) => {
      const attribs: Record<string, string> = {};

      each(dom.getAttribs(node), (attr) => {
        const name = attr.nodeName.toLowerCase();

        // Don't compare internal attributes or style
        if (name !== 'style' && !isAttributeInternal(name)) {
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
     * @return {Boolean} True/false if the objects matches or not.
     */
    const compareObjects = (obj1: Record<string, string>, obj2: Record<string, string>) => {
      for (const name in obj1) {
        // Obj1 has item obj2 doesn't have
        if (Obj.has(obj1, name)) {
          const value = obj2[name];

          // Obj2 doesn't have obj1 item
          if (Type.isUndefined(value)) {
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
      for (const name in obj2) {
        // Obj2 has item obj1 doesn't have
        if (Obj.has(obj2, name)) {
          return false;
        }
      }

      return true;
    };

    if (NodeType.isElement(node1) && NodeType.isElement(node2)) {
      // Attribs are not the same
      if (!compareObjects(getAttribs(node1), getAttribs(node2))) {
        return false;
      }

      // Styles are not the same
      if (!compareObjects(dom.parseStyle(dom.getAttrib(node1, 'style')), dom.parseStyle(dom.getAttrib(node2, 'style')))) {
        return false;
      }
    }

    return !Bookmarks.isBookmarkNode(node1) && !Bookmarks.isBookmarkNode(node2);
  };

  const isAttributeInternal = (attributeName: string): boolean =>
    Arr.exists(internalAttributesPrefixes, (value) => Strings.startsWith(attributeName, value)) || internalAttributes.has(attributeName);

  return {
    compare,
    isAttributeInternal
  };
};

export default ElementUtils;
