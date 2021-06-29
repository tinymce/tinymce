/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DOMUtils from '../api/dom/DOMUtils';
import Tools from '../api/util/Tools';
import * as NodeType from '../dom/NodeType';
import { Formats, FormatVars } from './FormatTypes';

const get = (dom: DOMUtils) => {
  const formats: Formats = {
    valigntop: [
      { selector: 'td,th', styles: { verticalAlign: 'top' }}
    ],

    valignmiddle: [
      { selector: 'td,th', styles: { verticalAlign: 'middle' }}
    ],

    valignbottom: [
      { selector: 'td,th', styles: { verticalAlign: 'bottom' }}
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
        selector: 'img,table,audio,video',
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
        selector: 'img,audio,video',
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
        selector: 'img,table,audio,video',
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
      { inline: 'strong', remove: 'all', preserve_attributes: [ 'class', 'style' ] },
      { inline: 'span', styles: { fontWeight: 'bold' }},
      { inline: 'b', remove: 'all', preserve_attributes: [ 'class', 'style' ] }
    ],

    italic: [
      { inline: 'em', remove: 'all', preserve_attributes: [ 'class', 'style' ] },
      { inline: 'span', styles: { fontStyle: 'italic' }},
      { inline: 'i', remove: 'all', preserve_attributes: [ 'class', 'style' ] }
    ],

    underline: [
      { inline: 'span', styles: { textDecoration: 'underline' }, exact: true },
      { inline: 'u', remove: 'all', preserve_attributes: [ 'class', 'style' ] }
    ],

    strikethrough: [
      { inline: 'span', styles: { textDecoration: 'line-through' }, exact: true },
      { inline: 'strike', remove: 'all', preserve_attributes: [ 'class', 'style' ] },
      { inline: 's', remove: 'all', preserve_attributes: [ 'class', 'style' ] }
    ],

    forecolor: { inline: 'span', styles: { color: '%value' }, links: true, remove_similar: true, clear_child_styles: true },
    hilitecolor: { inline: 'span', styles: { backgroundColor: '%value' }, links: true, remove_similar: true, clear_child_styles: true },
    fontname: { inline: 'span', toggle: false, styles: { fontFamily: '%value' }, clear_child_styles: true },
    fontsize: { inline: 'span', toggle: false, styles: { fontSize: '%value' }, clear_child_styles: true },
    lineheight: { selector: 'h1,h2,h3,h4,h5,h6,p,li,td,th,div', defaultBlock: 'p', styles: { lineHeight: '%value' }},
    fontsize_class: { inline: 'span', attributes: { class: '%value' }},
    blockquote: { block: 'blockquote', wrapper: true, remove: 'all' },
    subscript: { inline: 'sub' },
    superscript: { inline: 'sup' },
    code: { inline: 'code' },

    link: {
      inline: 'a', selector: 'a', remove: 'all', split: true, deep: true,
      onmatch: (node, _fmt, _itemName) => {
        return NodeType.isElement(node) && node.hasAttribute('href');
      },

      onformat: (elm, _fmt, vars?: FormatVars) => {
        Tools.each(vars, (value, key) => {
          dom.setAttrib(elm, key, value);
        });
      }
    },

    lang: {
      inline: 'span',
      clear_child_styles: true,
      remove_similar: true,
      attributes: {
        'lang': '%value',
        'data-mce-lang': (vars) => vars?.customValue ?? null
      }
    },

    removeformat: [
      {
        selector: 'b,strong,em,i,font,u,strike,s,sub,sup,dfn,code,samp,kbd,var,cite,mark,q,del,ins,small',
        remove: 'all',
        split: true,
        expand: false,
        block_expand: true,
        deep: true
      },
      { selector: 'span', attributes: [ 'style', 'class' ], remove: 'empty', split: true, expand: false, deep: true },
      { selector: '*', attributes: [ 'style', 'class' ], split: false, expand: false, deep: true }
    ]
  };

  Tools.each('p h1 h2 h3 h4 h5 h6 div address pre dt dd samp'.split(/\s/), (name) => {
    formats[name] = { block: name, remove: 'all' };
  });

  return formats;
};

export {
  get
};
