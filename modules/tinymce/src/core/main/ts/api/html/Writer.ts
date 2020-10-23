/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from '../util/Tools';
import Entities from './Entities';
import { Attributes } from './Node';

/**
 * This class is used to write HTML tags out it can be used with the Serializer or the SaxParser.
 *
 * @class tinymce.html.Writer
 * @example
 * var writer = new tinymce.html.Writer({indent: true});
 * var parser = new tinymce.html.SaxParser(writer).parse('<p><br></p>');
 * console.log(writer.getContent());
 *
 * @class tinymce.html.Writer
 * @version 3.4
 */

const makeMap = Tools.makeMap;

export interface WriterSettings {
  element_format?: 'xhtml' | 'html';
  entities?: string;
  entity_encoding?: string;
  indent?: boolean;
  indent_after?: string;
  indent_before?: string;
}

interface Writer {
  cdata (text: string): void;
  comment (text: string): void;
  doctype (text: string): void;
  end (name: string): void;
  getContent (): string;
  pi (name: string, text: string): void;
  reset (): void;
  start (name: string, attrs?: Attributes, empty?: boolean): void;
  text (text: string, raw?: boolean): void;
}

const Writer = function (settings?: WriterSettings): Writer {
  const html = [];

  settings = settings || {};
  const indent = settings.indent;
  const indentBefore = makeMap(settings.indent_before || '');
  const indentAfter = makeMap(settings.indent_after || '');
  const encode = Entities.getEncodeFunc(settings.entity_encoding || 'raw', settings.entities);
  const htmlOutput = settings.element_format === 'html';

  return {
    /**
     * Writes the a start element such as <p id="a">.
     *
     * @method start
     * @param {String} name Name of the element.
     * @param {Array} attrs Optional attribute array or undefined if it hasn't any.
     * @param {Boolean} empty Optional empty state if the tag should end like <br />.
     */
    start(name: string, attrs?: Attributes, empty?: boolean) {
      let i, l, attr, value;

      if (indent && indentBefore[name] && html.length > 0) {
        value = html[html.length - 1];

        if (value.length > 0 && value !== '\n') {
          html.push('\n');
        }
      }

      html.push('<', name);

      if (attrs) {
        for (i = 0, l = attrs.length; i < l; i++) {
          attr = attrs[i];
          html.push(' ', attr.name, '="', encode(attr.value, true), '"');
        }
      }

      if (!empty || htmlOutput) {
        html[html.length] = '>';
      } else {
        html[html.length] = ' />';
      }

      if (empty && indent && indentAfter[name] && html.length > 0) {
        value = html[html.length - 1];

        if (value.length > 0 && value !== '\n') {
          html.push('\n');
        }
      }
    },

    /**
     * Writes the a end element such as </p>.
     *
     * @method end
     * @param {String} name Name of the element.
     */
    end(name: string) {
      let value;

      /* if (indent && indentBefore[name] && html.length > 0) {
        value = html[html.length - 1];

        if (value.length > 0 && value !== '\n')
          html.push('\n');
      }*/

      html.push('</', name, '>');

      if (indent && indentAfter[name] && html.length > 0) {
        value = html[html.length - 1];

        if (value.length > 0 && value !== '\n') {
          html.push('\n');
        }
      }
    },

    /**
     * Writes a text node.
     *
     * @method text
     * @param {String} text String to write out.
     * @param {Boolean} raw Optional raw state if true the contents wont get encoded.
     */
    text(text: string, raw?: boolean) {
      if (text.length > 0) {
        html[html.length] = raw ? text : encode(text);
      }
    },

    /**
     * Writes a cdata node such as <![CDATA[data]]>.
     *
     * @method cdata
     * @param {String} text String to write out inside the cdata.
     */
    cdata(text: string) {
      html.push('<![CDATA[', text, ']]>');
    },

    /**
     * Writes a comment node such as <!-- Comment -->.
     *
     * @method cdata
     * @param {String} text String to write out inside the comment.
     */
    comment(text: string) {
      html.push('<!--', text, '-->');
    },

    /**
     * Writes a PI node such as <?xml attr="value" ?>.
     *
     * @method pi
     * @param {String} name Name of the pi.
     * @param {String} text String to write out inside the pi.
     */
    pi(name: string, text: string) {
      if (text) {
        html.push('<?', name, ' ', encode(text), '?>');
      } else {
        html.push('<?', name, '?>');
      }

      if (indent) {
        html.push('\n');
      }
    },

    /**
     * Writes a doctype node such as <!DOCTYPE data>.
     *
     * @method doctype
     * @param {String} text String to write out inside the doctype.
     */
    doctype(text: string) {
      html.push('<!DOCTYPE', text, '>', indent ? '\n' : '');
    },

    /**
     * Resets the internal buffer if one wants to reuse the writer.
     *
     * @method reset
     */
    reset() {
      html.length = 0;
    },

    /**
     * Returns the contents that got serialized.
     *
     * @method getContent
     * @return {String} HTML contents that got written down.
     */
    getContent(): string {
      return html.join('').replace(/\n$/, '');
    }
  };
};

export default Writer;
