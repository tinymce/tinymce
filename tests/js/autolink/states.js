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

/** Expanded Selection States **/
SingleParagraphSelection = createState('<p>This is a test</p>', 'p', 5, 'p', 7);
MultipleParagraphSelection = createState('<p>This is a test</p><p>Second paragraph</p>', 'p:nth-child(1)', 5, 'p:nth-child(2)', 6);
SingleHeadingSelection = createState('<h1>This is a test</h1>', 'h1', 5, 'h1', 7);
MultipleHeadingSelection = createState('<h1>This is a test</h1><h1>Second paragraph</h1>', 'h1:nth-child(1)', 5, 'h1:nth-child(2)', 6);
SingleBlockSelection = createState('<div>This is a test</div>', 'div', 5, 'div', 7);
MultipleBlockSelection = createState('<div>This is a test</div><div>Second paragraph</div>', 'div:nth-child(1)', 5, 'div:nth-child(2)', 6);

CellWithoutBrSelection = createState('<table><tbody><tr><td>Cell 1</td></tr></tbody></table>', 'td', 1, 'td', 4);
CellWithBrSingleLineSelection = createState('<table><tbody><tr><td>Cell 1<br>Line 2</td></tr></tbody></table>', 'td', 1, 'td', 4);
CellWithBrMultipleLineSelection = createState('<table><tbody><tr><td>Cell 1<br>Line 2</td></tr></tbody></table>', 'td', 1, 'td', 4);

ParagraphToHeadingSelection = createState('<p>This is a test</p><h1>Second paragraph</h1>', 'p', 5, 'h1', 6);
ParagraphToBlockSelection = createState('<p>This is a test</p><div>Second paragraph</div>', 'p', 5, 'div', 6);
HeadingToParagraphSelection = createState('<h1>This is a test</h1><p>Second paragraph</p>', 'h1', 5, 'p', 6);
BlockToParagraphSelection = createState('<div>This is a test</div><p>Second paragraph</p>', 'div', 5, 'p', 6);
MultipleParagraphAndHeadingSelection = createState('<p>This is a test</p><h1>Second paragraph</h1><div>Third paragraph</div>', 'p', 5, 'div', 5);