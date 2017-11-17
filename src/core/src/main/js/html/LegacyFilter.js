/**
 * LegacyFilter.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.html.LegacyFilter',
  [
    'ephox.katamari.api.Arr',
    'tinymce.core.html.Styles',
    'tinymce.core.util.Tools'
  ],
  function (Arr, Styles, Tools) {
    var removeAttrs = function (node, names) {
      Arr.each(names, function (name) {
        node.attr(name, null);
      });
    };

    var addFontToSpansFilter = function (domParser, styles, fontSizes) {
      domParser.addNodeFilter('font', function (nodes) {
        Arr.each(nodes, function (node) {
          var props = styles.parse(node.attr('style'));
          var color = node.attr('color');
          var face = node.attr('face');
          var size = node.attr('size');

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

    var addStrikeToSpanFilter = function (domParser, styles) {
      domParser.addNodeFilter('strike', function (nodes) {
        Arr.each(nodes, function (node) {
          var props = styles.parse(node.attr('style'));

          props['text-decoration'] = 'line-through';

          node.name = 'span';
          node.attr('style', styles.serialize(props));
        });
      });
    };

    var addFilters = function (domParser, settings) {
      var styles = Styles();

      if (settings.convert_fonts_to_spans) {
        addFontToSpansFilter(domParser, styles, Tools.explode(settings.font_size_legacy_values));
      }

      addStrikeToSpanFilter(domParser, styles);
    };

    var register = function (domParser, settings) {
      if (settings.inline_styles) {
        addFilters(domParser, settings);
      }
    };

    return {
      register: register
    };
  }
);