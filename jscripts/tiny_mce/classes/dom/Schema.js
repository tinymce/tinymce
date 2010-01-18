/**
 * Schema.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	var transitional = {};

	/**
	 * Unpacks the specified lookup and string data it will also parse it into an object
	 * map with sub object for it's children. This will later also include the attributes.
	 */
	function unpack(lookup, data) {
		var key;

		function replace(value) {
			return value.replace(/[A-Z]+/g, function(key) {
				return replace(lookup[key]);
			});
		};

		// Unpack lookup
		for (key in lookup) {
			if (lookup.hasOwnProperty(key))
				lookup[key] = replace(lookup[key]);
		}

		// Unpack and parse data into object map
		replace(data).replace(/#/g, '#text').replace(/(\w+)\[([^\]]+)\]/g, function(str, name, children) {
			var i, map = {};

			children = children.split(/\|/);

			for (i = children.length - 1; i >= 0; i--)
				map[children[i]] = 1;

			transitional[name] = map;
		});
	};

	// This is the XHTML 1.0 transitional elements with it's children packed to reduce it's size
	// we will later include the attributes here and use it as a default for valid elements but it
	// requires us to rewrite the serializer engine
	unpack({
		Z : '#|H|K|N|O|P',
		Y : '#|X|form|R|Q',
		X : 'p|T|div|U|W|isindex|fieldset|table',
		W : 'pre|hr|blockquote|address|center|noframes',
		U : 'ul|ol|dl|menu|dir',
		ZC : '#|p|Y|div|U|W|table|br|span|bdo|object|applet|img|map|K|N|Q',
		T : 'h1|h2|h3|h4|h5|h6',
		ZB : '#|X|S|Q',
		S : 'R|P',
		ZA : '#|a|G|J|M|O|P',
		R : '#|a|H|K|N|O',
		Q : 'noscript|P',
		P : 'ins|del|script',
		O : 'input|select|textarea|label|button',
		N : 'M|L',
		M : 'em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym',
		L : 'sub|sup',
		K : 'J|I',
		J : 'tt|i|b|u|s|strike',
		I : 'big|small|font|basefont',
		H : 'G|F',
		G : 'br|span|bdo',
		F : 'object|applet|img|map|iframe'
	}, 'script[]' + 
		'style[]' + 
		'object[#|param|X|form|a|H|K|N|O|Q]' + 
		'param[]' + 
		'p[S]' + 
		'a[Z]' + 
		'br[]' + 
		'span[S]' + 
		'bdo[S]' + 
		'applet[#|param|X|form|a|H|K|N|O|Q]' + 
		'h1[S]' + 
		'img[]' + 
		'map[X|form|Q|area]' + 
		'h2[S]' + 
		'iframe[#|X|form|a|H|K|N|O|Q]' + 
		'h3[S]' + 
		'tt[S]' + 
		'i[S]' + 
		'b[S]' + 
		'u[S]' + 
		's[S]' + 
		'strike[S]' + 
		'big[S]' + 
		'small[S]' + 
		'font[S]' + 
		'basefont[]' + 
		'em[S]' + 
		'strong[S]' + 
		'dfn[S]' + 
		'code[S]' + 
		'q[S]' + 
		'samp[S]' + 
		'kbd[S]' + 
		'var[S]' + 
		'cite[S]' + 
		'abbr[S]' + 
		'acronym[S]' + 
		'sub[S]' + 
		'sup[S]' + 
		'input[]' + 
		'select[optgroup|option]' + 
		'optgroup[option]' + 
		'option[]' + 
		'textarea[]' + 
		'label[S]' + 
		'button[#|p|T|div|U|W|table|G|object|applet|img|map|K|N|Q]' + 
		'h4[S]' + 
		'ins[#|X|form|a|H|K|N|O|Q]' + 
		'h5[S]' + 
		'del[#|X|form|a|H|K|N|O|Q]' + 
		'h6[S]' + 
		'div[#|X|form|a|H|K|N|O|Q]' + 
		'ul[li]' + 
		'li[#|X|form|a|H|K|N|O|Q]' + 
		'ol[li]' + 
		'dl[dt|dd]' + 
		'dt[S]' + 
		'dd[#|X|form|a|H|K|N|O|Q]' + 
		'menu[li]' + 
		'dir[li]' + 
		'pre[ZA]' + 
		'hr[]' + 
		'blockquote[#|X|form|a|H|K|N|O|Q]' + 
		'address[S|p]' + 
		'center[#|X|form|a|H|K|N|O|Q]' + 
		'noframes[#|X|form|a|H|K|N|O|Q]' + 
		'isindex[]' + 
		'fieldset[#|legend|X|form|a|H|K|N|O|Q]' + 
		'legend[S]' + 
		'table[caption|col|colgroup|thead|tfoot|tbody|tr]' + 
		'caption[S]' + 
		'col[]' + 
		'colgroup[col]' + 
		'thead[tr]' + 
		'tr[th|td]' + 
		'th[#|X|form|a|H|K|N|O|Q]' + 
		'form[#|X|a|H|K|N|O|Q]' + 
		'noscript[#|X|form|a|H|K|N|O|Q]' + 
		'td[#|X|form|a|H|K|N|O|Q]' + 
		'tfoot[tr]' + 
		'tbody[tr]' + 
		'area[]' + 
		'base[]' + 
		'body[#|X|form|a|H|K|N|O|Q]'
	);

	/**
	 * Schema validator class.
	 *
	 * @class tinymce.dom.Schema
	 * @example
	 *  if (tinymce.activeEditor.schema.isValid('p', 'span'))
	 *    alert('span is valid child of p.');
	 */
	tinymce.dom.Schema = function() {
		var t = this, elements = transitional;

		/**
		 * Returns true/false if the specified element and optionally it's child is valid or not
		 * according to the XHTML transitional DTD.
		 *
		 * @method isValid
		 * @param {String} name Element name to check for.
		 * @param {String} child_name Element child name to check for.
		 * @return {boolean} true/false if the element is valid or not.
		 */
		t.isValid = function(name, child_name) {
			var element = elements[name];

			return !!(element && (!child_name || element[child_name]));
		};
	};
})();