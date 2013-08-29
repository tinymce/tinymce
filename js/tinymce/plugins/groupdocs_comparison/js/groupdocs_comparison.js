tinyMCEPopup.requireLangPack();

var Groupdocs_comparisonDialog = {
	init : function() {
		var f = document.forms[0];

		// Get the selected contents as text and place it in the input
        f.embedKey.value = tinyMCEPopup.editor.selection.getContent({format : 'text'});
		f.groupdocs_file_id.value = tinyMCEPopup.editor.selection.getContent({format : 'text'});
		f.height.value = tinyMCEPopup.editor.selection.getContent({format : 'text'});
		f.width.value = tinyMCEPopup.editor.selection.getContent({format : 'text'});
		//f.somearg.value = tinyMCEPopup.getWindowArg('some_custom_arg');
//                		// Update form
//		tinymce.each(tinyMCEPopup.getWindowArg('data'), function(value, key) {
//			setVal(key, value);
//		});
	},

	insert : function() {
		// Insert the contents from the input into the document
                var embedKey = document.forms[0].embedKey.value;
                var fileId = document.forms[0].groupdocs_file_id.value;
                var height =  document.forms[0].height.value;
                var width = document.forms[0].width.value;
                var iframe = '<iframe src="http://apps.groupdocs.com/document-comparison/embed/'+embedKey+'/'+fileId+'?&referer=TinyMCE-Comparison/1.0" frameborder="0" width="'+width+'" height="'+height+'">'+
                        'If you can see this text, your browser does not support iframes. Please enable iframe support in your browser or use the latest version of any popular web browser such as Mozilla Firefox or Google Chrome. For more help, please check our documentation Wiki: http://groupdocs.com/docs/display/comparison/GroupDocs+Comparison+Integration+with+3rd+Party+Platforms'+
                            '</iframe>';
		tinyMCEPopup.editor.execCommand('mceInsertContent', false, iframe);
		tinyMCEPopup.close();
	}
};

tinyMCEPopup.onInit.add(Groupdocs_comparisonDialog.init, Groupdocs_comparisonDialog);
