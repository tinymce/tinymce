/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('layer', function(editor) {
	function getParentLayer(node) {
		do {
			if (node.className && node.className.indexOf('mceItemLayer') != -1) {
				return node;
			}
		} while ((node = node.parentNode));
	}

	function visualAid(e) {
		var dom = editor.dom;

		tinymce.each(dom.select('div,p', e), function(e) {
			if (/^(absolute|relative|fixed)$/i.test(e.style.position)) {
				if (e.hasVisual) {
					dom.addClass(e, 'mceItemVisualAid');
				} else {
					dom.removeClass(e, 'mceItemVisualAid');
				}

				dom.addClass(e, 'mceItemLayer');
			}
		});
	}

	function move(d) {
		var i, z = [], le = getParentLayer(editor.selection.getNode()), ci = -1, fi = -1, nl;

		nl = [];
		tinymce.walk(editor.getBody(), function(n) {
			if (n.nodeType == 1 && /^(absolute|relative|static)$/i.test(n.style.position)) {
				nl.push(n);
			}
		}, 'childNodes');

		// Find z-indexes
		for (i = 0; i < nl.length; i++) {
			z[i] = nl[i].style.zIndex ? parseInt(nl[i].style.zIndex, 10) : 0;

			if (ci < 0 && nl[i] == le) {
				ci = i;
			}
		}

		if (d < 0) {
			// Move back

			// Try find a lower one
			for (i = 0; i < z.length; i++) {
				if (z[i] < z[ci]) {
					fi = i;
					break;
				}
			}

			if (fi > -1) {
				nl[ci].style.zIndex = z[fi];
				nl[fi].style.zIndex = z[ci];
			} else {
				if (z[ci] > 0) {
					nl[ci].style.zIndex = z[ci] - 1;
				}
			}
		} else {
			// Move forward

			// Try find a higher one
			for (i = 0; i < z.length; i++) {
				if (z[i] > z[ci]) {
					fi = i;
					break;
				}
			}

			if (fi > -1) {
				nl[ci].style.zIndex = z[fi];
				nl[fi].style.zIndex = z[ci];
			} else {
				nl[ci].style.zIndex = z[ci] + 1;
			}
		}

		editor.execCommand('mceRepaint');
	}

	function insertLayer() {
		var dom = editor.dom, p = dom.getPos(dom.getParent(editor.selection.getNode(), '*'));
		var body = editor.getBody();

		editor.dom.add(body, 'div', {
			style: {
				position: 'absolute',
				left: p.x,
				top: (p.y > 20 ? p.y : 20),
				width: 100,
				height: 100
			},
			'class': 'mceItemVisualAid mceItemLayer'
		}, editor.selection.getContent() || editor.getLang('layer.content'));

		// Workaround for IE where it messes up the JS engine if you insert a layer on IE 6,7
		if (tinymce.Env.ie) {
			dom.setHTML(body, body.innerHTML);
		}
	}

	function toggleAbsolute() {
		var le = getParentLayer(editor.selection.getNode());

		if (!le) {
			le = editor.dom.getParent(editor.selection.getNode(), 'DIV,P,IMG');
		}

		if (le) {
			if (le.style.position.toLowerCase() == "absolute") {
				editor.dom.setStyles(le, {
					position: '',
					left: '',
					top: '',
					width: '',
					height: ''
				});

				editor.dom.removeClass(le, 'mceItemVisualAid');
				editor.dom.removeClass(le, 'mceItemLayer');
			} else {
				if (!le.style.left) {
					le.style.left = 20 + 'px';
				}

				if (!le.style.top) {
					le.style.top = 20 + 'px';
				}

				if (!le.style.width) {
					le.style.width = le.width ? (le.width + 'px') : '100px';
				}

				if (!le.style.height) {
					le.style.height = le.height ? (le.height + 'px') : '100px';
				}

				le.style.position = "absolute";

				editor.dom.setAttrib(le, 'data-mce-style', '');
				editor.addVisual(editor.getBody());
			}

			editor.execCommand('mceRepaint');
			editor.nodeChanged();
		}
	}

	// Register commands
	editor.addCommand('mceInsertLayer', insertLayer);

	editor.addCommand('mceMoveForward', function() {
		move(1);
	});

	editor.addCommand('mceMoveBackward', function() {
		move(-1);
	});

	editor.addCommand('mceMakeAbsolute', function() {
		toggleAbsolute();
	});

	// Register buttons
	editor.addButton('moveforward', {title: 'layer.forward_desc', cmd: 'mceMoveForward'});
	editor.addButton('movebackward', {title: 'layer.backward_desc', cmd: 'mceMoveBackward'});
	editor.addButton('absolute', {title: 'layer.absolute_desc', cmd: 'mceMakeAbsolute'});
	editor.addButton('insertlayer', {title: 'layer.insertlayer_desc', cmd: 'mceInsertLayer'});

	editor.on('init', function() {
		if (tinymce.Env.ie) {
			editor.getDoc().execCommand('2D-Position', false, true);
		}
	});

	// Remove serialized styles when selecting a layer since it might be changed by a drag operation
	editor.on('mouseup', function(e) {
		var layer = getParentLayer(e.target);

		if (layer) {
			editor.dom.setAttrib(layer, 'data-mce-style', '');
		}
	});

	// Fixes edit focus issues with layers on Gecko
	// This will enable designMode while inside a layer and disable it when outside
	editor.on('mousedown', function(e) {
		var node = e.target, doc = editor.getDoc(), parent;

		if (tinymce.Env.gecko) {
			if (getParentLayer(node)) {
				if (doc.designMode !== 'on') {
					doc.designMode = 'on';

					// Repaint caret
					node = doc.body;
					parent = node.parentNode;
					parent.removeChild(node);
					parent.appendChild(node);
				}
			} else if (doc.designMode == 'on') {
				doc.designMode = 'off';
			}
		}
	});

	editor.on('NodeChange', visualAid);
});
