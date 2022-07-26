import { EntityEncoding } from '../OptionTypes';
import Tools from '../util/Tools';
import Entities from './Entities';

/**
 * This class is used to write HTML tags out it can be used with the Serializer.
 *
 * @class tinymce.html.Writer
 * @version 3.4
 * @example
 * const writer = tinymce.html.Writer({ indent: true });
 * writer.start('node', { attr: 'value' });
 * writer.end('node');
 * console.log(writer.getContent());
 */

const makeMap = Tools.makeMap;

export interface WriterSettings {
  element_format?: 'xhtml' | 'html';
  entities?: string;
  entity_encoding?: EntityEncoding;
  indent?: boolean;
  indent_after?: string;
  indent_before?: string;
}

type Attributes = Array<{ name: string; value: string }>;

interface Writer {
  cdata: (text: string) => void;
  comment: (text: string) => void;
  doctype: (text: string) => void;
  end: (name: string) => void;
  getContent: () => string;
  pi: (name: string, text?: string) => void;
  reset: () => void;
  start: (name: string, attrs?: Attributes | null, empty?: boolean) => void;
  text: (text: string, raw?: boolean) => void;
}

const Writer = (settings?: WriterSettings): Writer => {
  const html: string[] = [];

  settings = settings || {};
  const indent = settings.indent;
  const indentBefore = makeMap(settings.indent_before || '');
  const indentAfter = makeMap(settings.indent_after || '');
  const encode = Entities.getEncodeFunc(settings.entity_encoding || 'raw', settings.entities);
  const htmlOutput = settings.element_format !== 'xhtml';

  return {
    /**
     * Writes a start element, such as `<p id="a">`.
     *
     * @method start
     * @param {String} name Name of the element.
     * @param {Array} attrs Optional array of objects containing an attribute name and value, or undefined if the element has no attributes.
     * @param {Boolean} empty Optional empty state if the tag should serialize as a void element. For example: `<img />`
     */
    start: (name: string, attrs?: Attributes | null, empty?: boolean) => {
      if (indent && indentBefore[name] && html.length > 0) {
        const value = html[html.length - 1];

        if (value.length > 0 && value !== '\n') {
          html.push('\n');
        }
      }

      html.push('<', name);

      if (attrs) {
        for (let i = 0, l = attrs.length; i < l; i++) {
          const attr = attrs[i];
          html.push(' ', attr.name, '="', encode(attr.value, true), '"');
        }
      }

      if (!empty || htmlOutput) {
        html[html.length] = '>';
      } else {
        html[html.length] = ' />';
      }

      if (empty && indent && indentAfter[name] && html.length > 0) {
        const value = html[html.length - 1];

        if (value.length > 0 && value !== '\n') {
          html.push('\n');
        }
      }
    },

    /**
     * Writes an end element, such as `</p>`.
     *
     * @method end
     * @param {String} name Name of the element.
     */
    end: (name: string) => {
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
     * @param {Boolean} raw Optional raw state. If true, the contents won't get encoded.
     */
    text: (text: string, raw?: boolean) => {
      if (text.length > 0) {
        html[html.length] = raw ? text : encode(text);
      }
    },

    /**
     * Writes a cdata node, such as `<![CDATA[data]]>`.
     *
     * @method cdata
     * @param {String} text String to write out inside the cdata.
     */
    cdata: (text: string) => {
      html.push('<![CDATA[', text, ']]>');
    },

    /**
     * Writes a comment node, such as `<!-- Comment -->`.
     *
     * @method comment
     * @param {String} text String to write out inside the comment.
     */
    comment: (text: string) => {
      html.push('<!--', text, '-->');
    },

    /**
     * Writes a processing instruction (PI) node, such as `<?xml attr="value" ?>`.
     *
     * @method pi
     * @param {String} name Name of the pi.
     * @param {String} text String to write out inside the pi.
     */
    pi: (name: string, text?: string) => {
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
     * Writes a doctype node, such as `<!DOCTYPE data>`.
     *
     * @method doctype
     * @param {String} text String to write out inside the doctype.
     */
    doctype: (text: string) => {
      html.push('<!DOCTYPE', text, '>', indent ? '\n' : '');
    },

    /**
     * Resets the internal buffer. For example, if one wants to reuse the writer.
     *
     * @method reset
     */
    reset: () => {
      html.length = 0;
    },

    /**
     * Returns the contents that was serialized.
     *
     * @method getContent
     * @return {String} HTML contents that got written down.
     */
    getContent: (): string => {
      return html.join('').replace(/\n$/, '');
    }
  };
};

export default Writer;
