/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2006, Moxiecode Systems AB, All rights reserved.
 */

/**
 * Constructor for the menu layer class.
 */
function TinyMCE_Menu() {
	var id;

	if (typeof(tinyMCE.menuCounter) == "undefined")
		tinyMCE.menuCounter = 0;

	id = "mc_menu_" + tinyMCE.menuCounter++;

	TinyMCE_Layer.call(this, id, true);

	this.id = id;
	this.items = new Array();
	this.needsUpdate = true;
};

// Extends the TinyMCE_Layer class
TinyMCE_Menu.prototype = tinyMCE.extend(TinyMCE_Layer.prototype, {
	/**
	 * Initializes the Menu with settings. This will also create the menu
	 * as a DIV element if it doesn't exists in the DOM.
	 *
	 * @param {Array} s Name/Value array with settings.
	 */
	init : function(s) {
		var n;

		// Default params
		this.settings = {
			separator_class : 'mceMenuSeparator',
			title_class : 'mceMenuTitle',
			disabled_class : 'mceMenuDisabled',
			menu_class : 'mceMenu',
			drop_menu : true
		};

		for (n in s)
			this.settings[n] = s[n];

		this.create('div', this.settings.menu_class);
	},

	/**
	 * Clears the menu.
	 */
	clear : function() {
		this.items = new Array();
	},

	/**
	 * Adds a menu title, this is a static item that can't be clicked.
	 *
	 * @param {string} t Text to add to title.
	 */
	addTitle : function(t) {
		this.add({type : 'title', text : t});
	},

	/**
	 * Adds a disabled menu item, this is a static item that can't be clicked.
	 *
	 * @param {string} t Text to add to title.
	 */
	addDisabled : function(t) {
		this.add({type : 'disabled', text : t});
	},

	/**
	 * Adds a menu separator line.
	 */
	addSeparator : function() {
		this.add({type : 'separator'});
	},

	/**
	 * Adds a menu item.
	 *
	 * @param {string} t Menu item text.
	 * @param {string} js JS string to evaluate on click.
	 */
	addItem : function(t, js) {
		this.add({text : t, js : js});
	},

	/**
	 * Adds a menu item object.
	 *
	 * @param {Object} mi Menu item object to add.
	 */
	add : function(mi) {
		this.items[this.items.length] = mi;
		this.needsUpdate = true;
	},

	/**
	 * Update the menu with new HTML contents.
	 */
	update : function() {
		var e = this.getElement(), h = '', i, t, m = this.items, s = this.settings;

		if (this.settings.drop_menu)
			h += '<span class="mceMenuLine"></span>';

		h += '<table border="0" cellpadding="0" cellspacing="0">';

		for (i=0; i<m.length; i++) {
			t = tinyMCE.xmlEncode(m[i].text);
			c = m[i].class_name ? ' class="' + m[i].class_name + '"' : '';

			switch (m[i].type) {
				case 'separator':
					h += '<tr class="' + s.separator_class + '"><td>';
					break;

				case 'title':
					h += '<tr class="' + s.title_class + '"><td><span' + c +'>' + t + '</span>';
					break;

				case 'disabled':
					h += '<tr class="' + s.disabled_class + '"><td><span' + c +'>' + t + '</span>';
					break;

				default:
					h += '<tr><td><a href="javascript:void(0);" onmousedown="' + tinyMCE.xmlEncode(m[i].js) + ';return false;"><span' + c +'>' + t + '</span></a>';
			}

			h += '</td></tr>';
		}

		h += '</table>';

		e.innerHTML = h;

		this.needsUpdate = false;
		this.updateBlocker();
	},

	/**
	 * Displays the menu. This function will automaticly hide any previously visible menus.
	 */
	show : function() {
		var nl, i;

		if (tinyMCE.lastMenu == this)
			return;

		if (this.needsUpdate)
			this.update();

		if (tinyMCE.lastMenu && tinyMCE.lastMenu != this)
			tinyMCE.lastMenu.hide();

		TinyMCE_Layer.prototype.show.call(this);

		if (!tinyMCE.isOpera) {
			// Accessibility stuff
/*			nl = this.getElement().getElementsByTagName("a");
			if (nl.length > 0)
				nl[0].focus();*/
		}

		tinyMCE.lastMenu = this;
	}
});
