/**
 * adapter.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

// #ifdef jquery_adapter

(function($, tinymce) {
	var is = tinymce.is, attrRegExp = /^(href|src|style)$/i, undefined;

	// jQuery is undefined
	if (!$)
		return alert("Load jQuery first!");

	// Stick jQuery into the tinymce namespace
	tinymce.$ = $;

	// Setup adapter
	tinymce.adapter = {
		patchEditor : function(editor) {
			var fn = $.fn;

			// Adapt the css function to make sure that the _mce_style
			// attribute gets updated with the new style information
			function css(name, value) {
				var self = this;

				// Remove _mce_style when set operation occurs
				if (value)
					self.removeAttr('_mce_style');

				return fn.css.apply(self, arguments);
			};

			// Apapt the attr function to make sure that it uses the _mce_ prefixed variants
			function attr(name, value) {
				var self = this;

				// Update/retrive _mce_ attribute variants
				if (attrRegExp.test(name)) {
					if (value !== undefined) {
						// Use TinyMCE behavior when setting the specifc attributes
						self.each(function(i, node) {
							editor.dom.setAttrib(node, name, value);
						});

						return self;
					} else
						return self.attr('_mce_' + name);
				}

				// Default behavior
				return fn.attr.apply(self, arguments);
			};

			function htmlPatchFunc(func) {
				// Returns a modified function that processes
				// the HTML before executing the action this makes sure
				// that href/src etc gets moved into the _mce_ variants
				return function(content) {
					if (content)
						content = editor.dom.processHTML(content);

					return func.call(this, content);
				};
			};

			// Patch various jQuery functions to handle tinymce specific attribute and content behavior
			// we don't patch the jQuery.fn directly since it will most likely break compatibility
			// with other jQuery logic on the page. Only instances created by TinyMCE should be patched.
			function patch(jq) {
				// Patch some functions, only patch the object once
				if (jq.css !== css) {
					// Patch css/attr to use the _mce_ prefixed attribute variants
					jq.css = css;
					jq.attr = attr;

					// Patch HTML functions to use the DOMUtils.processHTML filter logic
					jq.html = htmlPatchFunc(fn.html);
					jq.append = htmlPatchFunc(fn.append);
					jq.prepend = htmlPatchFunc(fn.prepend);
					jq.after = htmlPatchFunc(fn.after);
					jq.before = htmlPatchFunc(fn.before);
					jq.replaceWith = htmlPatchFunc(fn.replaceWith);
					jq.tinymce = editor;

					// Each pushed jQuery instance needs to be patched
					// as well for example when traversing the DOM
					jq.pushStack = function() {
						return patch(fn.pushStack.apply(this, arguments));
					};
				}

				return jq;
			};

			// Add a $ function on each editor instance this one is scoped for the editor document object
			// this way you can do chaining like this tinymce.get(0).$('p').append('text').css('color', 'red');
			editor.$ = function(selector, scope) {
				var doc = editor.getDoc();

				return patch($(selector || doc, doc || scope));
			};
		}
	};

	// Patch in core NS functions
	tinymce.extend = $.extend;
	tinymce.extend(tinymce, {
		map : $.map,
		grep : function(a, f) {return $.grep(a, f || function(){return 1;});},
		inArray : function(a, v) {return $.inArray(v, a || []);}

		/* Didn't iterate stylesheets
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
		}*/
	});

	// Patch in functions in various clases
	// Add a "#ifndefjquery" statement around each core API function you add below
	var patches = {
		'tinymce.dom.DOMUtils' : {
			/*
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
			*/

			select : function(pattern, scope) {
				var t = this;

				return $.find(pattern, t.get(scope) || t.get(t.settings.root_element) || t.doc, []);
			},

			is : function(n, patt) {
				return $(this.get(n)).is(patt);
			}

			/*
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
								$(v).attr('_mce_style', v);

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

								t.setAttrib(v, '_mce_' + n, v);
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
			*/
		}

/*
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
*/
	};

	// Patch functions after a class is created
	tinymce.onCreate = function(ty, c, p) {
		tinymce.extend(p, patches[c]);
	};
})(window.jQuery, tinymce);

// #endif
