function fontFace(face) {
	if (tinymce.isOpera) {
		return '&quot;' + face + '&quot;';
	} else {
		return face;
	}
}

function trimContent(content) {
	if (tinymce.isOpera)
		return content.replace(/^<p>&nbsp;<\/p>/, '').replace(/<p>&nbsp;<\/p>$/, '');

	return content;
}
