/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
/*global tinymce:true */
/*eslint consistent-this:0 */
tinymce.PluginManager.add('tagging', function(editor, url) {

// From http://godsnotwheregodsnot.blogspot.ru/2013/11/kmeans-color-quantization-seeding.html
	var indexcolors = [

		/* "#000000", */ "#FFFF00", "#1CE6FF", "#FF34FF", "#FF4A46", "#008941", "#006FA6", "#A30059",

		"#FFDBE5", "#7A4900", "#0000A6", "#63FFAC", "#B79762", "#004D43", "#8FB0FF", "#997D87",
		"#5A0007", "#809693", "#FEFFE6", "#1B4400", "#4FC601", "#3B5DFF", "#4A3B53", "#FF2F80",
		"#61615A", "#BA0900", "#6B7900", "#00C2A0", "#FFAA92", "#FF90C9", "#B903AA", "#D16100",
		"#DDEFFF", "#000035", "#7B4F4B", "#A1C299", "#300018", "#0AA6D8", "#013349", "#00846F",
		"#372101", "#FFB500", "#C2FFED", "#A079BF", "#CC0744", "#C0B9B2", "#C2FF99", "#001E09",
		"#00489C", "#6F0062", "#0CBD66", "#EEC3FF", "#456D75", "#B77B68", "#7A87A1", "#788D66",
		"#885578", "#FAD09F", "#FF8A9A", "#D157A0", "#BEC459", "#456648", "#0086ED", "#886F4C",
		
		"#34362D", "#B4A8BD", "#00A6AA", "#452C2C", "#636375", "#A3C8C9", "#FF913F", "#938A81",
		"#575329", "#00FECF", "#B05B6F", "#8CD0FF", "#3B9700", "#04F757", "#C8A1A1", "#1E6E00",
		"#7900D7", "#A77500", "#6367A9", "#A05837", "#6B002C", "#772600", "#D790FF", "#9B9700",
		"#549E79", "#FFF69F", "#201625", "#72418F", "#BC23FF", "#99ADC0", "#3A2465", "#922329",
		"#5B4534", "#FDE8DC", "#404E55", "#0089A3", "#CB7E98", "#A4E804", "#324E72", "#6A3A4C",
		"#83AB58", "#001C1E", "#D1F7CE", "#004B28", "#C8D0F6", "#A3A489", "#806C66", "#222800",
		"#BF5650", "#E83000", "#66796D", "#DA007C", "#FF1A59", "#8ADBB4", "#1E0200", "#5B4E51",
		"#C895C5", "#320033", "#FF6832", "#66E1D3", "#CFCDAC", "#D0AC94", "#7ED379", "#012C58",
		
		"#7A7BFF", "#D68E01", "#353339", "#78AFA1", "#FEB2C6", "#75797C", "#837393", "#943A4D",
		"#B5F4FF", "#D2DCD5", "#9556BD", "#6A714A", "#001325", "#02525F", "#0AA3F7", "#E98176",
		"#DBD5DD", "#5EBCD1", "#3D4F44", "#7E6405", "#02684E", "#962B75", "#8D8546", "#9695C5",
		"#E773CE", "#D86A78", "#3E89BE", "#CA834E", "#518A87", "#5B113C", "#55813B", "#E704C4",
		"#00005F", "#A97399", "#4B8160", "#59738A", "#FF5DA7", "#F7C9BF", "#643127", "#513A01",
		"#6B94AA", "#51A058", "#A45B02", "#1D1702", "#E20027", "#E7AB63", "#4C6001", "#9C6966",
		"#64547B", "#97979E", "#006A66", "#391406", "#F4D749", "#0045D2", "#006C31", "#DDB6D0",
		"#7C6571", "#9FB2A4", "#00D891", "#15A08A", "#BC65E9", "#FFFFFE", "#C6DC99", "#203B3C",

		"#671190", "#6B3A64", "#F5E1FF", "#FFA0F2", "#CCAA35", "#374527", "#8BB400", "#797868",
		"#C6005A", "#3B000A", "#C86240", "#29607C", "#402334", "#7D5A44", "#CCB87C", "#B88183",
		"#AA5199", "#B5D6C3", "#A38469", "#9F94F0", "#A74571", "#B894A6", "#71BB8C", "#00B433",
		"#789EC9", "#6D80BA", "#953F00", "#5EFF03", "#E4FFFC", "#1BE177", "#BCB1E5", "#76912F",
		"#003109", "#0060CD", "#D20096", "#895563", "#29201D", "#5B3213", "#A76F42", "#89412E",
		"#1A3A2A", "#494B5A", "#A88C85", "#F4ABAA", "#A3F3AB", "#00C6C8", "#EA8B66", "#958A9F",
		"#BDC9D2", "#9FA064", "#BE4700", "#658188", "#83A485", "#453C23", "#47675D", "#3A3F00",
		"#061203", "#DFFB71", "#868E7E", "#98D058", "#6C8F7D", "#D7BFC2", "#3C3E6E", "#D83D66",
		
		"#2F5D9B", "#6C5E46", "#D25B88", "#5B656C", "#00B57F", "#545C46", "#866097", "#365D25",
		"#252F99", "#00CCFF", "#674E60", "#FC009C", "#92896B"
	];


	var tagNodes = [{
		name: "First tag",
		color: indexcolors[0]
	}, {
		name: "Six",
		color: indexcolors[1]
	}];
	
	var sidebarWidth = 100;

	var sidebar = new Array(tagNodes.length),
		tagbar = new Array(tagNodes.length),
		tempbar = new Array(tagNodes.length),
		bars,
		sidediv,
		contentareacontainer,
		selSpan, selTop, selHeight, unselTop, unselHeight;

	function update() {
		var spans = editor.dom.select('span');
		var divheight, div, gap, lastspan;

		function findNextSibling(node, span) {
			if (node.nodeName == "BODY") {
				return null;
			} else {
				var next = node.nextSibling;
				if (!next) {
					return findNextSibling(node.parentNode, span);
				} else {
					var nextChild = next.firstChild;
					while (nextChild && next != span) {
						next = nextChild;
						nextChild = next.firstChild;
					}
					return next;
				}
			}
		}

		bars = [];
		for (var tagnum = 0; tagnum < tagNodes.length; tagnum++) {
			sidebar[tagnum].style.height = editor.getBody().offsetHeight + 24; /* Add a bit to compensate for margin ?!# */

			tempbar[tagnum].remove();
			tagbar[tagnum].remove();
			tagbar[tagnum] = editor.dom.create('div', {
				id: editor.dom.uniqueId(),
				class: "tagbar"
			});
			tagbar[tagnum].style.color = tagNodes[tagnum].color;
			sidebar[tagnum].insertBefore(tagbar[tagnum], sidebar[tagnum].firstChild);

			tempbar[tagnum] = editor.dom.create('div', {
				id: editor.dom.uniqueId(),
				class: "tempbar"
			});
			tagbar[tagnum].appendChild(tempbar[tagnum]);
			
			var bartop = null;
			var barspans = [];
			for (var spanindex = 0; spanindex < spans.length; spanindex++) {
				var span = spans[spanindex];
				if (span.getAttribute('data-tag') == tagnum) {
					if (bartop === null) {
						bartop = span.offsetTop;
						divheight = span.offsetHeight;
						barspans.push(span);
					} else {
						gap = false;
						if ((span.offsetTop - (bartop + divheight)) > 0) {
							for (
								var iterspan = findNextSibling(lastspan, span);
								iterspan && iterspan != span;
								iterspan = iterspan.nextSibling
								) {
								if ((iterspan.textContent !== "") && (iterspan.parentNode.nodeName != "BODY")) {
									gap = true;
									break;
								}
							}
						}
						if (!gap) {
							divheight = span.offsetTop + span.offsetHeight - bartop;
							barspans.push(span);
						} else {
							div = editor.dom.create('div', {
								id: editor.dom.uniqueId(),
								"data-divindex": bars.length,
								class: "verticalbar",
								style: "top: " + bartop + "px; height: " + divheight + "px;"
							});
							tagbar[tagnum].appendChild(div);

							bars.push(barspans);
							barspans = [];
							barspans.push(span);

							div.onmouseover = Highlight;
							div.onmouseleave = UnHighlight;
							bartop = span.offsetTop;
							divheight = span.offsetHeight;
						}
					}
					lastspan = span;
				}
			}
			if (bartop !== null) {
				div = editor.dom.create('div', {
					id: editor.dom.uniqueId(),
					"data-divindex": bars.length,
					class: "verticalbar",
					style: "top: " + bartop + "px; height: " + divheight + "px;"
				});
				tagbar[tagnum].appendChild(div);

				bars.push(barspans);

				div.onmouseover = Highlight;
				div.onmouseleave = UnHighlight;
			}
		}
		
		// Work out whether scroll bar is visible. Why is the figure 22?
		if (editor.getBody().offsetHeight + 22 >= contentareacontainer.offsetHeight) {
			sidediv.style.width = (sidebarWidth - 16) + "px";
		} else {
			sidediv.style.width = sidebarWidth + "px";
		}
		scroll_sidediv();

	}

	function Highlight(div) {
		var barspans = bars[div.target.getAttribute("data-divindex")];
		for (var i = 0; i < barspans.length; i++) {
			barspans[i].style.color = this.parentNode.style.color;
		}
	}

	function UnHighlight(div) {
		var barspans = bars[div.target.getAttribute("data-divindex")];
		for (var i = 0; i < barspans.length; i++) {
			barspans[i].style.color = null;
		}
	}

	function scroll_sidediv() {
		var scroll = editor.dom.getViewPort(editor.getWin()).y;
//		sidediv.scrollTop = scroll;
		for (var tagnum = 0; tagnum < tagNodes.length; tagnum++) {
			tagbar[tagnum].style.marginTop = -scroll;
		}
	}

	function resize() {
		sidediv.style.height = editor.iframeElement.style.height;
		update();
	}

	function tagwindow() {
		var body = [];
		var newtagbody = [ { 
			name: 'name',
			label: 'Name',
			type: 'textbox'
		} ];
		var inspan = new Array(tagNodes.length), tagged = new Array(tagNodes.length), untagged = new Array(tagNodes.length);
		var checked = new Array(tagNodes.length);
		var textbar;
		var tagnum;

		function walkSelectionTree(node) {
			var tag, tagnum, childNode;

			if (node.type === 3) {	// Text node
				for (tagnum = 0; tagnum < tagNodes.length; tagnum++) {
					if (inspan[tagnum]) {
						tagged[tagnum] = true;
					} else {
						untagged[tagnum] = true;
					}
				}
			} else if ((node.name === "span") && ((tag = node.attr("data-tag")) !== undefined)) {
				inspan[tag] = true;
				childNode = node.firstChild;
				while (childNode !== undefined && childNode !== null) {
					walkSelectionTree(childNode);
					childNode = childNode.next;
				}
				inspan[tag] = false;
			} else {
				childNode = node.firstChild;
				while (childNode !== undefined && childNode !== null) {
					walkSelectionTree(childNode);
					childNode = childNode.next;
				}
			}
		}
		
		function tagWindowClose(e) {
			for (var tagnum = 0; tagnum < tagNodes.length; tagnum++) {
				tempbar[tagnum].style.opacity = 0;
			}
		}

		function tagWindowSubmit(e) {
			var change = false;
			for (var tagnum = 0; tagnum < tagNodes.length; tagnum++) {
				if (e.data[tagnum] !== null) {
					if (e.data[tagnum]) {
						if (checked[tagnum] != true) {
							if (!change) {
								change = true;
								editor.undoManager.beforeChange();
							}
							editor.formatter.apply('tag', {
								tag: tagnum.toString()
							});
						}
					} else {
						if (checked[tagnum] != false) {
							if (!change) {
								change = true;
								editor.undoManager.beforeChange();
							}
							editor.formatter.remove('tag', {
								tag: tagnum.toString()
							});
						}
					}
				}
			}
			if (change) {
				editor.undoManager.add();
			}
		}
		
		function newTagCancel(e) {
			console.log('newTagCancel');
			editor.windowManager.open({
				body: body,
				onsubmit: tagWindowSubmit,
				scrollbars: true,
			});
		}
		
		function clickCheckBox(e) {
			var tagnum = Number(this.name());
			var value = this.value();
			
			if (value === true) {
				tempbar[tagnum].style.top = selTop;
				tempbar[tagnum].style.height = selHeight;
				tempbar[tagnum].style.color = 'inherit';
				tempbar[tagnum].style.opacity = 1;
			} else if (value === false && unselHeight !== undefined) {
				tempbar[tagnum].style.top = unselTop;
				tempbar[tagnum].style.height = unselHeight;
				tempbar[tagnum].style.color = 'white';
				tempbar[tagnum].style.opacity = 1;
			} else {
				tempbar[tagnum].style.opacity = 0;
			}
		}
			
		function newTagSubmit(e) {
			var value = e.data.name;
			var dom = editor.dom;
			
			if (value !== '') {
				tagnum = tagNodes.length;
				tagNodes.push({
					name:  value,
					color: indexcolors[tagnum]
				});
				checked[tagnum] = false;
				sidebar[tagnum] = dom.create('div', {
					id: dom.uniqueId(),
					class: "sidebar",
					style: "width:20px; display: inline-block;"
				});
				sidediv.appendChild(sidebar[tagnum]);

				textbar = dom.create('div', {
					id: dom.uniqueId(),
					class: "textbar"
				},
					tagNodes[tagnum].name
				);
				textbar.style.color = tagNodes[tagnum].color;
				sidebar[tagnum].appendChild(textbar);

				tagbar[tagnum] = dom.create('div', {
					id: dom.uniqueId(),
					class: "tagbar"
				});
				tagbar[tagnum].style.color = tagNodes[tagnum].color;
				sidebar[tagnum].insertBefore(tagbar[tagnum], sidebar[tagnum].firstChild);

				tempbar[tagnum] = editor.dom.create('div', {
					id: editor.dom.uniqueId(),
					class: "tempbar",
					style: { top: selTop, height: selHeight, color: 'inherit', opacity: 1 }
				});
				tagbar[tagnum].appendChild(tempbar[tagnum]);
				
				body.splice(tagnum, 0, {
					type: 'checkbox',
					tristate: false,
					checked: true,
					name: tagnum.toString(),
					label: value,
					onclick: clickCheckBox
				});
			}
		}
		
		function newtag() {
			editor.windowManager.close();
			editor.windowManager.open ({
				body: newtagbody,
				onsubmit: newTagSubmit,
				onclose: newTagCancel
			});
		}
	
		if (editor.selection.getContent() !== '') {
	
// This is some painful stuff. First we calculate the Y offset and height of the selection by making a
// temporary 'selection' format, retrieving its location and size, then removing it.

			editor.formatter.apply('selection');
			selSpans = editor.dom.select('span.selection');
			selBlocks = editor.selection.getSelectedBlocks();
			
			
			selTop = selSpans[0].offsetTop;
			selBottom = selSpans[selSpans.length-1].offsetTop + selSpans[selSpans.length-1].offsetHeight;
			selHeight = selBottom - selTop;
			
// For unselection it's even more tricky. We build a range from the start of the selected blocks up to 
// the start/end of the selection to see whether it vertically overlaps the selection.
			selRects = editor.selection.getRng().getClientRects();
			
			try {
				aboveRng=editor.dom.createRng();
				aboveRng.setStart(selBlocks[0],0);
				aboveRng.setEndBefore(selSpans[0]);
				aboveRects = aboveRng.getClientRects();
				lastRect = aboveRects.length - 1;
				while (lastRect >= 0 && aboveRects[lastRect].width === 0) {
					lastRect -= 1;
				}
				if (lastRect >= 0) {
					unselTop = Math.max(aboveRects[lastRect].bottom, selRects[0].top);
				} else {
					unselTop = selRects[0].top;
				}
			} catch(err) {
				unselTop = selTop;
			}
			
			try {
				belowRng=editor.dom.createRng();
				belowRng.setStartAfter(selSpans[selSpans.length-1]);
				belowRng.setEnd(selBlocks[selBlocks.length-1], 0); // NO GOOD - need end of block???
				belowRects = belowRng.getClientRects();
				firstRect = 0;
				while (firstRect < belowRects.length && belowRects[firstRect].width === 0) {
					firstRect += 1;
				}
				if (firstRect < belowRects.length) {
					unselBottom = Math.min(belowRects[firstRect].top, selRects[selRects.length-1].bottom);
				} else {
					unselBottom = selRects[selRects.length-1].bottom;
				}
			} catch (err) {
				unselBottom = selBottom;
			}
			
			console.log (selTop, selBottom, unselTop, unselBottom);
			if (unselBottom > unselTop) {
				unselHeight = unselBottom - unselTop;
			} else {
				unselTop = undefined;
				unselBottom = undefined;
				unselHight = undefined;
			}
			
			tinyMCE.activeEditor.formatter.remove('selection');

// Then we need to find out whether the selection is all/some/none tagged at each of the tags. 

			var selectionRoot = editor.parser.parse(editor.selection.getContent());
			for (tagnum = 0; tagnum < tagNodes.length; tagnum++) {
				inspan[tagnum]   = false;
				tagged[tagnum]   = false;
				untagged[tagnum] = false;
			}
			walkSelectionTree(selectionRoot);
			for (tagnum = 0; tagnum < tagNodes.length; tagnum++) {
				if (tagged[tagnum] && !untagged[tagnum]) {
					checked[tagnum] = true;
				} else if (untagged[tagnum] && !tagged[tagnum]) {
					checked[tagnum] = editor.formatter.match('tag', {"tag": tagnum.toString()});
				} else {
					checked[tagnum] = null;
				}
				body.push({
					type: 'checkbox',
					tristate: (checked[tagnum] === null),
					checked: checked[tagnum],
					name: tagnum.toString(),
					label: tagNodes[tagnum].name,
					onclick: clickCheckBox
				});
			}
			body.push ({
				type: 'button',
				size: 20,
				text: 'New',
				style: "color: gray",
				onclick: newtag
			});

			editor.windowManager.open({
				body: body,
				onsubmit: tagWindowSubmit,
				onclose: tagWindowClose,
				scrollbars: true,
			});
		}
	}

	editor.addButton('tag', {
		icon: 'toolbartagging',
		tooltip: 'Tag/untag selection',
		onclick: tagwindow
	});
	
	editor.addMenuItem('tag', {
		text: 'Tag/untag selection',
		image: 'img/Ecommerce-Price-Tag-icon.png',
		tooltip: 'Tag/untag selection',
		onclick: tagwindow,
		context: 'div'
	});
	
	editor.on('init', function() {
        var cssURL = url + '/css/tagging.css';
        if(document.createStyleSheet){
            document.createStyleSheet(cssURL);
        } else {
            cssLink = editor.dom.create('link', {
                        rel: 'stylesheet',
                        href: cssURL
                      });
            document.getElementsByTagName('head')[0].
                      appendChild(cssLink);
        }
        
		editor.formatter.register('tag', {
			inline: 'span',
			exact: true,
			attributes: {
				"data-tag": "%tag"
			},
		}); /* Undocumented! */
		editor.formatter.register('selection', {
			inline: 'span',
			exact: true,
			attributes: {
				class: "selection"
			},
		}); /* Undocumented! */
		var dom = editor.dom;
		contentareacontainer = editor.getContentAreaContainer();
		var style = contentareacontainer.getAttribute("style") + " width:100%; display: inline-block;";
		contentareacontainer.setAttribute("style", style);

		var body = editor.getBody();
		body.style.marginRight = sidebarWidth + "px";

		var contentareaiframe = contentareacontainer.firstChild;
		style = contentareaiframe.getAttribute("style") + " line-height: normal; display: inline-block;";
		contentareaiframe.setAttribute("style", style);

		sidediv = dom.create('div', {
			id: dom.uniqueId(),
			class: "sidediv",
			style: "margin-left: " + -sidebarWidth + "px"
		});
		contentareacontainer.appendChild(sidediv);

		for (var tagnum = 0; tagnum < tagNodes.length; tagnum++) {
			sidebar[tagnum] = dom.create('div', {
				id: dom.uniqueId(),
				class: "sidebar",
				style: "width:20px; display: inline-block;"
			});
			sidediv.appendChild(sidebar[tagnum]);

			textbar = dom.create('div', {
				id: dom.uniqueId(),
				class: "textbar"
			},
				tagNodes[tagnum].name
			);
			textbar.style.color = tagNodes[tagnum].color;
			sidebar[tagnum].appendChild(textbar);

			tagbar[tagnum] = dom.create('div', {
				id: dom.uniqueId(),
				class: "tagbar"
			});
			tagbar[tagnum].style.color = tagNodes[tagnum].color;
			sidebar[tagnum].insertBefore(tagbar[tagnum], sidebar[tagnum].firstChild);
			
			tempbar[tagnum] = editor.dom.create('div', {
				id: editor.dom.uniqueId(),
				class: "tempbar"
			});
			tagbar[tagnum].appendChild(tempbar[tagnum]);
		}

		editor.on('setcontent beforeaddundo keyup nodechange', update);
		editor.on('load ResizeEditor', resize);
		editor.on('load', scroll_sidediv); /* Doesn't seem to work? */
		editor.getWin().onscroll = scroll_sidediv;
	});
});