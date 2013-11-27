tinymce.PluginManager.add("htmleditor", function (e) {
    e.addButton("htmleditor", {
        text: "HTML Editor",
        icon: !1,
        onclick: function () {
            e.windowManager.open({
                title: "HTML Editor",
                body: [{
					type: "textbox",
					name: "html_source",
					label: "HTML",
					value: e.selection.getContent( { format : 'html' } ),
					multiline: !0,
					minWidth: e.getParam("code_dialog_width", 600),
					minHeight: e.getParam("code_dialog_height", Math.min(tinymce.DOM.getViewPort().h - 200, 500)),
					spellcheck: !1,
					style: "direction: ltr; text-align: left"
                }],
                onsubmit: function (t) {
					// Set focus and set an undo point
					e.focus(), e.undoManager.transact(function () {
						// Update the selected text
						e.execCommand('mceReplaceContent', false, t.data.html_source)
					}), e.focus(), e.nodeChanged()
                }
            })
        }
    })
});
