/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import EditorManager from 'tinymce/core/api/EditorManager';
import Env from 'tinymce/core/api/Env';
import Tools from 'tinymce/core/api/util/Tools';
import * as Settings from '../api/Settings';
import Editor from 'tinymce/core/api/Editor';
import { generate } from './SelectorModel';

interface Group {
  title: string;
  original: Group;
  selectors: {};
  filter: (value: string) => boolean;
  item: {
    text: string;
    menu: [];
  };
}

const removeCacheSuffix = function (url: string) {
  const cacheSuffix = Env.cacheSuffix;

  if (typeof url === 'string') {
    url = url.replace('?' + cacheSuffix, '').replace('&' + cacheSuffix, '');
  }

  return url;
};

const isSkinContentCss = (editor: Editor, href: string) => {
  const skin = Settings.getSkin(editor);

  if (skin) {
    const skinUrlBase = Settings.getSkinUrl(editor);
    const skinUrl = skinUrlBase ? editor.documentBaseURI.toAbsolute(skinUrlBase) : EditorManager.baseURL + '/skins/ui/' + skin;
    const contentSkinUrlPart = EditorManager.baseURL + '/skins/content/';
    return href === skinUrl + '/content' + (editor.inline ? '.inline' : '') + '.min.css' || href.indexOf(contentSkinUrlPart) !== -1;
  }

  return false;
};

const compileFilter = function (filter: string | RegExp | Function) {
  if (typeof filter === 'string') {
    return function (value) {
      return value.indexOf(filter) !== -1;
    };
  } else if (filter instanceof RegExp) {
    return function (value) {
      return filter.test(value);
    };
  }

  return filter;
};

const getSelectors = function (editor: Editor, doc, fileFilter) {
  const selectors = [], contentCSSUrls = {};

  function append(styleSheet, imported?) {
    let href = styleSheet.href, rules;

    href = removeCacheSuffix(href);

    if (!href || !fileFilter(href, imported) || isSkinContentCss(editor, href)) {
      return;
    }

    Tools.each(styleSheet.imports, function (styleSheet) {
      append(styleSheet, true);
    });

    try {
      rules = styleSheet.cssRules || styleSheet.rules;
    } catch (e) {
      // Firefox fails on rules to remote domain for example:
      // @import url(//fonts.googleapis.com/css?family=Pathway+Gothic+One);
    }

    Tools.each(rules, function (cssRule) {
      if (cssRule.styleSheet) {
        append(cssRule.styleSheet, true);
      } else if (cssRule.selectorText) {
        Tools.each(cssRule.selectorText.split(','), function (selector) {
          selectors.push(Tools.trim(selector));
        });
      }
    });
  }

  Tools.each(editor.contentCSS, function (url) {
    contentCSSUrls[url] = true;
  });

  if (!fileFilter) {
    fileFilter = function (href: string, imported: string) {
      return imported || contentCSSUrls[href];
    };
  }

  try {
    Tools.each(doc.styleSheets, function (styleSheet: string) {
      append(styleSheet);
    });
  } catch (e) {
    // Ignore
  }

  return selectors;
};

const defaultConvertSelectorToFormat = function (editor: Editor, selectorText: string) {
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

const getGroupsBySelector = function (groups: Group[], selector: string): Group[] {
  return Tools.grep(groups, function (group) {
    return !group.filter || group.filter(selector);
  });
};

const compileUserDefinedGroups = function (groups): Group[] {
  return Tools.map(groups, function (group) {
    return Tools.extend({}, group, {
      original: group,
      selectors: {},
      filter: compileFilter(group.filter),
      item: {
        text: group.title,
        menu: []
      }
    });
  });
};

interface StyleGroup {
  title: string;
  selectors: Record<string, any>;
  filter: string | RegExp | Function;
}

const isExclusiveMode = function (editor: Editor, group: StyleGroup) {
  // Exclusive mode can only be disabled when there are groups allowing the same style to be present in multiple groups
  return group === null || Settings.shouldImportExclusive(editor) !== false;
};

const isUniqueSelector = function (editor: Editor, selector: string, group: StyleGroup, globallyUniqueSelectors: Record<string, any>) {
  return !(isExclusiveMode(editor, group) ? selector in globallyUniqueSelectors : selector in group.selectors);
};

const markUniqueSelector = function (editor: Editor, selector: string, group: StyleGroup, globallyUniqueSelectors: Record<string, any>) {
  if (isExclusiveMode(editor, group)) {
    globallyUniqueSelectors[selector] = true;
  } else {
    group.selectors[selector] = true;
  }
};

const convertSelectorToFormat = function (editor, plugin, selector, group) {
  let selectorConverter;

  if (group && group.selector_converter) {
    selectorConverter = group.selector_converter;
  } else if (Settings.getSelectorConverter(editor)) {
    selectorConverter = Settings.getSelectorConverter(editor);
  } else {
    selectorConverter = function () {
      return defaultConvertSelectorToFormat(editor, selector);
    };
  }

  return selectorConverter.call(plugin, selector, group);
};

const setup = function (editor: Editor) {
  editor.on('init', function (_e) {
    const model = generate();

    const globallyUniqueSelectors = {};
    const selectorFilter = compileFilter(Settings.getSelectorFilter(editor));
    const groups = compileUserDefinedGroups(Settings.getCssGroups(editor));

    const processSelector = function (selector: string, group: StyleGroup) {
      if (isUniqueSelector(editor, selector, group, globallyUniqueSelectors)) {
        markUniqueSelector(editor, selector, group, globallyUniqueSelectors);

        const format = convertSelectorToFormat(editor, editor.plugins.importcss, selector, group);
        if (format) {
          const formatName = format.name || DOMUtils.DOM.uniqueId();
          editor.formatter.register(formatName, format);

          // NOTE: itemDefaults has been removed as it was not supported by bridge and its concept
          // is handled elsewhere.
          return Tools.extend({}, {
            title: format.title,
            format: formatName
          });
        }
      }

      return null;
    };

    Tools.each(getSelectors(editor, editor.getDoc(), compileFilter(Settings.getFileFilter(editor))), function (selector: string) {
      if (selector.indexOf('.mce-') === -1) {
        if (!selectorFilter || selectorFilter(selector)) {
          const selectorGroups = getGroupsBySelector(groups, selector);

          if (selectorGroups.length > 0) {
            Tools.each(selectorGroups, function (group) {
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
