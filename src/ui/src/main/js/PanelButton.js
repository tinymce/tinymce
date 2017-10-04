/**
 * PanelButton.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new panel button.
 *
 * @class tinymce.ui.PanelButton
 * @extends tinymce.ui.Button
 */
define(
  'tinymce.ui.PanelButton',
  [
    "tinymce.ui.Button",
    "tinymce.ui.FloatPanel"
  ],
  function (Button, FloatPanel) {
    "use strict";

    return Button.extend({
      /**
       * Shows the panel for the button.
       *
       * @method showPanel
       */
      showPanel: function () {
        var self = this, settings = self.settings;

        self.classes.add('opened');

        if (!self.panel) {
          var panelSettings = settings.panel;

          // Wrap panel in grid layout if type if specified
          // This makes it possible to add forms or other containers directly in the panel option
          if (panelSettings.type) {
            panelSettings = {
              layout: 'grid',
              items: panelSettings
            };
          }

          panelSettings.role = panelSettings.role || 'dialog';
          panelSettings.popover = true;
          panelSettings.autohide = true;
          panelSettings.ariaRoot = true;

          self.panel = new FloatPanel(panelSettings).on('hide', function () {
            self.classes.remove('opened');
          }).on('cancel', function (e) {
            e.stopPropagation();
            self.focus();
            self.hidePanel();
          }).parent(self).renderTo(self.getContainerElm());

          self.panel.fire('show');
          self.panel.reflow();
        } else {
          self.panel.show();
        }

        var rel = self.panel.testMoveRel(self.getEl(), settings.popoverAlign || (self.isRtl() ? ['bc-tc', 'bc-tl', 'bc-tr'] : ['bc-tc', 'bc-tr', 'bc-tl']));

        self.panel.classes.toggle('start', rel === 'bc-tl');
        self.panel.classes.toggle('end', rel === 'bc-tr');

        self.panel.moveRel(self.getEl(), rel);
      },

      /**
       * Hides the panel for the button.
       *
       * @method hidePanel
       */
      hidePanel: function () {
        var self = this;

        if (self.panel) {
          self.panel.hide();
        }
      },

      /**
       * Called after the control has been rendered.
       *
       * @method postRender
       */
      postRender: function () {
        var self = this;

        self.aria('haspopup', true);

        self.on('click', function (e) {
          if (e.control === self) {
            if (self.panel && self.panel.visible()) {
              self.hidePanel();
            } else {
              self.showPanel();
              self.panel.focus(!!e.aria);
            }
          }
        });

        return self._super();
      },

      remove: function () {
        if (this.panel) {
          this.panel.remove();
          this.panel = null;
        }

        return this._super();
      }
    });
  }
);