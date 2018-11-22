/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from '../api/util/Tools';

const get = function (dom) {
  const formats = {
    valigntop: [
      { selector: 'td,th', styles: { verticalAlign: 'top' } }
    ],

    valignmiddle: [
      { selector: 'td,th', styles: { verticalAlign: 'middle' } }
    ],

    valignbottom: [
      { selector: 'td,th', styles: { verticalAlign: 'bottom' } }
    ],

    alignleft: [
      {
        selector: 'figure.image',
        collapsed: false,
        classes: 'align-left',
        ceFalseOverride: true,
        preview: 'font-family font-size'
      },
      {
        selector: 'figure,p,h1,h2,h3,h4,h5,h6,td,th,tr,div,ul,ol,li',
        styles: {
          textAlign: 'left'
        },
        inherit: false,
        preview: false,
        defaultBlock: 'div'
      },
      {
        selector: 'img,table',
        collapsed: false,
        styles: {
          float: 'left'
        },
        preview: 'font-family font-size'
      }
    ],

    aligncenter: [
      {
        selector: 'figure,p,h1,h2,h3,h4,h5,h6,td,th,tr,div,ul,ol,li',
        styles: {
          textAlign: 'center'
        },
        inherit: false,
        preview: 'font-family font-size',
        defaultBlock: 'div'
      },
      {
        selector: 'figure.image',
        collapsed: false,
        classes: 'align-center',
        ceFalseOverride: true,
        preview: 'font-family font-size'
      },
      {
        selector: 'img',
        collapsed: false,
        styles: {
          display: 'block',
          marginLeft: 'auto',
          marginRight: 'auto'
        },
        preview: false
      },
      {
        selector: 'table',
        collapsed: false,
        styles: {
          marginLeft: 'auto',
          marginRight: 'auto'
        },
        preview: 'font-family font-size'
      }
    ],

    alignright: [
      {
        selector: 'figure.image',
        collapsed: false,
        classes: 'align-right',
        ceFalseOverride: true,
        preview: 'font-family font-size'
      },
      {
        selector: 'figure,p,h1,h2,h3,h4,h5,h6,td,th,tr,div,ul,ol,li',
        styles: {
          textAlign: 'right'
        },
        inherit: false,
        preview: 'font-family font-size',
        defaultBlock: 'div'
      },
      {
        selector: 'img,table',
        collapsed: false,
        styles: {
          float: 'right'
        },
        preview: 'font-family font-size'
      }
    ],

    alignjustify: [
      {
        selector: 'figure,p,h1,h2,h3,h4,h5,h6,td,th,tr,div,ul,ol,li',
        styles: {
          textAlign: 'justify'
        },
        inherit: false,
        defaultBlock: 'div',
        preview: 'font-family font-size'
      }
    ],

    bold: [
      { inline: 'strong', remove: 'all' },
      { inline: 'span', styles: { fontWeight: 'bold' } },
      { inline: 'b', remove: 'all' }
    ],

    italic: [
      { inline: 'em', remove: 'all' },
      { inline: 'span', styles: { fontStyle: 'italic' } },
      { inline: 'i', remove: 'all' }
    ],

    underline: [
      { inline: 'span', styles: { textDecoration: 'underline' }, exact: true },
      { inline: 'u', remove: 'all' }
    ],

    strikethrough: [
      { inline: 'span', styles: { textDecoration: 'line-through' }, exact: true },
      { inline: 'strike', remove: 'all' }
    ],

    forecolor: { inline: 'span', styles: { color: '%value' }, links: true, remove_similar: true, clear_child_styles: true },
    hilitecolor: { inline: 'span', styles: { backgroundColor: '%value' }, links: true, remove_similar: true, clear_child_styles: true },
    fontname: { inline: 'span', toggle: false, styles: { fontFamily: '%value' }, clear_child_styles: true },
    fontsize: { inline: 'span', toggle: false, styles: { fontSize: '%value' }, clear_child_styles: true },
    fontsize_class: { inline: 'span', attributes: { class: '%value' } },
    blockquote: { block: 'blockquote', wrapper: 1, remove: 'all' },
    subscript: { inline: 'sub' },
    superscript: { inline: 'sup' },
    code: { inline: 'code' },

    link: {
      inline: 'a', selector: 'a', remove: 'all', split: true, deep: true,
      onmatch () {
        return true;
      },

      onformat (elm, fmt, vars) {
        Tools.each(vars, function (value, key) {
          dom.setAttrib(elm, key, value);
        });
      }
    },

    removeformat: [
      {
        selector: 'b,strong,em,i,font,u,strike,sub,sup,dfn,code,samp,kbd,var,cite,mark,q,del,ins',
        remove: 'all',
        split: true,
        expand: false,
        block_expand: true,
        deep: true
      },
      { selector: 'span', attributes: ['style', 'class'], remove: 'empty', split: true, expand: false, deep: true },
      { selector: '*', attributes: ['style', 'class'], split: false, expand: false, deep: true }
    ]
  };

  Tools.each('p h1 h2 h3 h4 h5 h6 div address pre div dt dd samp'.split(/\s/), function (name) {
    formats[name] = { block: name, remove: 'all' };
  });

  return formats;
};

export default {
  get
};