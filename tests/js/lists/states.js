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

ParagraphBetweenOrderedLists = createState('<ol><li>Item1</li></ol><p>Test</p><ol><li>Item2</li></ol>', 'p', 2);
ParagraphBetweenUnorderedLists = createState('<ul><li>Item1</li></ul><p>Test</p><ul><li>Item2</li></ul>', 'p', 2);
ParagraphBetweenMixedLists = createState('<ol><li>Item1</li></ol><p>Test</p><ul><li>Item2</li></ul>', 'p', 2);

NonEmptyHeading = createState('<h1>Test</h1>', 'h1', 0);
TableCellWithoutBrs = createState('<table><tbody><tr><td>Test</td><td>&nbsp;</td></tr></tbody></table>', 'td', 4);
TableCellWithBrsFirstLine = createState('<table><tbody><tr><td>Test<br>Line 2</td><td>&nbsp;</td></tr></tbody></table>', 'td', 1);
TableCellWithBrsMiddleLine = createState('<table><tbody><tr><td>Test<br/>Line 2<br/>Line 3</td><td>&nbsp;</td></tr></tbody></table>', 'td br:nth-child(1)', 'after');
TableCellWithBrsLastLine = createState('<table><tbody><tr><td>Test<br>Line 2</td><td>&nbsp;</td></tr></tbody></table>', 'td br:nth-child(1)', 'after');
TableCellWithAdjacentBrsFirstLine = createState('<table><tbody><tr><td>Test<br><br>Line 2</td><td>&nbsp;</td></tr></tbody></table>', 'td', 1);

DefinitionListDescription = createState('<dl><dt>Term</dt><dd>Description</dd></dl>', 'dd', 2);
DefinitionListTerm = createState('<dl><dt>Term</dt><dd>Description</dd></dl>', 'dt', 2);
EndOfParagraphBeforeOL = createState('<p>Test</p><ol><li>Item</li></ol>', 'p', 4);
EndOfParagraphBeforeOLWithListType = createState('<p>Test</p><ol style="list-style-type: lower-alpha;"><li>Item</li></ol>', 'p', 4);
EndOfParagraphBeforeUL = createState('<p>Test</p><ul><li>Item</li></ul>', 'p', 4);
StartOfParagraphAfterOL = createState('<ol><li>Item</li></ol><p>Test</p>', 'p', 1);
StartOfParagraphAfterUL = createState('<ul><li>Item</li></ul><p>Test</p>', 'p', 1);
StartOfParagraphAfterOLWithListType = createState('<ol style="list-style-type: lower-alpha;"><li>Item</li></ol><p>Test</p>', 'p', 1);
EmptyOrderedListItem = createState('<ol><li>Before</li><li>&nbsp;</li><li>After</li></ol>', 'li:nth-child(2)', 0);
EmptyUnorderedListItem = createState('<ul><li>Before</li><li>&nbsp;</li><li>After</li></ul>', 'li:nth-child(2)', 0);
NonEmptyOrderedListItem = createState('<ol><li>Before</li><li>Test</li><li>After</li></ol>', 'li:nth-child(2)', 0);
NonEmptyUnorderedListItem = createState('<ul><li>Before</li><li>Test</li><li>After</li></ul>', 'li:nth-child(2)', 0);
NestedEmptyOrderedListItem = createState('<ol><li>Before<ol><li>&nbsp;</li></ol></li><li>After</li></ol>', 'li ol li', 0);
NestedEmptyUnorderedListItem = createState('<ul><li>Before<ul><li>&nbsp;</li></ul></li><li>After</li></ul>', 'li ul li', 0);
NestedNonEmptyOrderedListItem = createState('<ol><li>Before<ol><li>Test</li></ol></li><li>After</li></ol>', 'li ol li', 0);
NestedNonEmptyUnorderedListItem = createState('<ul><li>Before<ul><li>Test</li></ul></li><li>After</li></ul>', 'li ul li', 0);
NestedOrderedListWithMultipleItems = createState('<ol><li>Before<ol><li>Item1</li><li>Item2</li></ol></li></ol>', 'li ol li', 0);
NestedUnorderedListWithMultipleItems = createState('<ul><li>Before<ul><li>Item1</li><li>Item2</li></ul></li></ul>', 'li ul li', 0);
OrderedLowerAlphaListItem = createState('<ol style="list-style-type: lower-alpha;"><li>Item 1</li><li>Item 2</li></ol>', 'li:nth-child(2)', 0);
UnorderedSquareListItem = createState('<ul style="list-style-type: square;"><li>Item 1</li><li>Item 2</li></ul>', 'li:nth-child(2)', 0);

OrderedListItemWithNestedChild = createState('<ol><li>Item1<ol><li>Nested</li></ol></li></ol>', 'li:nth-child(1)', 2);
UnorderedListItemWithNestedChild = createState('<ul><li>Item1<ul><li>Nested</li></ul></li></ul>', 'li:nth-child(1)', 2);

OrderedListWithAdjacentNestedLists = createState('<ol><li style="list-style-type: none;"><ol><li>Item 1</li></ol></li><li>Item 2</li><li style="list-style-type: none;"><ol><li>Item 3</li></ol></li></ol>', 'li:nth-child(2)', 4);
UnorderedListWithAdjacentNestedLists = createState('<ul><li style="list-style-type: none;"><ul><li>Item 1</li></ul></li><li>Item 2</li><li style="list-style-type: none;"><ul><li>Item 3</li></ul></li></ul>', 'li:nth-child(2)', 4);

OrderedListItemWithMargin = createState('<ol><li style="margin-left: 60px;">Test</li></ol>', 'li', 0);
UnorderedListItemWithMargin = createState('<ul><li style="margin-left: 60px;">Test</li></ul>', 'li', 0);

OrderedListItemWithNestedAlphaList = createState('<ol><li>Item<ol style="list-style-type: lower-alpha;"><li>Nested</li></ol></li></ol>', 'li', 2);

/** Collapsed DIV Tests **/
OrderedListItemInsideDiv = createState('<div id="div"><ol>\n<li>Item1</li><li>Item2</li></ol></div>', 'li:nth-child(1)', 2);
UnorderedListItemInsideDiv = createState('<div id="div"><ul>\n<li>Item1</li><li>Item2</li></ul></div>', 'li:nth-child(1)', 2);

ParagraphInDiv = createState('<div><p>Item</p></div>', 'p', 2);
TextInDiv = createState('<div>Item</div>', 'div', 2);
TextWithBrsInDivFirstLine = createState('<div>Item1<br />Item2</div>', 'div', 2);
TextWithBrsInDivMiddleLine = createState('<div>Item1<br />Item2<br />Item3</div>', 'br:nth-child(1)', 'after');
TextWithBrsInDivLastLine = createState('<div>Item1<br />Item2</div>', 'br:nth-child(1)', 'after');

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

SingleLiOlSelection = createState('<ol><li>Item 1</li></ol>', 'li', 1, 'li', 4);
MultiLiOlSelection = createState('<ol><li>Item 1</li><li>Item 2</li></ol>', 'li:nth-child(1)', 1, 'li:nth-child(2)', 4);
SingleLiUlSelection = createState('<ul><li>Item 1</li></ul>', 'li', 1, 'li', 4);
MultiLiUlSelection = createState('<ul><li>Item 1</li><li>Item 2</li></ul>', 'li:nth-child(1)', 1, 'li:nth-child(2)', 4);
MultiNestedLiUlSelection = createState('<ul><li style="list-style-type: none;"><ul><li>Item 1</li><li>Item 2</li></ul></li></ul>', 'li li:nth-child(1)', 1, 'li li:nth-child(2)', 4);
MultiNestedLiOlSelection = createState('<ol><li style="list-style-type: none;"><ol><li>Item 1</li><li>Item 2</li></ol></li></ol>', 'li li:nth-child(1)', 1, 'li li:nth-child(2)', 4);

IndentedOlInOlCorrectSelection = createState('<ol><li>Item 1<ol><li>Indented</li></ol></li></ol>', 'li', 1, 'li li', 4);
IndentedUlInUlCorrectSelection = createState('<ul><li>Item 1<ul><li>Indented</li></ul></li></ul>', 'li', 1, 'li li', 4);
IndentedOlInOlIncorrectSelection = createState('<ol><li>Item 1</li><ol><li>Indented</li></ol></ol>', 'li', 1, 'ol ol li', 4);
IndentedUlInUlIncorrectSelection = createState('<ul><li>Item 1</li><ul><li>Indented</li></ul></ul>', 'li', 1, 'ul ul li', 4);

IndentedOlInUlCorrectSelection = createState('<ul><li>Item 1<ol><li>Indented</li></ol></li></ul>', 'li', 1, 'li li', 4);
IndentedUlInOlCorrectSelection = createState('<ol><li>Item 1<ul><li>Indented</li></ul></li></ol>', 'li', 1, 'li li', 4);
IndentedOlInUlIncorrectSelection = createState('<ul><li>Item 1</li><ol><li>Indented</li></ol></ul>', 'li', 1, 'ul ol li', 4);
IndentedUlInOlIncorrectSelection = createState('<ol><li>Item 1</li><ul><li>Indented</li></ul></ol>', 'li', 1, 'ol ul li', 4);

// TODO: Paragraph/heading to list combinations.
ParagraphBeforeOlSelection = createState('<p>Before</p><ol><li>Item 1</li></ol>', 'p', 3, 'li', 4);
ParagraphBeforeUlSelection = createState('<p>Before</p><ul><li>Item 1</li></ul>', 'p', 3, 'li', 4);
ParagraphAfterOlSelection = createState('<ol><li>Item 1</li></ol><p>After</p>', 'li', 4, 'p', 3);
ParagraphAfterUlSelection = createState('<ul><li>Item 1</li></ul><p>After</p>', 'li', 4, 'p', 3);
ParagraphBeforeAndAfterOlSelection = createState('<p>Before</p><ol><li>Item 1</li></ol><p>After</p>', 'p:nth-child(1)', 4, 'p:nth-child(3)', 3);
ParagraphBeforeAndAfterUlSelection = createState('<p>Before</p><ul><li>Item 1</li></ul><p>After</p>', 'p:nth-child(1)', 4, 'p:nth-child(3)', 3);