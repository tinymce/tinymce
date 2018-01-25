/**
 * Sidebar.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Env from 'tinymce/core/api/Env';
import Factory from 'tinymce/core/api/ui/Factory';
import Tools from 'tinymce/core/api/util/Tools';
import Events from '../api/Events';

const api = function (elm) {
  return {
    element () {
      return elm;
    }
  };
};

const trigger = function (sidebar, panel, callbackName) {
  const callback = sidebar.settings[callbackName];
  if (callback) {
    callback(api(panel.getEl('body')));
  }
};

const hidePanels = function (name, container, sidebars) {
  Tools.each(sidebars, function (sidebar) {
    const panel = container.items().filter('#' + sidebar.name)[0];

    if (panel && panel.visible() && sidebar.name !== name) {
      trigger(sidebar, panel, 'onhide');
      panel.visible(false);
    }
  });
};

const deactivateButtons = function (toolbar) {
  toolbar.items().each(function (ctrl) {
    ctrl.active(false);
  });
};

const findSidebar = function (sidebars, name) {
  return Tools.grep(sidebars, function (sidebar) {
    return sidebar.name === name;
  })[0];
};

const showPanel = function (editor, name, sidebars) {
  return function (e) {
    const btnCtrl = e.control;
    const container = btnCtrl.parents().filter('panel')[0];
    let panel = container.find('#' + name)[0];
    const sidebar = findSidebar(sidebars, name);

    hidePanels(name, container, sidebars);
    deactivateButtons(btnCtrl.parent());

    if (panel && panel.visible()) {
      trigger(sidebar, panel, 'onhide');
      panel.hide();
      btnCtrl.active(false);
    } else {
      if (panel) {
        panel.show();
        trigger(sidebar, panel, 'onshow');
      } else {
        panel = Factory.create({
          type: 'container',
          name,
          layout: 'stack',
          classes: 'sidebar-panel',
          html: ''
        });

        container.prepend(panel);
        trigger(sidebar, panel, 'onrender');
        trigger(sidebar, panel, 'onshow');
      }

      btnCtrl.active(true);
    }

    Events.fireResizeEditor(editor);
  };
};

const isModernBrowser = function () {
  return !Env.ie || Env.ie >= 11;
};

const hasSidebar = function (editor) {
  return isModernBrowser() && editor.sidebars ? editor.sidebars.length > 0 : false;
};

const createSidebar = function (editor) {
  const buttons = Tools.map(editor.sidebars, function (sidebar) {
    const settings = sidebar.settings;

    return {
      type: 'button',
      icon: settings.icon,
      image: settings.image,
      tooltip: settings.tooltip,
      onclick: showPanel(editor, sidebar.name, editor.sidebars)
    };
  });

  return {
    type: 'panel',
    name: 'sidebar',
    layout: 'stack',
    classes: 'sidebar',
    items: [
      {
        type: 'toolbar',
        layout: 'stack',
        classes: 'sidebar-toolbar',
        items: buttons
      }
    ]
  };
};

export default {
  hasSidebar,
  createSidebar
};