import { Arr, Fun } from '@ephox/katamari';

import EditorManager from 'tinymce/core/api/EditorManager';
import Tools from 'tinymce/core/api/util/Tools';

import ComboBox from './ComboBox';
import LinkTargets from './content/LinkTargets';

/**
 * FilePicker.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class creates a file picker control.
 *
 * @class tinymce.ui.FilePicker
 * @extends tinymce.ui.ComboBox
 */

declare let window: any;

const getActiveEditor = function () {
  return window.tinymce ? window.tinymce.activeEditor : EditorManager.activeEditor;
};

let history = {};
const HISTORY_LENGTH = 5;

const clearHistory = function () {
  history = {};
};

const toMenuItem = function (target) {
  return {
    title: target.title,
    value: {
      title: { raw: target.title },
      url: target.url,
      attach: target.attach
    }
  };
};

const toMenuItems = function (targets) {
  return Tools.map(targets, toMenuItem);
};

const staticMenuItem = function (title, url) {
  return {
    title,
    value: {
      title,
      url,
      attach: Fun.noop
    }
  };
};

const isUniqueUrl = function (url, targets) {
  const foundTarget = Arr.exists(targets, function (target) {
    return target.url === url;
  });

  return !foundTarget;
};

const getSetting = function (editorSettings, name, defaultValue) {
  const value = name in editorSettings ? editorSettings[name] : defaultValue;
  return value === false ? null : value;
};

const createMenuItems = function (term, targets, fileType, editorSettings) {
  const separator = { title: '-' };

  const fromHistoryMenuItems = function (history) {
    const historyItems = history.hasOwnProperty(fileType) ? history[fileType] : [ ];
    const uniqueHistory = Arr.filter(historyItems, function (url) {
      return isUniqueUrl(url, targets);
    });

    return Tools.map(uniqueHistory, function (url) {
      return {
        title: url,
        value: {
          title: url,
          url,
          attach: Fun.noop
        }
      };
    });
  };

  const fromMenuItems = function (type) {
    const filteredTargets = Arr.filter(targets, function (target) {
      return target.type === type;
    });

    return toMenuItems(filteredTargets);
  };

  const anchorMenuItems = function () {
    const anchorMenuItems = fromMenuItems('anchor');
    const topAnchor = getSetting(editorSettings, 'anchor_top', '#top');
    const bottomAchor = getSetting(editorSettings, 'anchor_bottom', '#bottom');

    if (topAnchor !== null) {
      anchorMenuItems.unshift(staticMenuItem('<top>', topAnchor));
    }

    if (bottomAchor !== null) {
      anchorMenuItems.push(staticMenuItem('<bottom>', bottomAchor));
    }

    return anchorMenuItems;
  };

  const join = function (items) {
    return Arr.foldl(items, function (a, b) {
      const bothEmpty = a.length === 0 || b.length === 0;
      return bothEmpty ? a.concat(b) : a.concat(separator, b);
    }, []);
  };

  if (editorSettings.typeahead_urls === false) {
    return [];
  }

  return fileType === 'file' ? join([
    filterByQuery(term, fromHistoryMenuItems(history)),
    filterByQuery(term, fromMenuItems('header')),
    filterByQuery(term, anchorMenuItems())
  ]) : filterByQuery(term, fromHistoryMenuItems(history));
};

const addToHistory = function (url, fileType) {
  const items = history[fileType];

  if (!/^https?/.test(url)) {
    return;
  }

  if (items) {
    if (Arr.indexOf(items, url).isNone()) {
      history[fileType] = items.slice(0, HISTORY_LENGTH).concat(url);
    }
  } else {
    history[fileType] = [url];
  }
};

const filterByQuery = function (term, menuItems) {
  const lowerCaseTerm = term.toLowerCase();
  const result = Tools.grep(menuItems, function (item) {
    return item.title.toLowerCase().indexOf(lowerCaseTerm) !== -1;
  });

  return result.length === 1 && result[0].title === term ? [] : result;
};

const getTitle = function (linkDetails) {
  const title = linkDetails.title;
  return title.raw ? title.raw : title;
};

const setupAutoCompleteHandler = function (ctrl, editorSettings, bodyElm, fileType) {
  const autocomplete = function (term) {
    const linkTargets = LinkTargets.find(bodyElm);
    const menuItems = createMenuItems(term, linkTargets, fileType, editorSettings);
    ctrl.showAutoComplete(menuItems, term);
  };

  ctrl.on('autocomplete', function () {
    autocomplete(ctrl.value());
  });

  ctrl.on('selectitem', function (e) {
    const linkDetails = e.value;

    ctrl.value(linkDetails.url);
    const title = getTitle(linkDetails);

    if (fileType === 'image') {
      ctrl.fire('change', { meta: { alt: title, attach: linkDetails.attach } });
    } else {
      ctrl.fire('change', { meta: { text: title, attach: linkDetails.attach } });
    }

    ctrl.focus();
  });

  ctrl.on('click', function (e) {
    if (ctrl.value().length === 0 && e.target.nodeName === 'INPUT') {
      autocomplete('');
    }
  });

  ctrl.on('PostRender', function () {
    ctrl.getRoot().on('submit', function (e) {
      if (!e.isDefaultPrevented()) {
        addToHistory(ctrl.value(), fileType);
      }
    });
  });
};

const statusToUiState = function (result) {
  const status = result.status, message = result.message;

  if (status === 'valid') {
    return { status: 'ok', message };
  } else if (status === 'unknown') {
    return { status: 'warn', message };
  } else if (status === 'invalid') {
    return { status: 'warn', message };
  } else {
    return { status: 'none', message: '' };
  }
};

const setupLinkValidatorHandler = function (ctrl, editorSettings, fileType) {
  const validatorHandler = editorSettings.filepicker_validator_handler;
  if (validatorHandler) {
    const validateUrl = function (url) {
      if (url.length === 0) {
        ctrl.statusLevel('none');
        return;
      }

      validatorHandler({
        url,
        type: fileType
      }, function (result) {
        const uiState = statusToUiState(result);

        ctrl.statusMessage(uiState.message);
        ctrl.statusLevel(uiState.status);
      });
    };

    ctrl.state.on('change:value', function (e) {
      validateUrl(e.value);
    });
  }
};

export default ComboBox.extend({
  Statics: {
    clearHistory
  },

  /**
   * Constructs a new control instance with the specified settings.
   *
   * @constructor
   * @param {Object} settings Name/value object with settings.
   */
  init (settings) {
    const self = this, editor = getActiveEditor(), editorSettings = editor.settings;
    let actionCallback, fileBrowserCallback, fileBrowserCallbackTypes;
    const fileType = settings.filetype;

    settings.spellcheck = false;

    fileBrowserCallbackTypes = editorSettings.file_picker_types || editorSettings.file_browser_callback_types;
    if (fileBrowserCallbackTypes) {
      fileBrowserCallbackTypes = Tools.makeMap(fileBrowserCallbackTypes, /[, ]/);
    }

    if (!fileBrowserCallbackTypes || fileBrowserCallbackTypes[fileType]) {
      fileBrowserCallback = editorSettings.file_picker_callback;
      if (fileBrowserCallback && (!fileBrowserCallbackTypes || fileBrowserCallbackTypes[fileType])) {
        actionCallback = function () {
          let meta = self.fire('beforecall').meta;

          meta = Tools.extend({ filetype: fileType }, meta);

          // file_picker_callback(callback, currentValue, metaData)
          fileBrowserCallback.call(
            editor,
            function (value, meta) {
              self.value(value).fire('change', { meta });
            },
            self.value(),
            meta
          );
        };
      } else {
        // Legacy callback: file_picker_callback(id, currentValue, filetype, window)
        fileBrowserCallback = editorSettings.file_browser_callback;
        if (fileBrowserCallback && (!fileBrowserCallbackTypes || fileBrowserCallbackTypes[fileType])) {
          actionCallback = function () {
            fileBrowserCallback(
              self.getEl('inp').id,
              self.value(),
              fileType,
              window
            );
          };
        }
      }
    }

    if (actionCallback) {
      settings.icon = 'browse';
      settings.onaction = actionCallback;
    }

    self._super(settings);
    self.classes.add('filepicker');

    setupAutoCompleteHandler(self, editorSettings, editor.getBody(), fileType);
    setupLinkValidatorHandler(self, editorSettings, fileType);
  }
});