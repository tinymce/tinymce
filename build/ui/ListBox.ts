/**
 * ListBox.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import MenuButton from './MenuButton';
import Menu from './Menu';
import Tools from 'tinymce/core/api/util/Tools';

/**
 * Creates a new list box control.
 *
 * @-x-less ListBox.less
 * @class tinymce.ui.ListBox
 * @extends tinymce.ui.MenuButton
 */

export default MenuButton.extend({
  /**
   * Constructs a instance with the specified settings.
   *
   * @constructor
   * @param {Object} settings Name/value object with settings.
   * @setting {Array} values Array with values to add to list box.
   */
  init (settings) {
    const self = this;
    let values, selected, selectedText, lastItemCtrl;

    function setSelected(menuValues) {
      // Try to find a selected value
      for (let i = 0; i < menuValues.length; i++) {
        selected = menuValues[i].selected || settings.value === menuValues[i].value;

        if (selected) {
          selectedText = selectedText || menuValues[i].text;
          self.state.set('value', menuValues[i].value);
          return true;
        }

        // If the value has a submenu, try to find the selected values in that menu
        if (menuValues[i].menu) {
          if (setSelected(menuValues[i].menu)) {
            return true;
          }
        }
      }
    }

    self._super(settings);
    settings = self.settings;

    self._values = values = settings.values;
    if (values) {
      if (typeof settings.value !== 'undefined') {
        setSelected(values);
      }

      // Default with first item
      if (!selected && values.length > 0) {
        selectedText = values[0].text;
        self.state.set('value', values[0].value);
      }

      self.state.set('menu', values);
    }

    self.state.set('text', settings.text || selectedText);

    self.classes.add('listbox');

    self.on('select', function (e) {
      const ctrl = e.control;

      if (lastItemCtrl) {
        e.lastControl = lastItemCtrl;
      }

      if (settings.multiple) {
        ctrl.active(!ctrl.active());
      } else {
        self.value(e.control.value());
      }

      lastItemCtrl = ctrl;
    });
  },

  // tslint:disable-next-line:object-literal-shorthand
  value: function (value) {
    if (arguments.length === 0) {
      return this.state.get('value');
    }

    if (typeof value === 'undefined') {
      return this;
    }

    if (this.settings.values) {
      const matchingValues = Tools.grep(this.settings.values, (a) => a.value === value);
      if (matchingValues.length > 0) {
        this.state.set('value', value);
      } else if (value === null) {
        this.state.set('value', null);
      }
    } else {
      this.state.set('value', value);
    }

    return this;
  },

  /**
   * Getter/setter function for the control value.
   *
   * @method value
   * @param {String} [value] Value to be set.
   * @return {Boolean/tinymce.ui.ListBox} Value or self if it's a set operation.
   */
  bindStates () {
    const self = this;

    function activateMenuItemsByValue(menu, value) {
      if (menu instanceof Menu) {
        menu.items().each(function (ctrl) {
          if (!ctrl.hasMenus()) {
            ctrl.active(ctrl.value() === value);
          }
        });
      }
    }

    function getSelectedItem(menuValues, value) {
      let selectedItem;

      if (!menuValues) {
        return;
      }

      for (let i = 0; i < menuValues.length; i++) {
        if (menuValues[i].value === value) {
          return menuValues[i];
        }

        if (menuValues[i].menu) {
          selectedItem = getSelectedItem(menuValues[i].menu, value);
          if (selectedItem) {
            return selectedItem;
          }
        }
      }
    }

    self.on('show', function (e) {
      activateMenuItemsByValue(e.control, self.value());
    });

    self.state.on('change:value', function (e) {
      const selectedItem = getSelectedItem(self.state.get('menu'), e.value);

      if (selectedItem) {
        self.text(selectedItem.text);
      } else {
        self.text(self.settings.text);
      }
    });

    return self._super();
  }
});