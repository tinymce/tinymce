/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import { Styles } from '../api/html/Styles';
import Tools from '../api/util/Tools';

const removeAttrs = function (node, names) {
  Arr.each(names, function (name) {
    node.attr(name, null);
  });
};

const addFontToSpansFilter = function (domParser, styles, fontSizes) {
  domParser.addNodeFilter('font', function (nodes) {
    Arr.each(nodes, function (node) {
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
        props['font-size'] = fontSizes[parseInt(node.attr('size'), 10) - 1];
      }

      node.name = 'span';
      node.attr('style', styles.serialize(props));
      removeAttrs(node, ['color', 'face', 'size']);
    });
  });
};

const addStrikeToSpanFilter = function (domParser, styles) {
  domParser.addNodeFilter('strike', function (nodes) {
    Arr.each(nodes, function (node) {
      const props = styles.parse(node.attr('style'));

      props['text-decoration'] = 'line-through';

      node.name = 'span';
      node.attr('style', styles.serialize(props));
    });
  });
};

const addFilters = function (domParser, settings) {
  const styles = Styles();

  if (settings.convert_fonts_to_spans) {
    addFontToSpansFilter(domParser, styles, Tools.explode(settings.font_size_legacy_values));
  }

  addStrikeToSpanFilter(domParser, styles);
};

const register = function (domParser, settings) {
  if (settings.inline_styles) {
    addFilters(domParser, settings);
  }
};

export default {
  register
};