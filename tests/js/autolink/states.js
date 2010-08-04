function createState(content, startSelector, startOffset, endSelector, endOffset) {
	return function() {
		editor.setContent(content);
		setSelection(startSelector, startOffset, endSelector, endOffset);
	};
}

/** Collapsed Selection States **/
function EmptyParagraph() {
	var body = editor.getBody();
	while (body.firstChild) {
		editor.dom.remove(body.firstChild);
	}
	var p = body.ownerDocument.createElement('p');
	p.appendChild(body.ownerDocument.createTextNode(''));
	body.appendChild(p, body);
	setSelection(p.firstChild, 0);
}

function EmptyHeading() {
	EmptyParagraph();
	editor.dom.rename(editor.getBody().firstChild, 'h1');
	setSelection(editor.getBody().firstChild.firstChild, 0);
}

NonEmptyParagraph = createState('<p>Test</p>', 'p', 0);
ParagraphWithMarginLeft = createState('<p style="margin-left: 60px;">Test</p>', 'p', 0);
ParagraphWithPaddingLeft = createState('<p style="padding-left: 60px;">Test</p>', 'p', 0);
ParagraphWithMarginAndPaddingLeft = createState('<p style="margin-left: 60px; padding-left: 60px;">Test</p>', 'p', 0);

NonEmptyHeading = createState('<h1>Test</h1>', 'h1', 0);
TableCellWithoutBrs = createState('<table><tbody><tr><td>Test</td><td>&nbsp;</td></tr></tbody></table>', 'td', 4);
TableCellWithBrs = createState('<table><tbody><tr><td>Test<br>Line 2</td><td>&nbsp;</td></tr></tbody></table>', 'td', 1);