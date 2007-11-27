tinyMCEPopup.requireLangPack();

function init() {
	tinyMCEPopup.resizeToInnerSize();

	var formObj = document.forms[0];

	formObj.numcols.value = tinyMCEPopup.getWindowArg('numcols', 1);
	formObj.numrows.value = tinyMCEPopup.getWindowArg('numrows', 1);
}

function mergeCells() {
	var args = new Array();
	var formObj = document.forms[0];

	if (!AutoValidator.validate(formObj)) {
		alert(tinyMCEPopup.getLang('invalid_data'));
		return false;
	}

	args["numcols"] = formObj.numcols.value;
	args["numrows"] = formObj.numrows.value;

	tinyMCEPopup.execCommand("mceTableMergeCells", false, args);
	tinyMCEPopup.close();
}

tinyMCEPopup.onInit.add(init);
