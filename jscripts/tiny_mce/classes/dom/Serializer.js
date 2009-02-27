/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	// Shorten names
	var extend = tinymce.extend, each = tinymce.each, Dispatcher = tinymce.util.Dispatcher, isIE = tinymce.isIE, isGecko = tinymce.isGecko;

	function wildcardToRE(s) {
		return s.replace(/([?+*])/g, '.$1');
	};

	/**#@+
	 * @class This class is used to serialize DOM trees into a string.
	 * Consult the TinyMCE Wiki API for more details and examples on how to use this class.
	 * @member tinymce.dom.Serializer
	 */
	tinymce.create('tinymce.dom.Serializer', {
		/**
		 * Constucts a new DOM serializer class.
		 *
		 * @constructor
		 * @param {Object} s Optional name/Value collection of settings for the serializer.
		 */
		Serializer : function(s) {
			var t = this;

			t.key = 0;
			t.onPreProcess = new Dispatcher(t);
			t.onPostProcess = new Dispatcher(t);

			try {
				t.writer = new tinymce.dom.XMLWriter();
			} catch (ex) {
				// IE might throw exception if ActiveX is disabled so we then switch to the slightly slower StringWriter
				t.writer = new tinymce.dom.StringWriter();
			}

			// Default settings
			t.settings = s = extend({
				dom : tinymce.DOM,
				valid_nodes : 0,
				node_filter : 0,
				attr_filter : 0,
				invalid_attrs : /^(mce_|_moz_)/,
				closed : /(br|hr|input|meta|img|link|param)/,
				entity_encoding : 'named',
				entities : '160,nbsp,161,iexcl,162,cent,163,pound,164,curren,165,yen,166,brvbar,167,sect,168,uml,169,copy,170,ordf,171,laquo,172,not,173,shy,174,reg,175,macr,176,deg,177,plusmn,178,sup2,179,sup3,180,acute,181,micro,182,para,183,middot,184,cedil,185,sup1,186,ordm,187,raquo,188,frac14,189,frac12,190,frac34,191,iquest,192,Agrave,193,Aacute,194,Acirc,195,Atilde,196,Auml,197,Aring,198,AElig,199,Ccedil,200,Egrave,201,Eacute,202,Ecirc,203,Euml,204,Igrave,205,Iacute,206,Icirc,207,Iuml,208,ETH,209,Ntilde,210,Ograve,211,Oacute,212,Ocirc,213,Otilde,214,Ouml,215,times,216,Oslash,217,Ugrave,218,Uacute,219,Ucirc,220,Uuml,221,Yacute,222,THORN,223,szlig,224,agrave,225,aacute,226,acirc,227,atilde,228,auml,229,aring,230,aelig,231,ccedil,232,egrave,233,eacute,234,ecirc,235,euml,236,igrave,237,iacute,238,icirc,239,iuml,240,eth,241,ntilde,242,ograve,243,oacute,244,ocirc,245,otilde,246,ouml,247,divide,248,oslash,249,ugrave,250,uacute,251,ucirc,252,uuml,253,yacute,254,thorn,255,yuml,402,fnof,913,Alpha,914,Beta,915,Gamma,916,Delta,917,Epsilon,918,Zeta,919,Eta,920,Theta,921,Iota,922,Kappa,923,Lambda,924,Mu,925,Nu,926,Xi,927,Omicron,928,Pi,929,Rho,931,Sigma,932,Tau,933,Upsilon,934,Phi,935,Chi,936,Psi,937,Omega,945,alpha,946,beta,947,gamma,948,delta,949,epsilon,950,zeta,951,eta,952,theta,953,iota,954,kappa,955,lambda,956,mu,957,nu,958,xi,959,omicron,960,pi,961,rho,962,sigmaf,963,sigma,964,tau,965,upsilon,966,phi,967,chi,968,psi,969,omega,977,thetasym,978,upsih,982,piv,8226,bull,8230,hellip,8242,prime,8243,Prime,8254,oline,8260,frasl,8472,weierp,8465,image,8476,real,8482,trade,8501,alefsym,8592,larr,8593,uarr,8594,rarr,8595,darr,8596,harr,8629,crarr,8656,lArr,8657,uArr,8658,rArr,8659,dArr,8660,hArr,8704,forall,8706,part,8707,exist,8709,empty,8711,nabla,8712,isin,8713,notin,8715,ni,8719,prod,8721,sum,8722,minus,8727,lowast,8730,radic,8733,prop,8734,infin,8736,ang,8743,and,8744,or,8745,cap,8746,cup,8747,int,8756,there4,8764,sim,8773,cong,8776,asymp,8800,ne,8801,equiv,8804,le,8805,ge,8834,sub,8835,sup,8836,nsub,8838,sube,8839,supe,8853,oplus,8855,otimes,8869,perp,8901,sdot,8968,lceil,8969,rceil,8970,lfloor,8971,rfloor,9001,lang,9002,rang,9674,loz,9824,spades,9827,clubs,9829,hearts,9830,diams,338,OElig,339,oelig,352,Scaron,353,scaron,376,Yuml,710,circ,732,tilde,8194,ensp,8195,emsp,8201,thinsp,8204,zwnj,8205,zwj,8206,lrm,8207,rlm,8211,ndash,8212,mdash,8216,lsquo,8217,rsquo,8218,sbquo,8220,ldquo,8221,rdquo,8222,bdquo,8224,dagger,8225,Dagger,8240,permil,8249,lsaquo,8250,rsaquo,8364,euro',
				bool_attrs : /(checked|disabled|readonly|selected|nowrap)/,
				valid_elements : '*[*]',
				extended_valid_elements : 0,
				valid_child_elements : 0,
				invalid_elements : 0,
				fix_table_elements : 1,
				fix_list_elements : true,
				fix_content_duplication : true,
				convert_fonts_to_spans : false,
				font_size_classes : 0,
				font_size_style_values : 0,
				apply_source_formatting : 0,
				indent_mode : 'simple',
				indent_char : '\t',
				indent_levels : 1,
				remove_linebreaks : 1,
				remove_redundant_brs : 1,
				element_format : 'xhtml'
			}, s);

			t.dom = s.dom;

			if (s.remove_redundant_brs) {
				t.onPostProcess.add(function(se, o) {
					// Remove BR elements at end of list elements since they get rendered in IE
					o.content = o.content.replace(/<br \/>(\s*<\/li>)/g, '$1');
				});
			}

			// Remove XHTML element endings i.e. produce crap :) XHTML is better
			if (s.element_format == 'html') {
				t.onPostProcess.add(function(se, o) {
					o.content = o.content.replace(/<([^>]+) \/>/g, '<$1>');
				});
			}

			if (s.fix_list_elements) {
				t.onPreProcess.add(function(se, o) {
					var nl, x, a = ['ol', 'ul'], i, n, p, r = /^(OL|UL)$/, np;

					function prevNode(e, n) {
						var a = n.split(','), i;

						while ((e = e.previousSibling) != null) {
							for (i=0; i<a.length; i++) {
								if (e.nodeName == a[i])
									return e;
							}
						}

						return null;
					};

					for (x=0; x<a.length; x++) {
						nl = t.dom.select(a[x], o.node);

						for (i=0; i<nl.length; i++) {
							n = nl[i];
							p = n.parentNode;

							if (r.test(p.nodeName)) {
								np = prevNode(n, 'LI');

								if (!np) {
									np = t.dom.create('li');
									np.innerHTML = '&nbsp;';
									np.appendChild(n);
									p.insertBefore(np, p.firstChild);
								} else
									np.appendChild(n);
							}
						}
					}
				});
			}

			if (s.fix_table_elements) {
				t.onPreProcess.add(function(se, o) {
					each(t.dom.select('p table', o.node), function(n) {
						t.dom.split(t.dom.getParent(n, 'p'), n);
					});
				});
			}
		},

		/**#@+
		 * @method
		 */

		/**
		 * Sets a list of entities to use for the named entity encoded.
		 *
		 * @param {String} s List of entities in the following format: number,name,....
		 */
		setEntities : function(s) {
			var t = this, a, i, l = {}, re = '', v;

			// No need to setup more than once
			if (t.entityLookup)
				return;

			// Build regex and lookup array
			a = s.split(',');
			for (i = 0; i < a.length; i += 2) {
				v = a[i];

				// Don't add default &amp; &quot; etc.
				if (v == 34 || v == 38 || v == 60 || v == 62)
					continue;

				l[String.fromCharCode(a[i])] = a[i + 1];

				v = parseInt(a[i]).toString(16);
				re += '\\u' + '0000'.substring(v.length) + v;
			}

			if (!re) {
				t.settings.entity_encoding = 'raw';
				return;
			}

			t.entitiesRE = new RegExp('[' + re + ']', 'g');
			t.entityLookup = l;
		},

		/**
		 * Sets the valid child rules. This enables you to specify what elements can be childrens of what parents.
		 * Consult the Wiki for format description on this input.
		 *
		 * @param {String} s String with valid child rules.
		 */
		setValidChildRules : function(s) {
			this.childRules = null;
			this.addValidChildRules(s);
		},

		/**
		 * Adds valid child rules. This enables you to specify what elements can be childrens of what parents.
		 * Consult the Wiki for format description on this input.
		 *
		 * @param {String} s String with valid child rules to add.
		 */
		addValidChildRules : function(s) {
			var t = this, inst, intr, bloc;

			if (!s)
				return;

			inst = 'A|BR|SPAN|BDO|MAP|OBJECT|IMG|TT|I|B|BIG|SMALL|EM|STRONG|DFN|CODE|Q|SAMP|KBD|VAR|CITE|ABBR|ACRONYM|SUB|SUP|#text|#comment';
			intr = 'A|BR|SPAN|BDO|OBJECT|APPLET|IMG|MAP|IFRAME|TT|I|B|U|S|STRIKE|BIG|SMALL|FONT|BASEFONT|EM|STRONG|DFN|CODE|Q|SAMP|KBD|VAR|CITE|ABBR|ACRONYM|SUB|SUP|INPUT|SELECT|TEXTAREA|LABEL|BUTTON|#text|#comment';
			bloc = 'H[1-6]|P|DIV|ADDRESS|PRE|FORM|TABLE|LI|OL|UL|TD|CAPTION|BLOCKQUOTE|CENTER|DL|DT|DD|DIR|FIELDSET|FORM|NOSCRIPT|NOFRAMES|MENU|ISINDEX|SAMP';

			each(s.split(','), function(s) {
				var p = s.split(/\[|\]/), re;

				s = '';
				each(p[1].split('|'), function(v) {
					if (s)
						s += '|';

					switch (v) {
						case '%itrans':
							v = intr;
							break;

						case '%itrans_na':
							v = intr.substring(2);
							break;

						case '%istrict':
							v = inst;
							break;

						case '%istrict_na':
							v = inst.substring(2);
							break;

						case '%btrans':
							v = bloc;
							break;

						case '%bstrict':
							v = bloc;
							break;
					}

					s += v;
				});
				re = new RegExp('^(' + s.toLowerCase() + ')$', 'i');

				each(p[0].split('/'), function(s) {
					t.childRules = t.childRules || {};
					t.childRules[s] = re;
				});
			});

			// Build regex
			s = '';
			each(t.childRules, function(v, k) {
				if (s)
					s += '|';

				s += k;
			});

			t.parentElementsRE = new RegExp('^(' + s.toLowerCase() + ')$', 'i');

			/*console.debug(t.parentElementsRE.toString());
			each(t.childRules, function(v) {
				console.debug(v.toString());
			});*/
		},

		/**
		 * Sets the valid elements rules of the serializer this enables you to specify things like what elements should be
		 * outputted and what attributes specific elements might have.
		 * Consult the Wiki for more details on this format.
		 *
		 * @param {String} s Valid elements rules string.
		 */
		setRules : function(s) {
			var t = this;

			t._setup();
			t.rules = {};
			t.wildRules = [];
			t.validElements = {};

			return t.addRules(s);
		},

		/**
		 * Adds valid elements rules to the serializer this enables you to specify things like what elements should be
		 * outputted and what attributes specific elements might have.
		 * Consult the Wiki for more details on this format.
		 *
		 * @param {String} s Valid elements rules string to add.
		 */
		addRules : function(s) {
			var t = this, dr;

			if (!s)
				return;

			t._setup();

			each(s.split(','), function(s) {
				var p = s.split(/\[|\]/), tn = p[0].split('/'), ra, at, wat, va = [];

				// Extend with default rules
				if (dr)
					at = tinymce.extend([], dr.attribs);

				// Parse attributes
				if (p.length > 1) {
					each(p[1].split('|'), function(s) {
						var ar = {}, i;

						at = at || [];

						// Parse attribute rule
						s = s.replace(/::/g, '~');
						s = /^([!\-])?([\w*.?~_\-]+|)([=:<])?(.+)?$/.exec(s);
						s[2] = s[2].replace(/~/g, ':');

						// Add required attributes
						if (s[1] == '!') {
							ra = ra || [];
							ra.push(s[2]);
						}

						// Remove inherited attributes
						if (s[1] == '-') {
							for (i = 0; i <at.length; i++) {
								if (at[i].name == s[2]) {
									at.splice(i, 1);
									return;
								}
							}
						}

						switch (s[3]) {
							// Add default attrib values
							case '=':
								ar.defaultVal = s[4] || '';
								break;

							// Add forced attrib values
							case ':':
								ar.forcedVal = s[4];
								break;

							// Add validation values
							case '<':
								ar.validVals = s[4].split('?');
								break;
						}

						if (/[*.?]/.test(s[2])) {
							wat = wat || [];
							ar.nameRE = new RegExp('^' + wildcardToRE(s[2]) + '$');
							wat.push(ar);
						} else {
							ar.name = s[2];
							at.push(ar);
						}

						va.push(s[2]);
					});
				}

				// Handle element names
				each(tn, function(s, i) {
					var pr = s.charAt(0), x = 1, ru = {};

					// Extend with default rule data
					if (dr) {
						if (dr.noEmpty)
							ru.noEmpty = dr.noEmpty;

						if (dr.fullEnd)
							ru.fullEnd = dr.fullEnd;

						if (dr.padd)
							ru.padd = dr.padd;
					}

					// Handle prefixes
					switch (pr) {
						case '-':
							ru.noEmpty = true;
							break;

						case '+':
							ru.fullEnd = true;
							break;

						case '#':
							ru.padd = true;
							break;

						default:
							x = 0;
					}

					tn[i] = s = s.substring(x);
					t.validElements[s] = 1;

					// Add element name or element regex
					if (/[*.?]/.test(tn[0])) {
						ru.nameRE = new RegExp('^' + wildcardToRE(tn[0]) + '$');
						t.wildRules = t.wildRules || {};
						t.wildRules.push(ru);
					} else {
						ru.name = tn[0];

						// Store away default rule
						if (tn[0] == '@')
							dr = ru;

						t.rules[s] = ru;
					}

					ru.attribs = at;

					if (ra)
						ru.requiredAttribs = ra;

					if (wat) {
						// Build valid attributes regexp
						s = '';
						each(va, function(v) {
							if (s)
								s += '|';

							s += '(' + wildcardToRE(v) + ')';
						});
						ru.validAttribsRE = new RegExp('^' + s.toLowerCase() + '$');
						ru.wildAttribs = wat;
					}
				});
			});

			// Build valid elements regexp
			s = '';
			each(t.validElements, function(v, k) {
				if (s)
					s += '|';

				if (k != '@')
					s += k;
			});
			t.validElementsRE = new RegExp('^(' + wildcardToRE(s.toLowerCase()) + ')$');

			//console.debug(t.validElementsRE.toString());
			//console.dir(t.rules);
			//console.dir(t.wildRules);
		},

		/**
		 * Finds a rule object by name.
		 *
		 * @param {String} n Name to look for in rules collection.
		 * @return {Object} Rule object found or null if it wasn't found.
		 */
		findRule : function(n) {
			var t = this, rl = t.rules, i, r;

			t._setup();

			// Exact match
			r = rl[n];
			if (r)
				return r;

			// Try wildcards
			rl = t.wildRules;
			for (i = 0; i < rl.length; i++) {
				if (rl[i].nameRE.test(n))
					return rl[i];
			}

			return null;
		},

		/**
		 * Finds an attribute rule object by name.
		 *
		 * @param {Object} ru Rule object to search though.
		 * @param {String} n Name of the rule to retrive.
		 * @return {Object} Rule object of the specified attribute.
		 */
		findAttribRule : function(ru, n) {
			var i, wa = ru.wildAttribs;

			for (i = 0; i < wa.length; i++) {
				if (wa[i].nameRE.test(n))
					return wa[i];
			}

			return null;
		},

		/**
		 * Serializes the specified node into a HTML string.
		 *
		 * @param {Element} n Element/Node to serialize.
		 * @param {Object} o Object to add serialized contents to, this object will also be passed to the event listeners.
		 * @return {String} Serialized HTML contents.
		 */
		serialize : function(n, o) {
			var h, t = this;

			t._setup();
			o = o || {};
			o.format = o.format || 'html';
			t.processObj = o;
			n = n.cloneNode(true);
			t.key = '' + (parseInt(t.key) + 1);

			// Pre process
			if (!o.no_events) {
				o.node = n;
				t.onPreProcess.dispatch(t, o);
			}

			// Serialize HTML DOM into a string
			t.writer.reset();
			t._serializeNode(n, o.getInner);

			// Post process
			o.content = t.writer.getContent();

			if (!o.no_events)
				t.onPostProcess.dispatch(t, o);

			t._postProcess(o);
			o.node = null;

			return tinymce.trim(o.content);
		},

		// Internal functions

		/**
		 * Indents the specified content object.
		 *
		 * @param {Object} o Content object to indent.
		 */
		_postProcess : function(o) {
			var t = this, s = t.settings, h = o.content, sc = [], p;

			if (o.format == 'html') {
				// Protect some elements
				p = t._protect({
					content : h,
					patterns : [
						{pattern : /(<script[^>]*>)(.*?)(<\/script>)/g},
						{pattern : /(<style[^>]*>)(.*?)(<\/style>)/g},
						{pattern : /(<pre[^>]*>)(.*?)(<\/pre>)/g, encode : 1},
						{pattern : /(<!--\[CDATA\[)(.*?)(\]\]-->)/g}
					]
				});

				h = p.content;

				// Entity encode
				if (s.entity_encoding !== 'raw')
					h = t._encode(h);

				// Use BR instead of &nbsp; padded P elements inside editor and use <p>&nbsp;</p> outside editor
/*				if (o.set)
					h = h.replace(/<p>\s+(&nbsp;|&#160;|\u00a0|<br \/>)\s+<\/p>/g, '<p><br /></p>');
				else
					h = h.replace(/<p>\s+(&nbsp;|&#160;|\u00a0|<br \/>)\s+<\/p>/g, '<p>$1</p>');*/

				// Since Gecko and Safari keeps whitespace in the DOM we need to
				// remove it inorder to match other browsers. But I think Gecko and Safari is right.
				// This process is only done when getting contents out from the editor.
				if (!o.set) {
					// We need to replace paragraph whitespace with an nbsp before indentation to keep the \u00a0 char
					h = h.replace(/<p>\s+<\/p>|<p([^>]+)>\s+<\/p>/g, s.entity_encoding == 'numeric' ? '<p$1>&#160;</p>' : '<p$1>&nbsp;</p>');

					if (s.remove_linebreaks) {
						h = h.replace(/\r?\n|\r/g, ' ');
						h = h.replace(/(<[^>]+>)\s+/g, '$1 ');
						h = h.replace(/\s+(<\/[^>]+>)/g, ' $1');
						h = h.replace(/<(p|h[1-6]|blockquote|hr|div|table|tbody|tr|td|body|head|html|title|meta|style|pre|script|link|object) ([^>]+)>\s+/g, '<$1 $2>'); // Trim block start
						h = h.replace(/<(p|h[1-6]|blockquote|hr|div|table|tbody|tr|td|body|head|html|title|meta|style|pre|script|link|object)>\s+/g, '<$1>'); // Trim block start
						h = h.replace(/\s+<\/(p|h[1-6]|blockquote|hr|div|table|tbody|tr|td|body|head|html|title|meta|style|pre|script|link|object)>/g, '</$1>'); // Trim block end
					}

					// Simple indentation
					if (s.apply_source_formatting && s.indent_mode == 'simple') {
						// Add line breaks before and after block elements
						h = h.replace(/<(\/?)(ul|hr|table|meta|link|tbody|tr|object|body|head|html|map)(|[^>]+)>\s*/g, '\n<$1$2$3>\n');
						h = h.replace(/\s*<(p|h[1-6]|blockquote|div|title|style|pre|script|td|li|area)(|[^>]+)>/g, '\n<$1$2>');
						h = h.replace(/<\/(p|h[1-6]|blockquote|div|title|style|pre|script|td|li)>\s*/g, '</$1>\n');
						h = h.replace(/\n\n/g, '\n');
					}
				}

				h = t._unprotect(h, p);

				// Restore CDATA sections
				h = h.replace(/<!--\[CDATA\[([\s\S]+)\]\]-->/g, '<![CDATA[$1]]>');

				// Restore the \u00a0 character if raw mode is enabled
				if (s.entity_encoding == 'raw')
					h = h.replace(/<p>&nbsp;<\/p>|<p([^>]+)>&nbsp;<\/p>/g, '<p$1>\u00a0</p>');
			}

			o.content = h;
		},

		_serializeNode : function(n, inn) {
			var t = this, s = t.settings, w = t.writer, hc, el, cn, i, l, a, at, no, v, nn, ru, ar, iv;

			if (!s.node_filter || s.node_filter(n)) {
				switch (n.nodeType) {
					case 1: // Element
						if (n.hasAttribute ? n.hasAttribute('mce_bogus') : n.getAttribute('mce_bogus'))
							return;

						iv = false;
						hc = n.hasChildNodes();
						nn = n.getAttribute('mce_name') || n.nodeName.toLowerCase();

						// Add correct prefix on IE
						if (isIE) {
							if (n.scopeName !== 'HTML' && n.scopeName !== 'html')
								nn = n.scopeName + ':' + nn;
						}

						// Remove mce prefix on IE needed for the abbr element
						if (nn.indexOf('mce:') === 0)
							nn = nn.substring(4);

						// Check if valid
						if (!t.validElementsRE.test(nn) || (t.invalidElementsRE && t.invalidElementsRE.test(nn)) || inn) {
							iv = true;
							break;
						}

						if (isIE) {
							// Fix IE content duplication (DOM can have multiple copies of the same node)
							if (s.fix_content_duplication) {
								if (n.mce_serialized == t.key)
									return;

								n.mce_serialized = t.key;
							}

							// IE sometimes adds a / infront of the node name
							if (nn.charAt(0) == '/')
								nn = nn.substring(1);
						} else if (isGecko) {
							// Ignore br elements
							if (n.nodeName === 'BR' && n.getAttribute('type') == '_moz')
								return;
						}

						// Check if valid child
						if (t.childRules) {
							if (t.parentElementsRE.test(t.elementName)) {
								if (!t.childRules[t.elementName].test(nn)) {
									iv = true;
									break;
								}
							}

							t.elementName = nn;
						}

						ru = t.findRule(nn);
						nn = ru.name || nn;

						// Skip empty nodes or empty node name in IE
						if ((!hc && ru.noEmpty) || (isIE && !nn)) {
							iv = true;
							break;
						}

						// Check required
						if (ru.requiredAttribs) {
							a = ru.requiredAttribs;

							for (i = a.length - 1; i >= 0; i--) {
								if (this.dom.getAttrib(n, a[i]) !== '')
									break;
							}

							// None of the required was there
							if (i == -1) {
								iv = true;
								break;
							}
						}

						w.writeStartElement(nn);

						// Add ordered attributes
						if (ru.attribs) {
							for (i=0, at = ru.attribs, l = at.length; i<l; i++) {
								a = at[i];
								v = t._getAttrib(n, a);

								if (v !== null)
									w.writeAttribute(a.name, v);
							}
						}

						// Add wild attributes
						if (ru.validAttribsRE) {
							at = t.dom.getAttribs(n);
							for (i=at.length-1; i>-1; i--) {
								no = at[i];

								if (no.specified) {
									a = no.nodeName.toLowerCase();

									if (s.invalid_attrs.test(a) || !ru.validAttribsRE.test(a))
										continue;

									ar = t.findAttribRule(ru, a);
									v = t._getAttrib(n, ar, a);

									if (v !== null)
										w.writeAttribute(a, v);
								}
							}
						}

						// Padd empty nodes with a &nbsp;
						if (ru.padd) {
							// If it has only one bogus child, padd it anyway workaround for <td><br /></td> bug
							if (hc && (cn = n.firstChild) && cn.nodeType === 1 && n.childNodes.length === 1) {
								if (cn.hasAttribute ? cn.hasAttribute('mce_bogus') : cn.getAttribute('mce_bogus'))
									w.writeText('\u00a0');
							} else if (!hc)
								w.writeText('\u00a0'); // No children then padd it
						}

						break;

					case 3: // Text
						// Check if valid child
						if (t.childRules && t.parentElementsRE.test(t.elementName)) {
							if (!t.childRules[t.elementName].test(n.nodeName))
								return;
						}

						return w.writeText(n.nodeValue);

					case 4: // CDATA
						return w.writeCDATA(n.nodeValue);

					case 8: // Comment
						return w.writeComment(n.nodeValue);
				}
			} else if (n.nodeType == 1)
				hc = n.hasChildNodes();

			if (hc) {
				cn = n.firstChild;

				while (cn) {
					t._serializeNode(cn);
					t.elementName = nn;
					cn = cn.nextSibling;
				}
			}

			// Write element end
			if (!iv) {
				if (hc || !s.closed.test(nn))
					w.writeFullEndElement();
				else
					w.writeEndElement();
			}
		},

		_protect : function(o) {
			var t = this;

			o.items = o.items || [];

			function enc(s) {
				return s.replace(/[\r\n\\]/g, function(c) {
					if (c === '\n')
						return '\\n';
					else if (c === '\\')
						return '\\\\';

					return '\\r';
				});
			};

			function dec(s) {
				return s.replace(/\\[\\rn]/g, function(c) {
					if (c === '\\n')
						return '\n';
					else if (c === '\\\\')
						return '\\';

					return '\r';
				});
			};

			each(o.patterns, function(p) {
				o.content = dec(enc(o.content).replace(p.pattern, function(x, a, b, c) {
					b = dec(b);

					if (p.encode)
						b = t._encode(b);

					o.items.push(b);
					return a + '<!--mce:' + (o.items.length - 1) + '-->' + c;
				}));
			});

			return o;
		},

		_unprotect : function(h, o) {
			h = h.replace(/\<!--mce:([0-9]+)--\>/g, function(a, b) {
				return o.items[parseInt(b)];
			});

			o.items = [];

			return h;
		},

		_encode : function(h) {
			var t = this, s = t.settings, l;

			// Entity encode
			if (s.entity_encoding !== 'raw') {
				if (s.entity_encoding.indexOf('named') != -1) {
					t.setEntities(s.entities);
					l = t.entityLookup;

					h = h.replace(t.entitiesRE, function(a) {
						var v;

						if (v = l[a])
							a = '&' + v + ';';

						return a;
					});
				}

				if (s.entity_encoding.indexOf('numeric') != -1) {
					h = h.replace(/[\u007E-\uFFFF]/g, function(a) {
						return '&#' + a.charCodeAt(0) + ';';
					});
				}
			}

			return h;
		},

		_setup : function() {
			var t = this, s = this.settings;

			if (t.done)
				return;

			t.done = 1;

			t.setRules(s.valid_elements);
			t.addRules(s.extended_valid_elements);
			t.addValidChildRules(s.valid_child_elements);

			if (s.invalid_elements)
				t.invalidElementsRE = new RegExp('^(' + wildcardToRE(s.invalid_elements.replace(/,/g, '|').toLowerCase()) + ')$');

			if (s.attrib_value_filter)
				t.attribValueFilter = s.attribValueFilter;
		},

		_getAttrib : function(n, a, na) {
			var i, v;

			na = na || a.name;

			if (a.forcedVal && (v = a.forcedVal)) {
				if (v === '{$uid}')
					return this.dom.uniqueId();

				return v;
			}

			v = this.dom.getAttrib(n, na);

			// Bool attr
			if (this.settings.bool_attrs.test(na) && v) {
				v = ('' + v).toLowerCase();

				if (v === 'false' || v === '0')
					return null;

				v = na;
			}

			switch (na) {
				case 'rowspan':
				case 'colspan':
					// Whats the point? Remove usless attribute value
					if (v == '1')
						v = '';

					break;
			}

			if (this.attribValueFilter)
				v = this.attribValueFilter(na, v, n);

			if (a.validVals) {
				for (i = a.validVals.length - 1; i >= 0; i--) {
					if (v == a.validVals[i])
						break;
				}

				if (i == -1)
					return null;
			}

			if (v === '' && typeof(a.defaultVal) != 'undefined') {
				v = a.defaultVal;

				if (v === '{$uid}')
					return this.dom.uniqueId();

				return v;
			} else {
				// Remove internal mceItemXX classes when content is extracted from editor
				if (na == 'class' && this.processObj.get)
					v = v.replace(/\s?mceItem\w+\s?/g, '');
			}

			if (v === '')
				return null;


			return v;
		}

		/**#@-*/
	});
})();
