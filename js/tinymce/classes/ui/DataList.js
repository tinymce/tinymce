/**
 * Datalist.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 * Copyright (c) 2015 Ryan Demmer. All rights reserved
 */

/**
 * This class creates a datalist control.
 * @-x-less DataList.less
 * @class tinymce.ui.DataList
 * @extends tinymce.ui.ComboBox
 */
define("tinymce/ui/DataList", [
	"tinymce/ui/ComboBox",
	"tinymce/util/Tools"
], function(ComboBox, Tools) {
	"use strict";
	
    var specialKeyCodeMap = {
        9: 'tab',
        17: 'ctrl',
        18: 'alt',
        27: 'esc',
        32: 'space',
        13: 'enter',
        91: 'cmd'
    };

    /**
     * This class creates a Datalist control.
     *
     * @class tinymce.ui.Datalist
     * @extends tinymce.ui.ComboBox
     */

    return ComboBox.extend({
        /**
         * Constructs a instance with the specified settings.
         *
         * @constructor
         * @param {Object} settings Name/value object with settings.
         * @setting {Boolean} multiple True if the datalist allows multiple values.
         * @setting {String} seperator Value seperator.
         */
        init: function (settings) {
            var self = this;

            // value seperator
            settings.seperator = settings.seperator || '';
            // allow multiple values seperated by seperator
            settings.multiple = settings.multiple || false;

            self._super(settings);

            self.classes.add('datalist');
        },
        /**
         * Getter/setter function for the control value.
         *
         * @method value
         * @param {String} [value] Value to be set.
         * @return {String|tinymce.ui.Datalist} Value or self if it's a set operation.
         */
        value: function (value) {
            var settings = this.settings, seperator = settings.seperator, multiple = settings.multiple;

            if (typeof value !== 'undefined') {

                if (seperator && multiple) {
                    var v = Tools.trim(this.state.get('value'));

                    // value triggered by keycode, replace word fragment with value
                    if (this.state.get('keyCode')) {
                        value = v.substr(0, v.lastIndexOf(seperator)) + seperator + value;
                        // add input to existing value
                    } else {
                        value = v + seperator + value;
                    }
                }

                this.state.set('value', Tools.trim(value));

                if (this.state.get('rendered')) {
                    this.getEl().value = Tools.trim(value);
                }

                return this;
            }

            return this.state.get('value');
        },
        /**
         * Gets invoked after the control has been rendered.
         *
         * @method postRender
         */
        postRender: function () {
            var self = this, seperator = self.settings.seperator, multiple = self.settings.multiple;

            self.on('click', function (e) {
                if (self.menu) {
                    self.menu.items().removeClass('datalist-item-hidden');
                }
            });

            // cancel typing state when menu is opened with a click
            self.on('action', function () {
                self.state.set('keyCode', null);
                
                // allow a moment for the menu to b created
                window.setTimeout(function () {
                    if (self.menu) {
                        self.menu.items().each(function (ctrl) {
                            var values = self.value().split(seperator);

                            if (values.length) {
                                ctrl.active(values.indexOf(ctrl.value()) >= 0);
                            }
                        });
                    }
                }, 10);
            });

            // http://stackoverflow.com/a/6969486
            function escapeRegExChars(str) {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
            }

            var keyup = function (e) {
                if (e.control === self && e.target === self.getEl('inp')) {
                    // skip some input values
                    if (e.keyCode && specialKeyCodeMap[e.keyCode]) {
                        return;
                    }

                    // show menu to create etc.
                    self.showMenu();

                    var matches = self.menu.items().length;

                    // get input value
                    var value = e.target.value;

                    if (value === "") {
                        return self.menu.hide();
                    }

                    // set keyCode flag
                    self.state.set('keyCode', e.keyCode);

                    var len = self.menu.items().length;

                    if (multiple && seperator) {
                        var n = value.lastIndexOf(seperator);
                        // get keyboard input
                        if (n !== -1) {
                            value = Tools.trim(value.substring(n));
                        }
                    }

                    // create matcher regular expression, eg: /^value/i
                    var matcher = new RegExp('^' + escapeRegExChars(value), "i");

                    // check each menu item for match and toggle as appropriate
                    self.menu.items().each(function (item) {
                        var s = matcher.test(item.value()) || matcher.test(item.text());

                        if (!s) {
                            matches--;
                        }

                        item.classes.toggle('datalist-item-hidden', !s);
                    });

                    if (matches === 0) {
                        self.menu.hide();
                    }
                }
            };

            self.on('keyup paste cut', keyup);

            return self._super();
        }
    });
});