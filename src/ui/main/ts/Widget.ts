/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Control from './Control';
import Tooltip from './Tooltip';
import UiContainer from 'tinymce/ui/UiContainer';

/**
 * Widget base class a widget is a control that has a tooltip and some basic states.
 *
 * @class tinymce.ui.Widget
 * @extends tinymce.ui.Control
 */

const Widget = Control.extend({
  /**
   * Constructs a instance with the specified settings.
   *
   * @constructor
   * @param {Object} settings Name/value object with settings.
   * @setting {String} tooltip Tooltip text to display when hovering.
   * @setting {Boolean} autofocus True if the control should be focused when rendered.
   * @setting {String} text Text to display inside widget.
   */
  init (settings) {
    const self = this;

    self._super(settings);
    settings = self.settings;
    self.canFocus = true;

    if (settings.tooltip && Widget.tooltips !== false) {
      self.on('mouseenter', function (e) {
        const tooltip = self.tooltip().moveTo(-0xFFFF);

        if (e.control === self) {
          const rel = tooltip.text(settings.tooltip).show().testMoveRel(self.getEl(), ['bc-tc', 'bc-tl', 'bc-tr']);

          tooltip.classes.toggle('tooltip-n', rel === 'bc-tc');
          tooltip.classes.toggle('tooltip-nw', rel === 'bc-tl');
          tooltip.classes.toggle('tooltip-ne', rel === 'bc-tr');

          tooltip.moveRel(self.getEl(), rel);
        } else {
          tooltip.hide();
        }
      });

      self.on('mouseleave mousedown click', function () {
        self.tooltip().remove();
        self._tooltip = null;
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
  tooltip () {
    if (!this._tooltip) {
      this._tooltip = new Tooltip({ type: 'tooltip' });
      UiContainer.inheritUiContainer(this, this._tooltip);
      this._tooltip.renderTo();
    }

    return this._tooltip;
  },

  /**
   * Called after the control has been rendered.
   *
   * @method postRender
   */
  postRender () {
    const self = this, settings = self.settings;

    self._super();

    if (!self.parent() && (settings.width || settings.height)) {
      self.initLayoutRect();
      self.repaint();
    }

    if (settings.autofocus) {
      self.focus();
    }
  },

  bindStates () {
    const self = this;

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
  remove () {
    this._super();

    if (this._tooltip) {
      this._tooltip.remove();
      this._tooltip = null;
    }
  }
});

export default Widget;