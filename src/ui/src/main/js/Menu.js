/**
 * Menu.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new menu.
 *
 * @-x-less Menu.less
 * @class tinymce.ui.Menu
 * @extends tinymce.ui.FloatPanel
 */
define(
  'tinymce.ui.Menu',
  [
    'tinymce.core.Env',
    'tinymce.core.util.Delay',
    'tinymce.core.util.Tools',
    'tinymce.ui.FloatPanel',
    'tinymce.ui.MenuItem',
    'tinymce.ui.Throbber'
  ],
  function (Env, Delay, Tools, FloatPanel, MenuItem, Throbber) {
    "use strict";

    return FloatPanel.extend({
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
      init: function (settings) {
        var self = this;

        settings.autohide = true;
        settings.constrainToViewport = true;

        if (typeof settings.items === 'function') {
          settings.itemsFactory = settings.items;
          settings.items = [];
        }

        if (settings.itemDefaults) {
          var items = settings.items, i = items.length;

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
      repaint: function () {
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
      cancel: function () {
        var self = this;

        self.hideAll();
        self.fire('select');
      },

      /**
       * Loads new items from the factory items function.
       *
       * @method load
       */
      load: function () {
        var self = this, time, factory;

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
      hideAll: function () {
        var self = this;

        this.find('menuitem').exec('hideMenu');

        return self._super();
      },

      /**
       * Invoked before the menu is rendered.
       *
       * @method preRender
       */
      preRender: function () {
        var self = this;

        self.items().each(function (ctrl) {
          var settings = ctrl.settings;

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
  }
);
