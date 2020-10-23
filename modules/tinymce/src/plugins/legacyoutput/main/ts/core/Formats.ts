/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import * as Settings from '../api/Settings';

const overrideFormats = (editor: Editor) => {
  const alignElements = 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table',
    fontSizes = Tools.explode(Settings.getFontSizeStyleValues(editor)),
    schema = editor.schema;

  // Override some internal formats to produce legacy elements and attributes
  editor.formatter.register({
    // Change alignment formats to use the deprecated align attribute
    alignleft: { selector: alignElements, attributes: { align: 'left' }},
    aligncenter: { selector: alignElements, attributes: { align: 'center' }},
    alignright: { selector: alignElements, attributes: { align: 'right' }},
    alignjustify: { selector: alignElements, attributes: { align: 'justify' }},

    // Change the basic formatting elements to use deprecated element types
    bold: [
      { inline: 'b', remove: 'all', preserve_attributes: [ 'class', 'style' ] },
      { inline: 'strong', remove: 'all', preserve_attributes: [ 'class', 'style' ] },
      { inline: 'span', styles: { fontWeight: 'bold' }}
    ],
    italic: [
      { inline: 'i', remove: 'all', preserve_attributes: [ 'class', 'style' ] },
      { inline: 'em', remove: 'all', preserve_attributes: [ 'class', 'style' ] },
      { inline: 'span', styles: { fontStyle: 'italic' }}
    ],
    underline: [
      { inline: 'u', remove: 'all', preserve_attributes: [ 'class', 'style' ] },
      { inline: 'span', styles: { textDecoration: 'underline' }, exact: true }
    ],
    strikethrough: [
      { inline: 'strike', remove: 'all', preserve_attributes: [ 'class', 'style' ] },
      { inline: 'span', styles: { textDecoration: 'line-through' }, exact: true }
    ],

    // Change font size and font family to use the deprecated font element
    fontname: { inline: 'font', toggle: false, attributes: { face: '%value' }},
    fontsize: {
      inline: 'font',
      toggle: false,
      attributes: {
        size(vars) {
          return String(Tools.inArray(fontSizes, vars.value) + 1);
        }
      }
    },

    // Setup font elements for colors as well
    forecolor: { inline: 'font', attributes: { color: '%value' }, links: true, remove_similar: true, clear_child_styles: true },
    hilitecolor: { inline: 'font', styles: { backgroundColor: '%value' }, links: true, remove_similar: true, clear_child_styles: true }
  });

  // Check that deprecated elements are allowed if not add them
  Tools.each('b,i,u,strike'.split(','), function (name) {
    schema.addValidElements(name + '[*]');
  });

  // Add font element if it's missing
  if (!schema.getElementRule('font')) {
    schema.addValidElements('font[face|size|color|style]');
  }

  // Add the missing and deprecated align attribute for the serialization engine
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

const overrideSettings = (editor: Editor) => {
  const defaultFontsizeFormats = '8pt=1 10pt=2 12pt=3 14pt=4 18pt=5 24pt=6 36pt=7';
  const defaultFontsFormats =
    'Andale Mono=andale mono,monospace;' +
    'Arial=arial,helvetica,sans-serif;' +
    'Arial Black=arial black,sans-serif;' +
    'Book Antiqua=book antiqua,palatino,serif;' +
    'Comic Sans MS=comic sans ms,sans-serif;' +
    'Courier New=courier new,courier,monospace;' +
    'Georgia=georgia,palatino,serif;' +
    'Helvetica=helvetica,arial,sans-serif;' +
    'Impact=impact,sans-serif;' +
    'Symbol=symbol;' +
    'Tahoma=tahoma,arial,helvetica,sans-serif;' +
    'Terminal=terminal,monaco,monospace;' +
    'Times New Roman=times new roman,times,serif;' +
    'Trebuchet MS=trebuchet ms,geneva,sans-serif;' +
    'Verdana=verdana,geneva,sans-serif;' +
    'Webdings=webdings;' +
    'Wingdings=wingdings,zapf dingbats';

  Settings.setInlineStyles(editor, false);

  // Override the default font size and format settings if a user hasn't already specified an override.
  // This way we don't need to override the entire button and can let the default UI render our legacy
  // font sizes/formats
  if (!Settings.getFontSizeFormats(editor)) {
    Settings.setFontSizeFormats(editor, defaultFontsizeFormats);
  }

  if (!Settings.getFontFormats(editor)) {
    Settings.setFontFormats(editor, defaultFontsFormats);
  }
};

const setup = (editor: Editor) => {
  overrideSettings(editor);
  editor.on('PreInit', () => overrideFormats(editor));
};

export {
  setup
};
