/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DomQuery from 'tinymce/core/api/dom/DomQuery';
import Delay from 'tinymce/core/api/util/Delay';
import DomUtils from './DomUtils';
import Movable from './Movable';
import Panel from './Panel';
import Resizable from './Resizable';
import { document, window } from '@ephox/dom-globals';

/**
 * This class creates a floating panel.
 *
 * @-x-less FloatPanel.less
 * @class tinymce.ui.FloatPanel
 * @extends tinymce.ui.Panel
 * @mixes tinymce.ui.Movable
 * @mixes tinymce.ui.Resizable
 */

let documentClickHandler, documentScrollHandler, windowResizeHandler;
const visiblePanels = [];
const zOrder = [];
let hasModal;

function isChildOf(ctrl, parent) {
  while (ctrl) {
    if (ctrl === parent) {
      return true;
    }

    ctrl = ctrl.parent();
  }
}

function skipOrHidePanels(e) {
  // Hide any float panel when a click/focus out is out side that float panel and the
  // float panels direct parent for example a click on a menu button
  let i = visiblePanels.length;

  while (i--) {
    const panel = visiblePanels[i], clickCtrl = panel.getParentCtrl(e.target);

    if (panel.settings.autohide) {
      if (clickCtrl) {
        if (isChildOf(clickCtrl, panel) || panel.parent() === clickCtrl) {
          continue;
        }
      }

      e = panel.fire('autohide', { target: e.target });
      if (!e.isDefaultPrevented()) {
        panel.hide();
      }
    }
  }
}

function bindDocumentClickHandler() {

  if (!documentClickHandler) {
    documentClickHandler = function (e) {
      // Gecko fires click event and in the wrong order on Mac so lets normalize
      if (e.button === 2) {
        return;
      }

      skipOrHidePanels(e);
    };

    DomQuery(document).on('click touchstart', documentClickHandler);
  }
}

function bindDocumentScrollHandler() {
  if (!documentScrollHandler) {
    documentScrollHandler = function () {
      let i;

      i = visiblePanels.length;
      while (i--) {
        repositionPanel(visiblePanels[i]);
      }
    };

    DomQuery(window).on('scroll', documentScrollHandler);
  }
}

function bindWindowResizeHandler() {
  if (!windowResizeHandler) {
    const docElm = document.documentElement;
    let clientWidth = docElm.clientWidth, clientHeight = docElm.clientHeight;

    windowResizeHandler = function () {
      // Workaround for #7065 IE 7 fires resize events event though the window wasn't resized
      if (!document.all || clientWidth !== docElm.clientWidth || clientHeight !== docElm.clientHeight) {
        clientWidth = docElm.clientWidth;
        clientHeight = docElm.clientHeight;
        FloatPanel.hideAll();
      }
    };

    DomQuery(window).on('resize', windowResizeHandler);
  }
}

/**
 * Repositions the panel to the top of page if the panel is outside of the visual viewport. It will
 * also reposition all child panels of the current panel.
 */
function repositionPanel(panel) {
  const scrollY = DomUtils.getViewPort().y;

  function toggleFixedChildPanels(fixed, deltaY) {
    let parent;

    for (let i = 0; i < visiblePanels.length; i++) {
      if (visiblePanels[i] !== panel) {
        parent = visiblePanels[i].parent();

        while (parent && (parent = parent.parent())) {
          if (parent === panel) {
            visiblePanels[i].fixed(fixed).moveBy(0, deltaY).repaint();
          }
        }
      }
    }
  }

  if (panel.settings.autofix) {
    if (!panel.state.get('fixed')) {
      panel._autoFixY = panel.layoutRect().y;

      if (panel._autoFixY < scrollY) {
        panel.fixed(true).layoutRect({ y: 0 }).repaint();
        toggleFixedChildPanels(true, scrollY - panel._autoFixY);
      }
    } else {
      if (panel._autoFixY > scrollY) {
        panel.fixed(false).layoutRect({ y: panel._autoFixY }).repaint();
        toggleFixedChildPanels(false, panel._autoFixY - scrollY);
      }
    }
  }
}

function addRemove(add, ctrl) {
  let i, zIndex = FloatPanel.zIndex || 0xFFFF, topModal;

  if (add) {
    zOrder.push(ctrl);
  } else {
    i = zOrder.length;

    while (i--) {
      if (zOrder[i] === ctrl) {
        zOrder.splice(i, 1);
      }
    }
  }

  if (zOrder.length) {
    for (i = 0; i < zOrder.length; i++) {
      if (zOrder[i].modal) {
        zIndex++;
        topModal = zOrder[i];
      }

      zOrder[i].getEl().style.zIndex = zIndex;
      zOrder[i].zIndex = zIndex;
      zIndex++;
    }
  }

  const modalBlockEl = DomQuery('#' + ctrl.classPrefix + 'modal-block', ctrl.getContainerElm())[0];

  if (topModal) {
    DomQuery(modalBlockEl).css('z-index', topModal.zIndex - 1);
  } else if (modalBlockEl) {
    modalBlockEl.parentNode.removeChild(modalBlockEl);
    hasModal = false;
  }

  FloatPanel.currentZIndex = zIndex;
}

const FloatPanel = Panel.extend({
  Mixins: [Movable, Resizable],

  /**
   * Constructs a new control instance with the specified settings.
   *
   * @constructor
   * @param {Object} settings Name/value object with settings.
   * @setting {Boolean} autohide Automatically hide the panel.
   */
  init (settings) {
    const self = this;

    self._super(settings);
    self._eventsRoot = self;

    self.classes.add('floatpanel');

    // Hide floatpanes on click out side the root button
    if (settings.autohide) {
      bindDocumentClickHandler();
      bindWindowResizeHandler();
      visiblePanels.push(self);
    }

    if (settings.autofix) {
      bindDocumentScrollHandler();

      self.on('move', function () {
        repositionPanel(this);
      });
    }

    self.on('postrender show', function (e) {
      if (e.control === self) {
        let $modalBlockEl;
        const prefix = self.classPrefix;

        if (self.modal && !hasModal) {
          $modalBlockEl = DomQuery('#' + prefix + 'modal-block', self.getContainerElm());
          if (!$modalBlockEl[0]) {
            $modalBlockEl = DomQuery(
              '<div id="' + prefix + 'modal-block" class="' + prefix + 'reset ' + prefix + 'fade"></div>'
            ).appendTo(self.getContainerElm());
          }

          Delay.setTimeout(function () {
            $modalBlockEl.addClass(prefix + 'in');
            DomQuery(self.getEl()).addClass(prefix + 'in');
          });

          hasModal = true;
        }

        addRemove(true, self);
      }
    });

    self.on('show', function () {
      self.parents().each(function (ctrl) {
        if (ctrl.state.get('fixed')) {
          self.fixed(true);
          return false;
        }
      });
    });

    if (settings.popover) {
      self._preBodyHtml = '<div class="' + self.classPrefix + 'arrow"></div>';
      self.classes.add('popover').add('bottom').add(self.isRtl() ? 'end' : 'start');
    }

    self.aria('label', settings.ariaLabel);
    self.aria('labelledby', self._id);
    self.aria('describedby', self.describedBy || self._id + '-none');
  },

  fixed (state) {
    const self = this;

    if (self.state.get('fixed') !== state) {
      if (self.state.get('rendered')) {
        const viewport = DomUtils.getViewPort();

        if (state) {
          self.layoutRect().y -= viewport.y;
        } else {
          self.layoutRect().y += viewport.y;
        }
      }

      self.classes.toggle('fixed', state);
      self.state.set('fixed', state);
    }

    return self;
  },

  /**
   * Shows the current float panel.
   *
   * @method show
   * @return {tinymce.ui.FloatPanel} Current floatpanel instance.
   */
  show () {
    const self = this;
    let i;
    const state = self._super();

    i = visiblePanels.length;
    while (i--) {
      if (visiblePanels[i] === self) {
        break;
      }
    }

    if (i === -1) {
      visiblePanels.push(self);
    }

    return state;
  },

  /**
   * Hides the current float panel.
   *
   * @method hide
   * @return {tinymce.ui.FloatPanel} Current floatpanel instance.
   */
  hide () {
    removeVisiblePanel(this);
    addRemove(false, this);

    return this._super();
  },

  /**
   * Hide all visible float panels with he autohide setting enabled. This is for
   * manually hiding floating menus or panels.
   *
   * @method hideAll
   */
  hideAll () {
    FloatPanel.hideAll();
  },

  /**
   * Closes the float panel. This will remove the float panel from page and fire the close event.
   *
   * @method close
   */
  close () {
    const self = this;

    if (!self.fire('close').isDefaultPrevented()) {
      self.remove();
      addRemove(false, self);
    }

    return self;
  },

  /**
   * Removes the float panel from page.
   *
   * @method remove
   */
  remove () {
    removeVisiblePanel(this);
    this._super();
  },

  postRender () {
    const self = this;

    if (self.settings.bodyRole) {
      this.getEl('body').setAttribute('role', self.settings.bodyRole);
    }

    return self._super();
  }
});

/**
 * Hide all visible float panels with he autohide setting enabled. This is for
 * manually hiding floating menus or panels.
 *
 * @static
 * @method hideAll
 */
FloatPanel.hideAll = function () {
  let i = visiblePanels.length;

  while (i--) {
    const panel = visiblePanels[i];

    if (panel && panel.settings.autohide) {
      panel.hide();
      visiblePanels.splice(i, 1);
    }
  }
};

function removeVisiblePanel(panel) {
  let i;

  i = visiblePanels.length;
  while (i--) {
    if (visiblePanels[i] === panel) {
      visiblePanels.splice(i, 1);
    }
  }

  i = zOrder.length;
  while (i--) {
    if (zOrder[i] === panel) {
      zOrder.splice(i, 1);
    }
  }
}

export default FloatPanel;