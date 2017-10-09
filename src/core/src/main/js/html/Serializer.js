/**
 * Serializer.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is used to serialize down the DOM tree into a string using a Writer instance.
 *
 *
 * @example
 * new tinymce.html.Serializer().serialize(new tinymce.html.DomParser().parse('<p>text</p>'));
 * @class tinymce.html.Serializer
 * @version 3.4
 */
define(
  'tinymce.core.html.Serializer',
  [
    "tinymce.core.html.Writer",
    "tinymce.core.html.Schema"
  ],
  function (Writer, Schema) {
    /**
     * Constructs a new Serializer instance.
     *
     * @constructor
     * @method Serializer
     * @param {Object} settings Name/value settings object.
     * @param {tinymce.html.Schema} schema Schema instance to use.
     */
    return function (settings, schema) {
      var self = this, writer = new Writer(settings);

      settings = settings || {};
      settings.validate = "validate" in settings ? settings.validate : true;

      self.schema = schema = schema || new Schema();
      self.writer = writer;

      /**
       * Serializes the specified node into a string.
       *
       * @example
       * new tinymce.html.Serializer().serialize(new tinymce.html.DomParser().parse('<p>text</p>'));
       * @method serialize
       * @param {tinymce.html.Node} node Node instance to serialize.
       * @return {String} String with HTML based on DOM tree.
       */
      self.serialize = function (node) {
        var handlers, validate;

        validate = settings.validate;

        handlers = {
          // #text
          3: function (node) {
            writer.text(node.value, node.raw);
          },

          // #comment
          8: function (node) {
            writer.comment(node.value);
          },

          // Processing instruction
          7: function (node) {
            writer.pi(node.name, node.value);
          },

          // Doctype
          10: function (node) {
            writer.doctype(node.value);
          },

          // CDATA
          4: function (node) {
            writer.cdata(node.value);
          },

          // Document fragment
          11: function (node) {
            if ((node = node.firstChild)) {
              do {
                walk(node);
              } while ((node = node.next));
            }
          }
        };

        writer.reset();

        var walk = function (node) {
          var handler = handlers[node.type], name, isEmpty, attrs, attrName, attrValue, sortedAttrs, i, l, elementRule;

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
        if (node.type == 1 && !settings.inner) {
          walk(node);
        } else {
          handlers[11](node);
        }

        return writer.getContent();
      };
    };
  }
);
