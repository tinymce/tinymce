/**
 * plugin.js
 *
 * Released under LGPL License.
 * Author Craig Housley.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('annotate', function(editor, url) {
    // Add a button that opens a window
    editor.addButton('annotate', {
        //text: 'My button',
		title: 'Insert/edit annotation',
        image: url + '/img/annotation.png',
        onclick: showDialog,
		onpostrender: monitorNodeChange
    });
	
	editor.addButton('delete-annotation', {
        //text: 'My button',
		title: 'Remove annotation',
        image: url + '/img/delete-annotation.png',
        onclick: deleteAnnotation,
		onpostrender: monitorNodeChange
	});

    // Adds a menu item to the tools menu
    editor.addMenuItem('annotate', {
        text: 'Annotate',
		image: url + '/img/annotation.png',
        context: 'tools',
        onclick: showDialog
    });
		
	// highlight the annotate button if the user selects an annotation
	function monitorNodeChange() {
		var btn = this;
		editor.on('NodeChange', function(e) {
			btn.active(isAnnotation(e.element));
			//btn.disabled(!getSelectedText() && !isAnnotation(e.element));
		});
	}

	// check whether the currently selected text is an annotation
	function isAnnotation(elm) {
		return elm && elm.nodeName === 'SPAN' && elm.className == "annotation";
	}
	
	// gets called when the user clicks the annotation button in the toolbar
	function showDialog() {
		var data = {};
		var dom = editor.dom;
		var value = '', initialText = '';
		var selectedNode = editor.selection.getNode();
		// check whether we have currently selected an annotation
		var annotationSelected = isAnnotation(editor.selection.getStart());
		if (annotationSelected) {
			value = editor.dom.getAttrib(selectedNode, 'data-annotation-value');
			initialText = data.text = selectedNode.innerHTML;
		} else {
			initialText = getSelectedText() || '';
		}
		data.text = initialText;
		editor.windowManager.open({
			title: 'Annotation',
			body: [{type: 'textbox', name: 'annotationField', minWidth: 340, minHeight: 150, multiline: true, label: '', value: value},
			       {type: 'textbox', name: 'textToDisplayField', size: 40, label: 'Text to display', value: initialText,
						onkeyup: function() {
							// update the data.text as the user types
							data.text = this.value();
						},
						onPostRender: function() {
							// This is a workaround because the label field doesn't accept html by default. We want to show that the 'Text to display' field is compulsory by adding a red asterisk
                			this.getEl().previousSibling.innerHTML = "Text to display <span style=\"color:#ff0000\">*</span>";
						}
				   }],
			onsubmit: function(e) {
				var canSubmit = true; // canSubmit is set to false if the 'Text to display' field is blank
				function createAnnotation() {
					if (data.text.trim() == '') {
						editor.windowManager.alert("'Text to display' cannot be blank");
						canSubmit = false;
						return false;
					}
					// If we are editing an existing annotation <SPAN>, just update the data-annotation-value attribute and innerHTML if necessary
					if (annotationSelected) {
						if (e.data.annotationField.trim() == '') {
							deleteAnnotation();
						} else {
							$(selectedNode).attr("data-annotation-value", e.data.annotationField.replace(/"/g,'&quot;'));
						}
						if (initialText != data.text) {
							selectedNode.innerText = data.text;
						}
					} else {
						// check whether the selection contains any nested annotations and strip them out
						data.text = removeInnerAnnotations(data.text);
						// Check for a trailing space in the selection and put it outside the closing SPAN tag
						var trailingSpace = (data.text.search(/\ $/) > 0)? " " : "";
						// Create a new span element and insert it into the dom at the cursor position
						editor.selection.setContent('<span class="annotation" data-annotation-value="' + e.data.annotationField.replace(/"/g,'&quot;').trim() + '">' + data.text.trim() + '</span>' + trailingSpace);
					}
				}
				
				// We call createAnnotation() through the undoManager so that we have an undo point after the annotation is created
				function insertAnnotation() {
					editor.undoManager.transact(createAnnotation);
				}
				
				insertAnnotation();
				
				// We do not submit the form if the annotation wasn't created. The annotation won't be created if the 'Text to display' field is blank.
				if (!canSubmit) {
					return false;
				}
			}
		});
	}
	
	// Strip out any opening SPAN tags that represent annotations from the selected text.
	// We don't worry about matching the closing spans because TinyMCE will do the cleanup.
	function removeInnerAnnotations(selectionString) {
		return selectionString.replace(/<span\ [^(class)]*class="annotation"[^>]*>/g, "");
	}
	
	// Delete the annotation. Basically we remove the SPAN tag enclosing the text that the annotation is applied to
	function deleteAnnotation() {
		if (isAnnotation(editor.selection.getStart())) {
			var deletionNode = editor.selection.getNode();
			selectedText = deletionNode.innerHTML;
			editor.dom.remove(deletionNode, selectedText);
			// store a snapshot for the undo action
			editor.undoManager.add();
		}
	}
	
	// Query the tinymce editor to get the selected text. If none selected, return false
	function getSelectedText() {
		return editor.selection.getContent() || false;
	}
	
});