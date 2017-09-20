/**
 * Widget.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Widget base class a widget is a control that has a tooltip and some basic states.
 *
 * @class tinymce.ui.Widget
 * @extends tinymce.ui.Control
 */
define(
  'tinymce.ui.Widget',
  [
    "tinymce.ui.Control",
    "tinymce.ui.Tooltip"
  ],
  function (Control, Tooltip) {
    "use strict";

    var tooltip;

    var Widget = Control.extend({
      /**
       * Constructs a instance with the specified settings.
       *
       * @constructor
       * @param {Object} settings Name/value object with settings.
       * @setting {String} tooltip Tooltip text to display when hovering.
       * @setting {Boolean} autofocus True if the control should be focused when rendered.
       * @setting {String} text Text to display inside widget.
       */
      init: function (settings) {
        var self = this;

        self._super(settings);
        settings = self.settings;
        self.canFocus = true;

        if (settings.tooltip && Widget.tooltips !== false) {
          self.on('mouseenter', function (e) {
            var tooltip = self.tooltip().moveTo(-0xFFFF);

            if (e.control == self) {
              var rel = tooltip.text(settings.tooltip).show().testMoveRel(self.getEl(), ['bc-tc', 'bc-tl', 'bc-tr']);

              tooltip.classes.toggle('tooltip-n', rel == 'bc-tc');
              tooltip.classes.toggle('tooltip-nw', rel == 'bc-tl');
              tooltip.classes.toggle('tooltip-ne', rel == 'bc-tr');

              tooltip.moveRel(self.getEl(), rel);
            } else {
              tooltip.hide();
            }
          });

          self.on('mouseleave mousedown click', function () {
            self.tooltip().hide();
          });
        }

        self.aria('label', settings.ariaLabel || settings.tooltip);
      },

      /**
       * Returns the current tooltip instance.
       *
       * @method tooltip
       * @return {tinymce.ui.Tooltip} Tooltip instance.
       */
      tooltip: function () {
        if (!tooltip) {
          tooltip = new Tooltip({ type: 'tooltip' });
          tooltip.renderTo();
        }

        return tooltip;
      },

      /**
       * Called after the control has been rendered.
       *
       * @method postRender
       */
      postRender: function () {
        var self = this, settings = self.settings;

        self._super();

        if (!self.parent() && (settings.width || settings.height)) {
          self.initLayoutRect();
          self.repaint();
        }

        if (settings.autofocus) {
          self.focus();
        }
      },

      bindStates: function () {
        var self = this;

        function disable(state) {
          self.aria('disabled', state);
          self.classes.toggle('disabled', state);
        }

        function active(state) {
          self.aria('pressed', state);
          self.classes.toggle('active', state);
        }

        self.state.on('change:disabled', function (e) {
          disable(e.value);
        });

        self.state.on('change:active', function (e) {
          active(e.value);
        });

        if (self.state.get('disabled')) {
          disable(true);
        }

        if (self.state.get('active')) {
          active(true);
        }

        return self._super();
      },

      /**
       * Removes the current control from DOM and from UI collections.
       *
       * @method remove
       * @return {tinymce.ui.Control} Current control instance.
       */
      remove: function () {
        this._super();

        if (tooltip) {
          tooltip.remove();
          tooltip = null;
        }
      }
    });

    return Widget;
  }
);
