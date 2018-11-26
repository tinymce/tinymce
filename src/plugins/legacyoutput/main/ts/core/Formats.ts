/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from 'tinymce/core/api/util/Tools';

const overrideFormats = function (editor) {
  const alignElements = 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img',
    fontSizes = Tools.explode(editor.settings.font_size_style_values),
    schema = editor.schema;

  // Override some internal formats to produce legacy elements and attributes
  editor.formatter.register({
    // Change alignment formats to use the deprecated align attribute
    alignleft: { selector: alignElements, attributes: { align: 'left' } },
    aligncenter: { selector: alignElements, attributes: { align: 'center' } },
    alignright: { selector: alignElements, attributes: { align: 'right' } },
    alignjustify: { selector: alignElements, attributes: { align: 'justify' } },

    // Change the basic formatting elements to use deprecated element types
    bold: [
      { inline: 'b', remove: 'all' },
      { inline: 'strong', remove: 'all' },
      { inline: 'span', styles: { fontWeight: 'bold' } }
    ],
    italic: [
      { inline: 'i', remove: 'all' },
      { inline: 'em', remove: 'all' },
      { inline: 'span', styles: { fontStyle: 'italic' } }
    ],
    underline: [
      { inline: 'u', remove: 'all' },
      { inline: 'span', styles: { textDecoration: 'underline' }, exact: true }
    ],
    strikethrough: [
      { inline: 'strike', remove: 'all' },
      { inline: 'span', styles: { textDecoration: 'line-through' }, exact: true }
    ],

    // Change font size and font family to use the deprecated font element
    fontname: { inline: 'font', attributes: { face: '%value' } },
    fontsize: {
      inline: 'font',
      attributes: {
        size (vars) {
          return Tools.inArray(fontSizes, vars.value) + 1;
        }
      }
    },

    // Setup font elements for colors as well
    forecolor: { inline: 'font', attributes: { color: '%value' } },
    hilitecolor: { inline: 'font', styles: { backgroundColor: '%value' } }
  });

  // Check that deprecated elements are allowed if not add them
  Tools.each('b,i,u,strike'.split(','), function (name) {
    schema.addValidElements(name + '[*]');
  });

  // Add font element if it's missing
  if (!schema.getElementRule('font')) {
    schema.addValidElements('font[face|size|color|style]');
  }

  // Add the missing and depreacted align attribute for the serialization engine
  Tools.each(alignElements.split(','), function (name) {
    const rule = schema.getElementRule(name);

    if (rule) {
      if (!rule.attributes.align) {
        rule.attributes.align = {};
        rule.attributesOrder.push('align');
      }
    }
  });
};

const setup = function (editor) {
  editor.settings.inline_styles = false;
  editor.on('init', function () {
    overrideFormats(editor);
  });
};

export default {
  setup
};