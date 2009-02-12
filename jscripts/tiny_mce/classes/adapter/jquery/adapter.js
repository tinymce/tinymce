/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 *
 * This file contains all adapter logic needed to use jQuery as the base API for TinyMCE.
 */

// #ifdef jquery_adapter

(function($) {
	var is = tinymce.is;

	if (!window.jQuery)
		return alert("Load jQuery first!");

	// Patch in core NS functions
	tinymce.extend = $.extend;
	tinymce.extend(tinymce, {
		trim : $.trim,
		map : $.map,
		grep : function(a, f) {return $.grep(a, f || function(){return 1;});},
		inArray : function(a, v) {return $.inArray(v, a || []);},
		each : function(o, cb, s) {
			if (!o)
				return 0;

			var r = 1;

			$.each(o, function(nr, el){
				if (cb.call(s, el, nr, o) === false) {
					r = 0;
					return false;
				}
			});

			return r;
		}
	});

	// Patch in functions in various clases
	// Add a "#ifndefjquery" statement around each core API function you add below
	var patches = {
		'tinymce.dom.DOMUtils' : {
			addClass : function(e, c) {
				if (is(e, 'array') && is(e[0], 'string'))
					e = e.join(',#');
				return (e && $(is(e, 'string') ? '#' + e : e)
					.addClass(c)
					.attr('class')) || false;
			},

			hasClass : function(n, c) {
				return $(is(n, 'string') ? '#' + n : n).hasClass(c);
			},

			removeClass : function(e, c) {
				if (!e)
					return false;

				var r = [];

				$(is(e, 'string') ? '#' + e : e)
					.removeClass(c)
					.each(function(){
						r.push(this.className);
					});

				return r.length == 1 ? r[0] : r;
			},

			select : function(p, c) {
				return tinymce.grep($(p));
			},

			show : function(e) {
				if (is(e, 'array') && is(e[0], 'string'))
					e = e.join(',#');

				$(is(e, 'string') ? '#' + e : e).css('display', 'block');
			},

			hide : function(e) {
				if (is(e, 'array') && is(e[0], 'string'))
					e = e.join(',#');

				$(is(e, 'string') ? '#' + e : e).css('display', 'none');
			},

			isHidden : function(e) {
				return $(is(e, 'string') ? '#' + e : e).is(':hidden');
			},

			insertAfter : function(n, e) {
				return $(is(e, 'string') ? '#' + e : e).after(n);
			},

			replace : function(o, n, k) {
				n = $(is(n, 'string') ? '#' + n : n);

				if (k)
					n.children().appendTo(o);

				n.replaceWith(o);
			},

			setStyle : function(n, na, v) {
				if (is(n, 'array') && is(n[0], 'string'))
					n = n.join(',#');

				$(is(n, 'string') ? '#' + n : n).css(na, v);
			},

			getStyle : function(n, na, c) {
				return $(is(n, 'string') ? '#' + n : n).css(na);
			},

			setStyles : function(e, o) {
				if (is(e, 'array') && is(e[0], 'string'))
					e = e.join(',#');
				$(is(e, 'string') ? '#' + e : e).css(o);
			},

			setAttrib : function(e, n, v) {
				var t = this, s = t.settings;

				if (is(e, 'array') && is(e[0], 'string'))
					e = e.join(',#');

				e = $(is(e, 'string') ? '#' + e : e);

				switch (n) {
					case "style":
						e.each(function(i, v){
							if (s.keep_values)
								$(v).attr('mce_style', v);

							v.style.cssText = v;
						});
						break;

					case "class":
						e.each(function(){
							this.className = v;
						});
						break;

					case "src":
					case "href":
						e.each(function(i, v){
							if (s.keep_values) {
								if (s.url_converter)
									v = s.url_converter.call(s.url_converter_scope || t, v, n, v);

								t.setAttrib(v, 'mce_' + n, v);
							}
						});

						break;
				}

				if (v !== null && v.length !== 0)
					e.attr(n, '' + v);
				else
					e.removeAttr(n);
			},

			setAttribs : function(e, o) {
				var t = this;

				$.each(o, function(n, v){
					t.setAttrib(e,n,v);
				});
			}
		},

		'tinymce.dom.Event' : {
			add : function (o, n, f, s) {
				var lo, cb;

				cb = function(e) {
					e.target = e.target || this;
					f.call(s || this, e);
				};

				if (is(o, 'array') && is(o[0], 'string'))
					o = o.join(',#');
				o = $(is(o, 'string') ? '#' + o : o);
				if (n == 'init') {
					o.ready(cb, s);
				} else {
					if (s) {
						o.bind(n, s, cb);
					} else {
						o.bind(n, cb);
					}
				}

				lo = this._jqLookup || (this._jqLookup = []);
				lo.push({func : f, cfunc : cb});

				return cb;
			},

			remove : function(o, n, f) {
				// Find cfunc
				$(this._jqLookup).each(function() {
					if (this.func === f)
						f = this.cfunc;
				});

				if (is(o, 'array') && is(o[0], 'string'))
					o = o.join(',#');

				$(is(o, 'string') ? '#' + o : o).unbind(n,f);

				return true;
			}
		}
	};

	// Patch functions after a class is created
	tinymce.onCreate = function(ty, c, p) {
		tinymce.extend(p, patches[c]);
	};
})(jQuery);

// #endif
