/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Env from 'tinymce/core/api/Env';
import Delay from 'tinymce/core/api/util/Delay';
import Tools from 'tinymce/core/api/util/Tools';
import FloatPanel from './FloatPanel';
import Throbber from './Throbber';

/**
 * Creates a new menu.
 *
 * @-x-less Menu.less
 * @class tinymce.ui.Menu
 * @extends tinymce.ui.FloatPanel
 */

export default FloatPanel.extend({
  Defaults: {
    defaultType: 'menuitem',
    border: 1,
    layout: 'stack',
    role: 'application',
    bodyRole: 'menu',
    ariaRoot: true
  },

  /**
   * Constructs a instance with the specified settings.
   *
   * @constructor
   * @param {Object} settings Name/value object with settings.
   */
  init (settings) {
    const self = this;

    settings.autohide = true;
    settings.constrainToViewport = true;

    if (typeof settings.items === 'function') {
      settings.itemsFactory = settings.items;
      settings.items = [];
    }

    if (settings.itemDefaults) {
      const items = settings.items;
      let i = items.length;

      while (i--) {
        items[i] = Tools.extend({}, settings.itemDefaults, items[i]);
      }
    }

    self._super(settings);
    self.classes.add('menu');

    if (settings.animate && Env.ie !== 11) {
      // IE 11 can't handle transforms it looks horrible and blurry so lets disable that
      self.classes.add('animate');
    }
  },

  /**
   * Repaints the control after a layout operation.
   *
   * @method repaint
   */
  repaint () {
    this.classes.toggle('menu-align', true);

    this._super();

    this.getEl().style.height = '';
    this.getEl('body').style.height = '';

    return this;
  },

  /**
   * Hides/closes the menu.
   *
   * @method cancel
   */
  cancel () {
    const self = this;

    self.hideAll();
    self.fire('select');
  },

  /**
   * Loads new items from the factory items function.
   *
   * @method load
   */
  load () {
    const self = this;
    let time, factory;

    function hideThrobber() {
      if (self.throbber) {
        self.throbber.hide();
        self.throbber = null;
      }
    }

    factory = self.settings.itemsFactory;
    if (!factory) {
      return;
    }

    if (!self.throbber) {
      self.throbber = new Throbber(self.getEl('body'), true);

      if (self.items().length === 0) {
        self.throbber.show();
        self.fire('loading');
      } else {
        self.throbber.show(100, function () {
          self.items().remove();
          self.fire('loading');
        });
      }

      self.on('hide close', hideThrobber);
    }

    self.requestTime = time = new Date().getTime();

    self.settings.itemsFactory(function (items) {
      if (items.length === 0) {
        self.hide();
        return;
      }

      if (self.requestTime !== time) {
        return;
      }

      self.getEl().style.width = '';
      self.getEl('body').style.width = '';

      hideThrobber();
      self.items().remove();
      self.getEl('body').innerHTML = '';

      self.add(items);
      self.renderNew();
      self.fire('loaded');
    });
  },

  /**
   * Hide menu and all sub menus.
   *
   * @method hideAll
   */
  hideAll () {
    const self = this;

    this.find('menuitem').exec('hideMenu');

    return self._super();
  },

  /**
   * Invoked before the menu is rendered.
   *
   * @method preRender
   */
  preRender () {
    const self = this;

    self.items().each(function (ctrl) {
      const settings = ctrl.settings;

      if (settings.icon || settings.image || settings.selectable) {
        self._hasIcons = true;
        return false;
      }
    });

    if (self.settings.itemsFactory) {
      self.on('postrender', function () {
        if (self.settings.itemsFactory) {
          self.load();
        }
      });
    }

    self.on('show hide', function (e) {
      if (e.control === self) {
        if (e.type === 'show') {
          Delay.setTimeout(function () {
            self.classes.add('in');
          }, 0);
        } else {
          self.classes.remove('in');
        }
      }
    });

    return self._super();
  }
});