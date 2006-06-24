function init() {
	tinyMCEPopup.resizeToInnerSize();

	var formObj = document.forms[0];

	formObj.searchstring.value = tinyMCE.getWindowArg("searchstring");
	formObj.replacestring.value = tinyMCE.getWindowArg("replacestring");
	formObj.casesensitivebox.checked = tinyMCE.getWindowArg("casesensitive");
//	formObj.backwards[0].checked = tinyMCE.getWindowArg("backwards");
//	formObj.backwards[1].checked = !tinyMCE.getWindowArg("backwards");
//		formObj.wrapatend.checked = tinyMCE.getWindowArg("wrap");
//		formObj.wholeword.checked = tinyMCE.getWindowArg("wholeword");

	tinyMCEPopup.execCommand("mceResetSearch", false, {dummy : ""}, false);
}

function searchNext(replacemode) {
	var formObj = document.forms[0];

	// Whats the point?
	if (formObj.searchstring.value == "" || formObj.searchstring.value == formObj.replacestring.value)
		return;

	// Do search
	tinyMCEPopup.execCommand('mceSearch', false, { 
		string : formObj.searchstring.value,
		replacestring : formObj.replacestring.value,
		replacemode : replacemode,
		casesensitive : formObj.casesensitivebox.checked,
		backwards : false
//			wrap : formObj.wrapatend.checked,
//			wholeword : formObj.wholeword.checked
		}, false);

	window.focus();
}

function cancelAction() {
	tinyMCEPopup.close();
}
