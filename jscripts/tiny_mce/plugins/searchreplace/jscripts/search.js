function init() {
	tinyMCEPopup.resizeToInnerSize();

	var formObj = document.forms[0];

	formObj.searchstring.value = tinyMCE.getWindowArg("searchstring");
	formObj.casesensitivebox.checked = tinyMCE.getWindowArg("casesensitive");
	formObj.backwards[0].checked = tinyMCE.getWindowArg("backwards");
	formObj.backwards[1].checked = !tinyMCE.getWindowArg("backwards");
//		formObj.wrapatend.checked = tinyMCE.getWindowArg("wrap");
//		formObj.wholeword.checked = tinyMCE.getWindowArg("wholeword");

	tinyMCEPopup.execCommand("mceResetSearch", false, {dummy : ""}, false);
}

function searchNext() {
	var formObj = document.forms[0];

	if (formObj.searchstring.value == "")
		return;

	// Do search
	tinyMCEPopup.execCommand('mceSearch', false, { 
		string : formObj.searchstring.value,
		casesensitive : formObj.casesensitivebox.checked,
		backwards : formObj.backwards[0].checked
//			wrap : formObj.wrapatend.checked,
//			wholeword : formObj.wholeword.checked
		}, false);

	window.focus();
}

function cancelAction() {
	tinyMCEPopup.close();
}
