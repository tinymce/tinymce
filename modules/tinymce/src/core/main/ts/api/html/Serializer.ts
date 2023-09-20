import { Type } from '@ephox/katamari';

import * as Namespace from '../../html/Namespace';
import AstNode, { Attributes } from './Node';
import Schema from './Schema';
import Writer, { WriterSettings } from './Writer';

export interface HtmlSerializerSettings extends WriterSettings {
  inner?: boolean;
  validate?: boolean;
}

interface HtmlSerializer {
  serialize: (node: AstNode) => string;
}

/**
 * This class is used to serialize down the DOM tree into a string using a Writer instance.
 *
 * @class tinymce.html.Serializer
 * @version 3.4
 * @example
 * tinymce.html.Serializer().serialize(tinymce.html.DomParser().parse('<p>text</p>'));
 */

const HtmlSerializer = (settings: HtmlSerializerSettings = {}, schema: Schema = Schema()): HtmlSerializer => {
  const writer = Writer(settings);

  settings.validate = 'validate' in settings ? settings.validate : true;

  /**
   * Serializes the specified node into a string.
   *
   * @method serialize
   * @param {tinymce.html.Node} node Node instance to serialize.
   * @return {String} String with HTML based on the DOM tree.
   * @example
   * tinymce.html.Serializer().serialize(tinymce.html.DomParser().parse('<p>text</p>'));
   */
  const serialize = (node: AstNode): string => {
    const validate = settings.validate;

    const handlers: Record<number, (node: AstNode) => void> = {
      // #text
      3: (node) => {
        writer.text(node.value ?? '', node.raw);
      },

      // #comment
      8: (node) => {
        writer.comment(node.value ?? '');
      },

      // Processing instruction
      7: (node) => {
        writer.pi(node.name, node.value);
      },

      // Doctype
      10: (node) => {
        writer.doctype(node.value ?? '');
      },

      // CDATA
      4: (node) => {
        writer.cdata(node.value ?? '');
      },

      // Document fragment
      11: (node) => {
        let tempNode: AstNode | null | undefined = node;
        if ((tempNode = tempNode.firstChild)) {
          do {
            walk(tempNode);
          } while ((tempNode = tempNode.next));
        }
      }
    };

    writer.reset();

    const walk = (node: AstNode) => {
      const handler = handlers[node.type];

      if (!handler) {
        const name = node.name;
        const isEmpty = name in schema.getVoidElements();
        let attrs = node.attributes;

        // Sort attributes
        if (validate && attrs && attrs.length > 1) {
          const sortedAttrs = [] as unknown as Attributes;
          (sortedAttrs as any).map = {};

          const elementRule = schema.getElementRule(node.name);
          if (elementRule) {
            for (let i = 0, l = elementRule.attributesOrder.length; i < l; i++) {
              const attrName: string = elementRule.attributesOrder[i];

              if (attrName in attrs.map) {
                const attrValue = attrs.map[attrName];
                sortedAttrs.map[attrName] = attrValue;
                sortedAttrs.push({ name: attrName, value: attrValue });
              }
            }

            for (let i = 0, l = attrs.length; i < l; i++) {
              const attrName: string = attrs[i].name;

              if (!(attrName in sortedAttrs.map)) {
                const attrValue = attrs.map[attrName];
                sortedAttrs.map[attrName] = attrValue;
                sortedAttrs.push({ name: attrName, value: attrValue });
              }
            }

            attrs = sortedAttrs;
          }
        }

        writer.start(name, attrs, isEmpty);

        if (Namespace.isNonHtmlElementRootName(name)) {
          if (Type.isString(node.value)) {
            writer.text(node.value, true);
          }

          writer.end(name);
        } else {
          if (!isEmpty) {
            let child = node.firstChild;
            if (child) {
              // Pre and textarea elements treat the first newline character as optional and will omit it. As such, if the content starts
              // with a newline we need to add in an additional newline to prevent the current newline in the value being treated as optional
              // See https://html.spec.whatwg.org/multipage/syntax.html#element-restrictions
              if ((name === 'pre' || name === 'textarea') && child.type === 3 && child.value?.[0] === '\n') {
                writer.text('\n', true);
              }

              do {
                walk(child);
              } while ((child = child.next));
            }

            writer.end(name);
          }
        }
      } else {
        handler(node);
      }
    };

    // Serialize element or text nodes and treat all other nodes as fragments
    if (node.type === 1 && !settings.inner) {
      walk(node);
    } else if (node.type === 3) {
      handlers[3](node);
    } else {
      handlers[11](node);
    }

    return writer.getContent();
  };

  return {
    serialize
  };
};

export default HtmlSerializer;

