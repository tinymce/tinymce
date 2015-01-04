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

// ----------------------------  Global constants  ----------------------------

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
	
	var sideBarWidth = 100;

// ----------------------------  Global variables  ----------------------------

	var tagNodes = [];

	var sideBar = [],
		tagBar = [],
		maskBar = [],
		barRefs,
		sideDiv;
		
	var
		selTop,
		selHeight,
		unselTop,
		unselHeight;

	function updateBars() {
		var
			spans = editor.dom.select('span');
		var
			divheight, 
			div, 
			gap, 
			lastspan;
		var
			barTop,
			barSpans;
		var
			tagNum,
			spanIndex;
		var
			span;

		//  Function to navigate editor text
		function nextSibling(node, end) {
			var
				result;
				
			if (node.nodeName == "BODY") {
				return null;
			} else {
				result = node.nextSibling;
				if (!result) {
					return nextSibling(node.parentNode, end);
				} else {
					while (result.firstChild && result != end) {
						result = result.firstChild;
					}
					return result;
				}
			}
		}
		
		function appendVerticalBar() {
			var 
				div = editor.dom.create('div', {
					id: editor.dom.uniqueId(),
					"data-divindex": barRefs.length,
					class: "verticalbar",
					style: "top: " + barTop + "px; height: " + divheight + "px;"
				});
				
			//  For some reason if you define these when creating the div, they don't work.
			div.onmouseover = highlight;
			div.onmouseleave = unhighlight;
	
			tagBar[tagNum].appendChild(div);
			barRefs.push(barSpans);
		}
		
		function highlight(div) {
			var barSpans = barRefs[div.target.getAttribute("data-divindex")];
			for (var i = 0; i < barSpans.length; i++) {
				barSpans[i].style.color = this.parentNode.style.color;
			}
		}

		function unhighlight(div) {
			var barSpans = barRefs[div.target.getAttribute("data-divindex")];
			for (var i = 0; i < barSpans.length; i++) {
				barSpans[i].style.color = null;
			}
		}

		barRefs = [];
		for (tagNum = 0; tagNum < tagNodes.length; tagNum++) {
			sideBar[tagNum].style.height = editor.getBody().offsetHeight + 24; /* Add a bit to compensate for margin ?!# */

			tagBar[tagNum].remove();
			tagBar[tagNum] = editor.dom.create('div', {
				id: editor.dom.uniqueId(),
				class: "tagbar",
				style: "color: " + tagNodes[tagNum].color
			});
			sideBar[tagNum].insertBefore(tagBar[tagNum], sideBar[tagNum].firstChild);

			maskBar[tagNum].remove();
			maskBar[tagNum] = editor.dom.create('div', {
				id: editor.dom.uniqueId(),
				class: "maskbar"
			});
			tagBar[tagNum].appendChild(maskBar[tagNum]);
			
			//  Build the actual tag bars. If two spans have no text (ie only paragraph breaks) between them then make a single bar.
			barTop = null;
			barSpans = [];
			for (spanIndex = 0; spanIndex < spans.length; spanIndex++) {
				var span = spans[spanIndex];
				if (span.getAttribute('data-tag') === tagNodes[tagNum].name) {
					if (barTop === null) {
						barTop = span.offsetTop;
						divheight = span.offsetHeight;
						barSpans.push(span);
					} else {
						gap = false;
						if ((span.offsetTop - (barTop + divheight)) > 0) {
							for (
								var iterspan = nextSibling(lastspan, span);
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
							divheight = span.offsetTop + span.offsetHeight - barTop;
							barSpans.push(span);
						} else {
							appendVerticalBar();
							barRefs.push(barSpans);
							
							barSpans = [];
							barSpans.push(span);
							barTop = span.offsetTop;
							divheight = span.offsetHeight;
						}
					}
					lastspan = span;
				}
			}
			if (barTop !== null) {
				appendVerticalBar();
			}
		}
		
		// Work out whether scroll bar is visible - if so then reduce widebar width to allow room for it.
		// Why is the figure 22?
		if (editor.getBody().offsetHeight + 22 >= editor.getContentAreaContainer().offsetHeight) {
			sideDiv.style.width = (sideBarWidth - 16) + "px";
		} else {
			sideDiv.style.width = sideBarWidth + "px";
		}
		scroll_sideDiv();
	}

	function scroll_sideDiv() {
		var scroll = editor.dom.getViewPort(editor.getWin()).y;
		for (var tagNum = 0; tagNum < tagNodes.length; tagNum++) {
			tagBar[tagNum].style.marginTop = -scroll;
		}
	}

	function resize() {
		sideDiv.style.height = editor.iframeElement.style.height;
		updateBars();
	}
	
	function appendTagNode(name, tagNum) {
		var
			textBar;
			
		tagNodes[tagNum] = {
			name:  name,
			color: indexcolors[tagNum]
		};
		
		sideBar[tagNum] = editor.dom.create('div', {
			id: editor.dom.uniqueId(),
			class: "sidebar",
			style: "width:20px; display: inline-block;"
		});
		sideDiv.appendChild(sideBar[tagNum]);

		textBar = editor.dom.create('div', {
			id: editor.dom.uniqueId(),
			class: "textbar",
			style: "color: " + tagNodes[tagNum].color
		},
			tagNodes[tagNum].name
		);
		sideBar[tagNum].appendChild(textBar);

		tagBar[tagNum] = editor.dom.create('div', {
			id: editor.dom.uniqueId(),
			class: "tagbar",
			style: "color: " + tagNodes[tagNum].color
		});
		sideBar[tagNum].insertBefore(tagBar[tagNum], sideBar[tagNum].firstChild);

		maskBar[tagNum] = editor.dom.create('div', {
			id: editor.dom.uniqueId(),
			class: "maskbar",
			style: { top: selTop, height: selHeight, color: 'inherit', opacity: 1 }
		});
		tagBar[tagNum].appendChild(maskBar[tagNum]);
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
		var tagNum;

		//  Function to determine whether a selection is already entirely/partially/not tagged.
		function walkSelectionTree(node) {
			var 
				tagNum,
				tagName,
				childNode;

			if (node.type === 3) {	// Text node
				for (tagNum = 0; tagNum < tagNodes.length; tagNum++) {
					if (inspan[tagNum]) {
						tagged[tagNum] = true;
					} else {
						untagged[tagNum] = true;
					}
				}
			} else if ((node.name === "span") && ((tagName = node.attr("data-tag")) !== undefined)) {
				for (tagNum = 0; tagNum < tagNodes.length; tagNum++) {
					if (tagNodes[tagNum].name === tagName) {
						break;
					}
				}
				inspan[tagNum] = true;
				childNode = node.firstChild;
				while (childNode !== undefined && childNode !== null) {
					walkSelectionTree(childNode);
					childNode = childNode.next;
				}
				inspan[tagNum] = false;
			} else {
				childNode = node.firstChild;
				while (childNode !== undefined && childNode !== null) {
					walkSelectionTree(childNode);
					childNode = childNode.next;
				}
			}
		}
		
		function clickCheckBox() {
			var tagNum = Number(this.name());
			var value = this.value();
			
			if (value === true) {
				maskBar[tagNum].style.top = selTop;
				maskBar[tagNum].style.height = selHeight;
				maskBar[tagNum].style.color = 'inherit';
				maskBar[tagNum].style.opacity = 1;
			} else if (value === false && unselHeight !== undefined) {
				maskBar[tagNum].style.top = unselTop;
				maskBar[tagNum].style.height = unselHeight;
				maskBar[tagNum].style.color = 'white';
				maskBar[tagNum].style.opacity = 1;
			} else {
				maskBar[tagNum].style.opacity = 0;
			}
		}
			
		function tagWindowClose() {
			for (var tagNum = 0; tagNum < tagNodes.length; tagNum++) {
				maskBar[tagNum].style.opacity = 0;
			}
			updateBars();
		}

		function tagWindowSubmit(e) {
			var change = false;
			for (var tagNum = 0; tagNum < tagNodes.length; tagNum++) {
				if (e.data[tagNum] !== null) {
					if (e.data[tagNum]) {
						if (checked[tagNum] != true) {
							if (!change) {
								change = true;
								editor.undoManager.beforeChange();
							}
							editor.formatter.apply('tag', {
								tag: tagNodes[tagNum].name
							});
						}
					} else {
						if (checked[tagNum] != false) {
							if (!change) {
								change = true;
								editor.undoManager.beforeChange();
							}
							editor.formatter.remove('tag', {
								tag: tagNodes[tagNum].name
							});
						}
					}
				}
			}
			if (change) {
				editor.undoManager.add();
			}
		}
		
		function newTagCancel() {
			editor.windowManager.open({
				body: body,
				onsubmit: tagWindowSubmit,
				scrollbars: true,
			});
		}
		
		function newTagSubmit(e) {
			var value = e.data.name;
			var dom = editor.dom;
			
			if (value !== '') {
				tagNum = tagNodes.length;
				appendTagNode (value, tagNum);
				checked[tagNum] = false;
				body.splice(tagNum, 0, {
					type: 'checkbox',
					tristate: false,
					checked: true,
					name: tagNum.toString(),
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
			for (tagNum = 0; tagNum < tagNodes.length; tagNum++) {
				inspan[tagNum]   = false;
				tagged[tagNum]   = false;
				untagged[tagNum] = false;
			}
			walkSelectionTree(selectionRoot);
			for (tagNum = 0; tagNum < tagNodes.length; tagNum++) {
				if (tagged[tagNum] && !untagged[tagNum]) {
					checked[tagNum] = true;
				} else if (untagged[tagNum] && !tagged[tagNum]) {
					checked[tagNum] = editor.formatter.match('tag', {tag : tagNodes[tagNum].name});
				} else {
					checked[tagNum] = null;
				}
				body.push({
					type: 'checkbox',
					tristate: (checked[tagNum] === null),
					checked: checked[tagNum],
					name: tagNum.toString(),
					label: tagNodes[tagNum].name,
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

	
//	Editor customisation code - is this the right place for it?

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
		var
			tagName;
		
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
				"data-tag": "%tag",
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
		body.style.marginRight = sideBarWidth + "px";

		var contentareaiframe = contentareacontainer.firstChild;
		style = contentareaiframe.getAttribute("style") + " line-height: normal; display: inline-block;";
		contentareaiframe.setAttribute("style", style);

		sideDiv = dom.create('div', {
			id: dom.uniqueId(),
			class: "sidediv",
			style: "margin-left: " + -sideBarWidth + "px"
		});
		contentareacontainer.appendChild(sideDiv);
		
		var
			spans = editor.dom.select('span');

		for (spanIndex = 0; spanIndex < spans.length; spanIndex++) {
			var span = spans[spanIndex];
			tagName = span.getAttribute('data-tag');
			for (tagNum = 0; tagNum < tagNodes.length; tagNum++) {
				if (tagNodes[tagNum].name === tagName) {
					break;
				}
			}
			if (tagNum === tagNodes.length) {
				appendTagNode (tagName, tagNum)
			}
		}

		editor.on('setcontent', updateBars);
		editor.on('load ResizeEditor', resize);
		editor.on('load', scroll_sideDiv); /* Doesn't seem to work? */
		editor.getWin().onscroll = scroll_sideDiv;
	});
});