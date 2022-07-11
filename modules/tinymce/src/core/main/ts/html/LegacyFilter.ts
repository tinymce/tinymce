import { Arr, Strings } from '@ephox/katamari';

import DomParser, { DomParserSettings } from '../api/html/DomParser';
import AstNode from '../api/html/Node';
import Schema from '../api/html/Schema';
import Styles from '../api/html/Styles';
import Tools from '../api/util/Tools';

const removeAttrs = (node: AstNode, names: string[]): void => {
  Arr.each(names, (name) => {
    node.attr(name, null);
  });
};

const addFontToSpansFilter = (domParser: DomParser, styles: Styles, fontSizes: string[]): void => {
  domParser.addNodeFilter('font', (nodes) => {
    Arr.each(nodes, (node) => {
      const props = styles.parse(node.attr('style'));
      const color = node.attr('color');
      const face = node.attr('face');
      const size = node.attr('size');

      if (color) {
        props.color = color;
      }

      if (face) {
        props['font-family'] = face;
      }

      if (size) {
        Strings.toInt(size).each((num) => {
          props['font-size'] = fontSizes[num - 1];
        });
      }

      node.name = 'span';
      node.attr('style', styles.serialize(props));
      removeAttrs(node, [ 'color', 'face', 'size' ]);
    });
  });
};

const addStrikeFilter = (domParser: DomParser, schema: Schema, styles: Styles): void => {
  domParser.addNodeFilter('strike', (nodes) => {
    const convertToSTag = schema.type !== 'html4';
    Arr.each(nodes, (node) => {
      if (convertToSTag) {
        node.name = 's';
      } else {
        const props = styles.parse(node.attr('style'));

        props['text-decoration'] = 'line-through';

        node.name = 'span';
        node.attr('style', styles.serialize(props));
      }
    });
  });
};

const addFilters = (domParser: DomParser, settings: DomParserSettings, schema: Schema): void => {
  const styles = Styles();

  if (settings.convert_fonts_to_spans) {
    addFontToSpansFilter(domParser, styles, Tools.explode(settings.font_size_legacy_values ?? ''));
  }

  addStrikeFilter(domParser, schema, styles);
};

const register = (domParser: DomParser, settings: DomParserSettings, schema: Schema): void => {
  if (settings.inline_styles) {
    addFilters(domParser, settings, schema);
  }
};

export {
  register
};
