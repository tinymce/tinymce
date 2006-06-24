function init() {
	tinyMCEPopup.resizeToInnerSize();

	var formObj = document.forms[0];

	formObj.numcols.value = tinyMCE.getWindowArg('numcols', 1);
	formObj.numrows.value = tinyMCE.getWindowArg('numrows', 1);
}

function mergeCells() {
	var args = new Array();
	var formObj = document.forms[0];

	args["numcols"] = formObj.numcols.value;
	args["numrows"] = formObj.numrows.value;

	tinyMCEPopup.execCommand("mceTableMergeCells", false, args);
	tinyMCEPopup.close();
}
