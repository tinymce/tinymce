/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Type } from '@ephox/katamari';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import Env from 'tinymce/core/api/Env';
import { StyleFormat } from 'tinymce/core/api/fmt/StyleFormat';
import { Plugin } from 'tinymce/core/api/PluginManager';
import Tools from 'tinymce/core/api/util/Tools';

import * as Settings from '../api/Settings';
import { generate, SelectorFormatItem } from './SelectorModel';

type Filter = (value: string, imported?: boolean) => boolean;
type SelectorConvertor = () => StyleFormat | undefined;

export interface UserDefinedGroup {
  readonly title: string;
  readonly filter?: Filter;
  readonly selector_converter?: SelectorConvertor;
}

interface Group extends UserDefinedGroup {
  readonly original: UserDefinedGroup;
  readonly selectors: Record<string, boolean>;
  readonly filter: Filter | undefined;
}

const internalEditorStyle = /^\.(?:ephox|tiny-pageembed|mce)(?:[.-]+\w+)+$/;

const removeCacheSuffix = (url: string): string => {
  const cacheSuffix = Env.cacheSuffix;

  if (Type.isString(url)) {
    url = url.replace('?' + cacheSuffix, '').replace('&' + cacheSuffix, '');
  }

  return url;
};

const isSkinContentCss = (editor: Editor, href: string): boolean => {
  const skin = Settings.getSkin(editor);

  if (skin) {
    const skinUrlBase = Settings.getSkinUrl(editor);
    const skinUrl = skinUrlBase ? editor.documentBaseURI.toAbsolute(skinUrlBase) : EditorManager.baseURL + '/skins/ui/' + skin;
    const contentSkinUrlPart = EditorManager.baseURL + '/skins/content/';
    return href === skinUrl + '/content' + (editor.inline ? '.inline' : '') + '.min.css' || href.indexOf(contentSkinUrlPart) !== -1;
  }

  return false;
};

const compileFilter = (filter: string | RegExp | Filter | undefined): Filter | undefined => {
  if (Type.isString(filter)) {
    return (value: string) => {
      return value.indexOf(filter) !== -1;
    };
  } else if (filter instanceof RegExp) {
    return (value: string) => {
      return filter.test(value);
    };
  }

  return filter;
};

const isCssImportRule = (rule: CSSRule): rule is CSSImportRule => (rule as any).styleSheet;
const isCssPageRule = (rule: CSSRule): rule is CSSPageRule => (rule as any).selectorText;

const getSelectors = (editor: Editor, doc: Document, fileFilter: Filter | undefined): string[] => {
  const selectors: string[] = [];
  const contentCSSUrls: Record<string, boolean> = {};

  const append = (styleSheet: CSSStyleSheet, imported?: boolean) => {
    let href = styleSheet.href, rules: CSSRuleList | undefined;

    href = removeCacheSuffix(href);

    if (!href || !fileFilter(href, imported) || isSkinContentCss(editor, href)) {
      return;
    }

    // TODO: Is this still need as TypeScript/MDN says imports doesn't exist?
    Tools.each((styleSheet as any).imports, (styleSheet: CSSStyleSheet) => {
      append(styleSheet, true);
    });

    try {
      rules = styleSheet.cssRules || styleSheet.rules;
    } catch (e) {
      // Firefox fails on rules to remote domain for example:
      // @import url(//fonts.googleapis.com/css?family=Pathway+Gothic+One);
    }

    Tools.each(rules, (cssRule) => {
      if (isCssImportRule(cssRule)) {
        append(cssRule.styleSheet, true);
      } else if (isCssPageRule(cssRule)) {
        Tools.each(cssRule.selectorText.split(','), (selector) => {
          selectors.push(Tools.trim(selector));
        });
      }
    });
  };

  Tools.each(editor.contentCSS, (url) => {
    contentCSSUrls[url] = true;
  });

  if (!fileFilter) {
    fileFilter = (href: string, imported: boolean) => {
      return imported || contentCSSUrls[href];
    };
  }

  try {
    Tools.each(doc.styleSheets, (styleSheet) => {
      append(styleSheet);
    });
  } catch (e) {
    // Ignore
  }

  return selectors;
};

const defaultConvertSelectorToFormat = (editor: Editor, selectorText: string): StyleFormat | undefined => {
  let format;

  // Parse simple element.class1, .class1
  const selector = /^(?:([a-z0-9\-_]+))?(\.[a-z0-9_\-\.]+)$/i.exec(selectorText);
  if (!selector) {
    return;
  }

  const elementName = selector[1];
  const classes = selector[2].substr(1).split('.').join(' ');
  const inlineSelectorElements = Tools.makeMap('a,img');

  // element.class - Produce block formats
  if (selector[1]) {
    format = {
      title: selectorText
    };

    if (editor.schema.getTextBlockElements()[elementName]) {
      // Text block format ex: h1.class1
      format.block = elementName;
    } else if (editor.schema.getBlockElements()[elementName] || inlineSelectorElements[elementName.toLowerCase()]) {
      // Block elements such as table.class and special inline elements such as a.class or img.class
      format.selector = elementName;
    } else {
      // Inline format strong.class1
      format.inline = elementName;
    }
  } else if (selector[2]) {
    // .class - Produce inline span with classes
    format = {
      inline: 'span',
      title: selectorText.substr(1),
      classes
    };
  }

  // Append to or override class attribute
  if (Settings.shouldMergeClasses(editor) !== false) {
    format.classes = classes;
  } else {
    format.attributes = { class: classes };
  }

  return format;
};

const getGroupsBySelector = (groups: Group[], selector: string): Group[] => {
  return Tools.grep(groups, (group) => {
    return !group.filter || group.filter(selector);
  });
};

const compileUserDefinedGroups = (groups: UserDefinedGroup[]): Group[] => {
  return Tools.map(groups, (group) => {
    return Tools.extend({}, group, {
      original: group,
      selectors: {},
      filter: compileFilter(group.filter)
    });
  });
};

const isExclusiveMode = (editor: Editor, group: Group): boolean => {
  // Exclusive mode can only be disabled when there are groups allowing the same style to be present in multiple groups
  return group === null || Settings.shouldImportExclusive(editor) !== false;
};

const isUniqueSelector = (editor: Editor, selector: string, group: Group, globallyUniqueSelectors: Record<string, boolean>): boolean => {
  return !(isExclusiveMode(editor, group) ? selector in globallyUniqueSelectors : selector in group.selectors);
};

const markUniqueSelector = (editor: Editor, selector: string, group: Group, globallyUniqueSelectors: Record<string, boolean>): void => {
  if (isExclusiveMode(editor, group)) {
    globallyUniqueSelectors[selector] = true;
  } else {
    group.selectors[selector] = true;
  }
};

const convertSelectorToFormat = (editor: Editor, plugin: Plugin, selector: string, group: Group): StyleFormat | undefined => {
  let selectorConverter: SelectorConvertor;

  if (group && group.selector_converter) {
    selectorConverter = group.selector_converter;
  } else if (Settings.getSelectorConverter(editor)) {
    selectorConverter = Settings.getSelectorConverter(editor);
  } else {
    selectorConverter = () => {
      return defaultConvertSelectorToFormat(editor, selector);
    };
  }

  return selectorConverter.call(plugin, selector, group);
};

const setup = (editor: Editor): void => {
  editor.on('init', () => {
    const model = generate();

    const globallyUniqueSelectors = {};
    const selectorFilter = compileFilter(Settings.getSelectorFilter(editor));
    const groups = compileUserDefinedGroups(Settings.getCssGroups(editor));

    const processSelector = (selector: string, group: Group): SelectorFormatItem | null => {
      if (isUniqueSelector(editor, selector, group, globallyUniqueSelectors)) {
        markUniqueSelector(editor, selector, group, globallyUniqueSelectors);

        const format = convertSelectorToFormat(editor, editor.plugins.importcss, selector, group);
        if (format) {
          const formatName = format.name || DOMUtils.DOM.uniqueId();
          editor.formatter.register(formatName, format);

          return {
            title: format.title,
            format: formatName
          };
        }
      }

      return null;
    };

    Tools.each(getSelectors(editor, editor.getDoc(), compileFilter(Settings.getFileFilter(editor))), (selector) => {
      if (!internalEditorStyle.test(selector)) {
        if (!selectorFilter || selectorFilter(selector)) {
          const selectorGroups = getGroupsBySelector(groups, selector);

          if (selectorGroups.length > 0) {
            Tools.each(selectorGroups, (group) => {
              const menuItem = processSelector(selector, group);
              if (menuItem) {
                model.addItemToGroup(group.title, menuItem);
              }
            });
          } else {
            const menuItem = processSelector(selector, null);
            if (menuItem) {
              model.addItem(menuItem);
            }
          }
        }
      }
    });

    const items = model.toFormats();
    editor.fire('addStyleModifications', {
      items,
      replace: !Settings.shouldAppend(editor)
    });
  });
};

export {
  defaultConvertSelectorToFormat,
  setup
};
