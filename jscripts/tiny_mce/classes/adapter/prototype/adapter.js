/**
 * adapter.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

// #ifdef prototype_adapter

(function() {
	if (!window.Prototype)
		return alert("Load prototype first!");

	// Patch in core NS functions
	tinymce.extend(tinymce, {
		trim : function(s) {return s ? s.strip() : '';},
		inArray : function(a, v) {return a && a.indexOf ? a.indexOf(v) : -1;}
	});

	// Patch in functions in various clases
	// Add a "#ifndefjquery" statement around each core API function you add below
	var patches = {
		'tinymce.util.JSON' : {
			/*serialize : function(o) {
				return o.toJSON();
			}*/
		}
	};

	// Patch functions after a class is created
	tinymce.onCreate = function(ty, c, p) {
		tinymce.extend(p, patches[c]);
	};
})();

// #endif
