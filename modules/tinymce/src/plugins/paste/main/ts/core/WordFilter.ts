/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Unicode } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import DomParser from 'tinymce/core/api/html/DomParser';
import AstNode from 'tinymce/core/api/html/Node';
import Schema from 'tinymce/core/api/html/Schema';
import Tools from 'tinymce/core/api/util/Tools';

import * as Settings from '../api/Settings';
import * as Utils from './Utils';

interface WordAstNode extends AstNode {
  _listLevel?: number;
  _listIgnore?: boolean;
}

/**
 * This class parses word HTML into proper TinyMCE markup.
 *
 * @class tinymce.pasteplugin.WordFilter
 * @private
 */

/**
 * Checks if the specified content is from any of the following sources: MS Word/Office 365/Google docs.
 */
const isWordContent = (content: string): boolean => {
  return (
    (/<font face="Times New Roman"|class="?Mso|style="[^"]*\bmso-|style='[^']*\bmso-|w:WordDocument/i).test(content) ||
    (/class="OutlineElement/).test(content) ||
    (/id="?docs\-internal\-guid\-/.test(content))
  );
};

const filterStyles = (editor: Editor, validStyles: Record<string, string> | undefined, node: WordAstNode, styleValue: string): string | null => {
  const outputStyles: Record<string, string> = {};
  const styles = editor.dom.parseStyle(styleValue);

  Tools.each(styles, (value, name) => {
    // Convert various MS styles to W3C styles
    switch (name) {
      case 'mso-list':
        // Parse out list indent level for lists
        const matches = /\w+ \w+([0-9]+)/i.exec(styleValue);
        if (matches) {
          node._listLevel = parseInt(matches[1], 10);
        }

        // Remove these nodes <span style="mso-list:Ignore">o</span>
        // Since the span gets removed we mark the text node and the span
        if (/Ignore/i.test(value) && node.firstChild) {
          node._listIgnore = true;
          (node.firstChild as WordAstNode)._listIgnore = true;
        }

        break;

      case 'horiz-align':
        name = 'text-align';
        break;

      case 'vert-align':
        name = 'vertical-align';
        break;

      case 'font-color':
      case 'mso-foreground':
        name = 'color';
        break;

      case 'mso-background':
      case 'mso-highlight':
        name = 'background';
        break;

      case 'font-weight':
      case 'font-style':
        if (value !== 'normal') {
          outputStyles[name] = value;
        }
        return;

      case 'mso-element':
        // Remove track changes code
        if (/^(comment|comment-list)$/i.test(value)) {
          node.remove();
          return;
        }

        break;
    }

    if (name.indexOf('mso-comment') === 0) {
      node.remove();
      return;
    }

    // Never allow mso- prefixed names
    if (name.indexOf('mso-') === 0) {
      return;
    }

    // Output only valid styles
    if (Settings.getRetainStyleProps(editor) === 'all' || (validStyles && validStyles[name])) {
      outputStyles[name] = value;
    }
  });

  // Convert bold style to "b" element
  if (/(bold)/i.test(outputStyles['font-weight'])) {
    delete outputStyles['font-weight'];
    node.wrap(new AstNode('b', 1));
  }

  // Convert italic style to "i" element
  if (/(italic)/i.test(outputStyles['font-style'])) {
    delete outputStyles['font-style'];
    node.wrap(new AstNode('i', 1));
  }

  // Serialize the styles and see if there is something left to keep
  const outputStyle = editor.dom.serializeStyle(outputStyles, node.name);
  if (outputStyle) {
    return outputStyle;
  }

  return null;
};

const filterWordContent = (editor: Editor, content: string): string => {
  let validStyles: Record<string, string>;

  const retainStyleProperties = Settings.getRetainStyleProps(editor);
  if (retainStyleProperties) {
    validStyles = Tools.makeMap(retainStyleProperties.split(/[, ]/));
  }

  // Remove basic Word junk
  content = Utils.filter(content, [
    // Remove apple new line markers
    /<br class="?Apple-interchange-newline"?>/gi,

    // Remove google docs internal guid markers
    /<b[^>]+id="?docs-internal-[^>]*>/gi,

    // Word comments like conditional comments etc
    /<!--[\s\S]+?-->/gi,

    // Remove comments, scripts (e.g., msoShowComment), XML tag, VML content,
    // MS Office namespaced tags, and a few other tags
    /<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|img|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi,

    // Convert <s> into <strike> for line-though
    [ /<(\/?)s>/gi, '<$1strike>' ],

    // Replace nsbp entities to char since it's easier to handle
    [ /&nbsp;/gi, Unicode.nbsp ],

    // Convert <span style="mso-spacerun:yes">___</span> to string of alternating
    // breaking/non-breaking spaces of same length
    [ /<span\s+style\s*=\s*"\s*mso-spacerun\s*:\s*yes\s*;?\s*"\s*>([\s\u00a0]*)<\/span>/gi,
      (str, spaces) => {
        return (spaces.length > 0) ?
          spaces.replace(/./, ' ').slice(Math.floor(spaces.length / 2)).split('').join(Unicode.nbsp) : '';
      }
    ]
  ]);

  const validElements = Settings.getWordValidElements(editor);

  // Setup strict schema
  const schema = Schema({
    valid_elements: validElements,
    valid_children: '-li[p]'
  });

  // Add style/class attribute to all element rules since the user might have removed them from
  // paste_word_valid_elements config option and we need to check them for properties
  Tools.each(schema.elements, (rule) => {
    /* eslint dot-notation:0*/
    if (!rule.attributes.class) {
      rule.attributes.class = {};
      rule.attributesOrder.push('class');
    }

    if (!rule.attributes.style) {
      rule.attributes.style = {};
      rule.attributesOrder.push('style');
    }
  });

  // Parse HTML into DOM structure
  const domParser = DomParser({}, schema);

  // Filter styles to remove "mso" specific styles and convert some of them
  domParser.addAttributeFilter('style', (nodes) => {
    let i = nodes.length, node;

    while (i--) {
      node = nodes[i];
      node.attr('style', filterStyles(editor, validStyles, node, node.attr('style')));

      // Remove pointless spans
      if (node.name === 'span' && node.parent && !node.attributes.length) {
        node.unwrap();
      }
    }
  });

  // Check the class attribute for comments or del items and remove those
  domParser.addAttributeFilter('class', (nodes) => {
    let i = nodes.length, node, className;

    while (i--) {
      node = nodes[i];

      className = node.attr('class');
      if (/^(MsoCommentReference|MsoCommentText|msoDel)$/i.test(className)) {
        node.remove();
      }

      node.attr('class', null);
    }
  });

  // Remove all del elements since we don't want the track changes code in the editor
  domParser.addNodeFilter('del', (nodes) => {
    let i = nodes.length;

    while (i--) {
      nodes[i].remove();
    }
  });

  // Keep some of the links and anchors
  domParser.addNodeFilter('a', (nodes) => {
    let i = nodes.length, node, href, name;

    while (i--) {
      node = nodes[i];
      href = node.attr('href');
      name = node.attr('name');

      if (href && href.indexOf('#_msocom_') !== -1) {
        node.remove();
        continue;
      }

      if (href && href.indexOf('file://') === 0) {
        href = href.split('#')[1];
        if (href) {
          href = '#' + href;
        }
      }

      if (!href && !name) {
        node.unwrap();
      } else {
        // Remove all named anchors that aren't specific to TOC, Footnotes or Endnotes
        if (name && !/^_?(?:toc|edn|ftn)/i.test(name)) {
          node.unwrap();
          continue;
        }

        node.attr({
          href,
          name
        });
      }
    }
  });

  // TODO: TINY-8202 bring back this code, look in commit
  // b2a9c1484e3ccde90b5585c5fd532d6eb7de69cf for deleted code that might need
  // to come back

  // Parse into DOM structure
  // const rootNode = domParser.parse(content);

  // Process DOM
  if (Settings.shouldConvertWordFakeLists(editor)) {
    // convertFakeListsToProperLists(rootNode);
  }

  // Serialize DOM back to HTML
  // content = HtmlSerializer({
  //   validate: Settings.getValidate(editor)
  // }, schema).serialize(rootNode);

  return content;
};

const preProcess = (editor: Editor, content: string): string => {
  return Settings.shouldUseDefaultFilters(editor) ? filterWordContent(editor, content) : content;
};

export {
  preProcess,
  isWordContent
};
