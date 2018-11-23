/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Writer from './Writer';
import Schema from './Schema';
import Node from './Node';

/**
 * This class is used to serialize down the DOM tree into a string using a Writer instance.
 *
 *
 * @example
 * new tinymce.html.Serializer().serialize(new tinymce.html.DomParser().parse('<p>text</p>'));
 * @class tinymce.html.Serializer
 * @version 3.4
 */

export default function (settings?, schema = Schema()) {
  const writer = Writer(settings);

  settings = settings || {};
  settings.validate = 'validate' in settings ? settings.validate : true;

  /**
   * Serializes the specified node into a string.
   *
   * @example
   * new tinymce.html.Serializer().serialize(new tinymce.html.DomParser().parse('<p>text</p>'));
   * @method serialize
   * @param {tinymce.html.Node} node Node instance to serialize.
   * @return {String} String with HTML based on DOM tree.
   */
  const serialize = (node: Node) => {
    let handlers, validate;

    validate = settings.validate;

    handlers = {
      // #text
      3 (node) {
        writer.text(node.value, node.raw);
      },

      // #comment
      8 (node) {
        writer.comment(node.value);
      },

      // Processing instruction
      7 (node) {
        writer.pi(node.name, node.value);
      },

      // Doctype
      10 (node) {
        writer.doctype(node.value);
      },

      // CDATA
      4 (node) {
        writer.cdata(node.value);
      },

      // Document fragment
      11 (node) {
        if ((node = node.firstChild)) {
          do {
            walk(node);
          } while ((node = node.next));
        }
      }
    };

    writer.reset();

    const walk = function (node: Node) {
      const handler = handlers[node.type];
      let  name, isEmpty, attrs, attrName, attrValue, sortedAttrs, i, l, elementRule;

      if (!handler) {
        name = node.name;
        isEmpty = node.shortEnded;
        attrs = node.attributes;

        // Sort attributes
        if (validate && attrs && attrs.length > 1) {
          sortedAttrs = [];
          sortedAttrs.map = {};

          elementRule = schema.getElementRule(node.name);
          if (elementRule) {
            for (i = 0, l = elementRule.attributesOrder.length; i < l; i++) {
              attrName = elementRule.attributesOrder[i];

              if (attrName in attrs.map) {
                attrValue = attrs.map[attrName];
                sortedAttrs.map[attrName] = attrValue;
                sortedAttrs.push({ name: attrName, value: attrValue });
              }
            }

            for (i = 0, l = attrs.length; i < l; i++) {
              attrName = attrs[i].name;

              if (!(attrName in sortedAttrs.map)) {
                attrValue = attrs.map[attrName];
                sortedAttrs.map[attrName] = attrValue;
                sortedAttrs.push({ name: attrName, value: attrValue });
              }
            }

            attrs = sortedAttrs;
          }
        }

        writer.start(node.name, attrs, isEmpty);

        if (!isEmpty) {
          if ((node = node.firstChild)) {
            do {
              walk(node);
            } while ((node = node.next));
          }

          writer.end(name);
        }
      } else {
        handler(node);
      }
    };

    // Serialize element and treat all non elements as fragments
    if (node.type === 1 && !settings.inner) {
      walk(node);
    } else {
      handlers[11](node);
    }

    return writer.getContent();
  };

  return {
    serialize
  };
}