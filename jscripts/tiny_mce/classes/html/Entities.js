/**
 * Entities.js
 *
 * Copyright 2010, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var namedEntities, baseEntities, reverseEntities,
		attrsCharsRegExp = /[&<>\"\u007E-\uD7FF\uE000-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
		textCharsRegExp = /[<>&\u007E-\uD7FF\uE000-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
		rawCharsRegExp = /[<>&\"\']/g,
		entityRegExp = /&(#x|#)?([\w]+);/g,
		asciiMap = {
				128 : "\u20AC", 130 : "\u201A", 131 : "\u0192", 132 : "\u201E", 133 : "\u2026", 134 : "\u2020",
				135 : "\u2021", 136 : "\u02C6", 137 : "\u2030", 138 : "\u0160", 139 : "\u2039", 140 : "\u0152",
				142 : "\u017D", 145 : "\u2018", 146 : "\u2019", 147 : "\u201C", 148 : "\u201D", 149 : "\u2022",
				150 : "\u2013", 151 : "\u2014", 152 : "\u02DC", 153 : "\u2122", 154 : "\u0161", 155 : "\u203A",
				156 : "\u0153", 158 : "\u017E", 159 : "\u0178"
		};

	// Raw entities
	baseEntities = {
		'\"' : '&quot;', // Needs to be escaped since the YUI compressor would otherwise break the code
		"'" : '&#39;',
		'<' : '&lt;',
		'>' : '&gt;',
		'&' : '&amp;'
	};

	// Reverse lookup table for raw entities
	reverseEntities = {
		'&lt;' : '<',
		'&gt;' : '>',
		'&amp;' : '&',
		'&quot;' : '"',
		'&apos;' : "'"
	};

	// Decodes text by using the browser
	function nativeDecode(text) {
		var elm;

		elm = document.createElement("div");
		elm.innerHTML = text;

		return elm.textContent || elm.innerText || text;
	};

	// Build a two way lookup table for the entities
	function buildEntitiesLookup(items, radix) {
		var i, chr, entity, lookup = {};

		if (items) {
			items = items.split(',');
			radix = radix || 10;

			// Build entities lookup table
			for (i = 0; i < items.length; i += 2) {
				chr = String.fromCharCode(parseInt(items[i], radix));

				// Only add non base entities
				if (!baseEntities[chr]) {
					entity = '&' + items[i + 1] + ';';
					lookup[chr] = entity;
					lookup[entity] = chr;
				}
			}

			return lookup;
		}
	};

	// Unpack entities lookup where the numbers are in radix 32 to reduce the size
	namedEntities = buildEntitiesLookup(
		'50,nbsp,51,iexcl,52,cent,53,pound,54,curren,55,yen,56,brvbar,57,sect,58,uml,59,copy,' +
		'5a,ordf,5b,laquo,5c,not,5d,shy,5e,reg,5f,macr,5g,deg,5h,plusmn,5i,sup2,5j,sup3,5k,acute,' +
		'5l,micro,5m,para,5n,middot,5o,cedil,5p,sup1,5q,ordm,5r,raquo,5s,frac14,5t,frac12,5u,frac34,' +
		'5v,iquest,60,Agrave,61,Aacute,62,Acirc,63,Atilde,64,Auml,65,Aring,66,AElig,67,Ccedil,' +
		'68,Egrave,69,Eacute,6a,Ecirc,6b,Euml,6c,Igrave,6d,Iacute,6e,Icirc,6f,Iuml,6g,ETH,6h,Ntilde,' +
		'6i,Ograve,6j,Oacute,6k,Ocirc,6l,Otilde,6m,Ouml,6n,times,6o,Oslash,6p,Ugrave,6q,Uacute,' +
		'6r,Ucirc,6s,Uuml,6t,Yacute,6u,THORN,6v,szlig,70,agrave,71,aacute,72,acirc,73,atilde,74,auml,' +
		'75,aring,76,aelig,77,ccedil,78,egrave,79,eacute,7a,ecirc,7b,euml,7c,igrave,7d,iacute,7e,icirc,' +
		'7f,iuml,7g,eth,7h,ntilde,7i,ograve,7j,oacute,7k,ocirc,7l,otilde,7m,ouml,7n,divide,7o,oslash,' +
		'7p,ugrave,7q,uacute,7r,ucirc,7s,uuml,7t,yacute,7u,thorn,7v,yuml,ci,fnof,sh,Alpha,si,Beta,' +
		'sj,Gamma,sk,Delta,sl,Epsilon,sm,Zeta,sn,Eta,so,Theta,sp,Iota,sq,Kappa,sr,Lambda,ss,Mu,' +
		'st,Nu,su,Xi,sv,Omicron,t0,Pi,t1,Rho,t3,Sigma,t4,Tau,t5,Upsilon,t6,Phi,t7,Chi,t8,Psi,' +
		't9,Omega,th,alpha,ti,beta,tj,gamma,tk,delta,tl,epsilon,tm,zeta,tn,eta,to,theta,tp,iota,' +
		'tq,kappa,tr,lambda,ts,mu,tt,nu,tu,xi,tv,omicron,u0,pi,u1,rho,u2,sigmaf,u3,sigma,u4,tau,' +
		'u5,upsilon,u6,phi,u7,chi,u8,psi,u9,omega,uh,thetasym,ui,upsih,um,piv,812,bull,816,hellip,' +
		'81i,prime,81j,Prime,81u,oline,824,frasl,88o,weierp,88h,image,88s,real,892,trade,89l,alefsym,' +
		'8cg,larr,8ch,uarr,8ci,rarr,8cj,darr,8ck,harr,8dl,crarr,8eg,lArr,8eh,uArr,8ei,rArr,8ej,dArr,' +
		'8ek,hArr,8g0,forall,8g2,part,8g3,exist,8g5,empty,8g7,nabla,8g8,isin,8g9,notin,8gb,ni,8gf,prod,' +
		'8gh,sum,8gi,minus,8gn,lowast,8gq,radic,8gt,prop,8gu,infin,8h0,ang,8h7,and,8h8,or,8h9,cap,8ha,cup,' +
		'8hb,int,8hk,there4,8hs,sim,8i5,cong,8i8,asymp,8j0,ne,8j1,equiv,8j4,le,8j5,ge,8k2,sub,8k3,sup,8k4,' +
		'nsub,8k6,sube,8k7,supe,8kl,oplus,8kn,otimes,8l5,perp,8m5,sdot,8o8,lceil,8o9,rceil,8oa,lfloor,8ob,' +
		'rfloor,8p9,lang,8pa,rang,9ea,loz,9j0,spades,9j3,clubs,9j5,hearts,9j6,diams,ai,OElig,aj,oelig,b0,' +
		'Scaron,b1,scaron,bo,Yuml,m6,circ,ms,tilde,802,ensp,803,emsp,809,thinsp,80c,zwnj,80d,zwj,80e,lrm,' +
		'80f,rlm,80j,ndash,80k,mdash,80o,lsquo,80p,rsquo,80q,sbquo,80s,ldquo,80t,rdquo,80u,bdquo,810,dagger,' +
		'811,Dagger,81g,permil,81p,lsaquo,81q,rsaquo,85c,euro'
	, 32);

	tinymce.html = tinymce.html || {};

	/**
	 * Entity encoder class.
	 *
	 * @class tinymce.html.SaxParser
	 * @static
	 * @version 3.4
	 */
	tinymce.html.Entities = {
		/**
		 * Encodes the specified string using raw entities. This means only the required XML base entities will be endoded.
		 *
		 * @method encodeRaw
		 * @param {String} text Text to encode.
		 * @param {Boolean} attr Optional flag to specify if the text is attribute contents.
		 * @return {String} Entity encoded text.
		 */
		encodeRaw : function(text, attr) {
			return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function(chr) {
				return baseEntities[chr] || chr;
			});
		},

		/**
		 * Encoded the specified text with both the attributes and text entities. This function will produce larger text contents
		 * since it doesn't know if the context is within a attribute or text node. This was added for compatibility
		 * and is exposed as the DOMUtils.encode function.
		 *
		 * @method encodeAllRaw
		 * @param {String} text Text to encode.
		 * @return {String} Entity encoded text.
		 */
		encodeAllRaw : function(text) {
			return ('' + text).replace(rawCharsRegExp, function(chr) {
				return baseEntities[chr] || chr;
			});
		},

		/**
		 * Encodes the specified string using numeric entities. The core entities will be encoded as named ones but all non lower ascii characters
		 * will be encoded into numeric entities.
		 *
		 * @method encodeNumeric
		 * @param {String} text Text to encode.
		 * @param {Boolean} attr Optional flag to specify if the text is attribute contents.
		 * @return {String} Entity encoded text.
		 */
		encodeNumeric : function(text, attr) {
			return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function(chr) {
				// Multi byte sequence convert it to a single entity
				if (chr.length > 1)
					return '&#' + (((chr.charCodeAt(0) - 0xD800) * 0x400) + (chr.charCodeAt(1) - 0xDC00) + 0x10000) + ';';

				return baseEntities[chr] || '&#' + chr.charCodeAt(0) + ';';
			});
		},

		/**
		 * Encodes the specified string using named entities. The core entities will be encoded as named ones but all non lower ascii characters
		 * will be encoded into named entities.
		 *
		 * @method encodeNamed
		 * @param {String} text Text to encode.
		 * @param {Boolean} attr Optional flag to specify if the text is attribute contents.
		 * @param {Object} entities Optional parameter with entities to use.
		 * @return {String} Entity encoded text.
		 */
		encodeNamed : function(text, attr, entities) {
			entities = entities || namedEntities;

			return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function(chr) {
				return baseEntities[chr] || entities[chr] || chr;
			});
		},

		/**
		 * Returns an encode function based on the name(s) and it's optional entities.
		 *
		 * @method getEncodeFunc
		 * @param {String} name Comma separated list of encoders for example named,numeric.
		 * @param {String} entities Optional parameter with entities to use instead of the built in set.
		 * @return {function} Encode function to be used.
		 */
		getEncodeFunc : function(name, entities) {
			var Entities = tinymce.html.Entities;

			entities = buildEntitiesLookup(entities) || namedEntities;

			function encodeNamedAndNumeric(text, attr) {
				return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function(chr) {
					return baseEntities[chr] || entities[chr] || '&#' + chr.charCodeAt(0) + ';' || chr;
				});
			};

			function encodeCustomNamed(text, attr) {
				return Entities.encodeNamed(text, attr, entities);
			};

			// Replace + with , to be compatible with previous TinyMCE versions
			name = tinymce.makeMap(name.replace(/\+/g, ','));

			// Named and numeric encoder
			if (name.named && name.numeric)
				return encodeNamedAndNumeric;

			// Named encoder
			if (name.named) {
				// Custom names
				if (entities)
					return encodeCustomNamed;

				return Entities.encodeNamed;
			}

			// Numeric
			if (name.numeric)
				return Entities.encodeNumeric;

			// Raw encoder
			return Entities.encodeRaw;
		},

		/**
		 * Decodes the specified string, this will replace entities with raw UTF characters.
		 *
		 * @param {String} text Text to entity decode.
		 * @return {String} Entity decoded string.
		 */
		decode : function(text) {
			return text.replace(entityRegExp, function(all, numeric, value) {
				if (numeric) {
					value = parseInt(value, numeric.length === 2 ? 16 : 10);

					// Support upper UTF
					if (value > 0xFFFF) {
						value -= 0x10000;

						return String.fromCharCode(0xD800 + (value >> 10), 0xDC00 + (value & 0x3FF));
					} else
						return asciiMap[value] || String.fromCharCode(value);
				}

				return reverseEntities[all] || namedEntities[all] || nativeDecode(all);
			});
		}
	};
})(tinymce);
