module("tinymce.html.Schema");

test('Valid elements global rule', function() {
	expect(1);

	var schema = new tinymce.html.Schema({valid_elements: '@[id|style],img[src|-style]'});
	deepEqual(schema.getElementRule('img'), {"attributes": {"id": {}, "src": {}}, "attributesOrder": ["id", "src"]});
});

test('Whildcard element rule', function() {
	var schema;

	expect(17);

	schema = new tinymce.html.Schema({valid_elements: '*[id|class]'});
	deepEqual(schema.getElementRule('b').attributes, {"id": {}, "class": {} });
	deepEqual(schema.getElementRule('b').attributesOrder, ["id", "class"]);

	schema = new tinymce.html.Schema({valid_elements: 'b*[id|class]'});
	deepEqual(schema.getElementRule('b').attributes, {"id": {}, "class": {} });
	deepEqual(schema.getElementRule('b').attributesOrder, ["id", "class"]);
	deepEqual(schema.getElementRule('body').attributes, {"id": {}, "class": {} });
	deepEqual(schema.getElementRule('body').attributesOrder, ["id", "class"]);
	equal(schema.getElementRule('img'), undefined);

	schema = new tinymce.html.Schema({valid_elements: 'b?[id|class]'});
	deepEqual(schema.getElementRule('b').attributes, {"id": {}, "class": {} });
	deepEqual(schema.getElementRule('b').attributesOrder, ["id", "class"]);
	deepEqual(schema.getElementRule('bx').attributes, {"id": {}, "class": {} });
	deepEqual(schema.getElementRule('bx').attributesOrder, ["id", "class"]);
	equal(schema.getElementRule('body'), undefined);

	schema = new tinymce.html.Schema({valid_elements: 'b+[id|class]'});
	deepEqual(schema.getElementRule('body').attributes, {"id": {}, "class": {} });
	deepEqual(schema.getElementRule('body').attributesOrder, ["id", "class"]);
	deepEqual(schema.getElementRule('bx').attributes, {"id": {}, "class": {} });
	deepEqual(schema.getElementRule('bx').attributesOrder, ["id", "class"]);
	equal(schema.getElementRule('b'), undefined);
});

test('Whildcard attribute rule', function() {
	var schema;

	expect(13);

	schema = new tinymce.html.Schema({valid_elements: 'b[id|class|*]'});
	deepEqual(schema.getElementRule('b').attributes, {"id": {}, "class": {} });
	deepEqual(schema.getElementRule('b').attributesOrder, ["id", "class"]);
	ok(schema.getElementRule('b').attributePatterns[0].pattern.test('x'));

	schema = new tinymce.html.Schema({valid_elements: 'b[id|class|x?]'});
	deepEqual(schema.getElementRule('b').attributes, {"id": {}, "class": {} });
	deepEqual(schema.getElementRule('b').attributesOrder, ["id", "class"]);
	ok(schema.getElementRule('b').attributePatterns[0].pattern.test('xy'));
	ok(!schema.getElementRule('b').attributePatterns[0].pattern.test('xba'));
	ok(!schema.getElementRule('b').attributePatterns[0].pattern.test('a'));

	schema = new tinymce.html.Schema({valid_elements: 'b[id|class|x+]'});
	deepEqual(schema.getElementRule('b').attributes, {"id": {}, "class": {} });
	deepEqual(schema.getElementRule('b').attributesOrder, ["id", "class"]);
	ok(!schema.getElementRule('b').attributePatterns[0].pattern.test('x'));
	ok(schema.getElementRule('b').attributePatterns[0].pattern.test('xb'));
	ok(schema.getElementRule('b').attributePatterns[0].pattern.test('xba'));
});

test('Valid attributes and attribute order', function() {
	var schema;

	expect(3);

	schema = new tinymce.html.Schema({valid_elements: 'div,a[href|title],b[title]'});
	deepEqual(schema.getElementRule('div'), {"attributes": {}, "attributesOrder": []});
	deepEqual(schema.getElementRule('a'), {"attributes": {"href": {}, "title": {}}, "attributesOrder": ["href", "title"]});
	deepEqual(schema.getElementRule('b'), {"attributes": {"title": {}}, "attributesOrder": ["title"]});
});

test('Required any attributes', function() {
	var schema;

	expect(1);

	schema = new tinymce.html.Schema({valid_elements: 'a![id|style|href]'});
	deepEqual(schema.getElementRule('a'), {"attributes": {"href": {}, "id": {}, "style": {}}, "attributesOrder": ["id", "style", "href"], "removeEmptyAttrs": true});
});

test('Required attributes', function() {
	var schema;

	expect(1);

	schema = new tinymce.html.Schema({valid_elements: 'a[!href|!name]'});
	deepEqual(schema.getElementRule('a'), {"attributes": {"href": {"required": true}, "name": {"required": true}}, "attributesOrder": ["href", "name"], "attributesRequired": ["href", "name"]});
});

test('Default attribute values', function() {
	var schema;

	expect(1);

	schema = new tinymce.html.Schema({valid_elements: 'img[border=0]'});
	deepEqual(schema.getElementRule('img'), {"attributes": {"border": {"defaultValue": "0"}}, "attributesOrder": ["border"], "attributesDefault": [{"name": "border", "value": "0"}]});
});

test('Forced attribute values', function() {
	var schema;

	expect(1);

	schema = new tinymce.html.Schema({valid_elements: 'img[border:0]'});
	deepEqual(schema.getElementRule('img'), {"attributes": {"border": {"forcedValue": "0"}}, "attributesOrder": ["border"], "attributesForced": [{"name": "border", "value": "0"}]});
});

test('Required attribute values', function() {
	var schema;

	expect(1);

	schema = new tinymce.html.Schema({valid_elements: 'span[dir<ltr?rtl]'});
	deepEqual(schema.getElementRule('span'), {"attributes": {"dir": {"validValues": {"rtl": {}, "ltr": {}}}}, "attributesOrder": ["dir"]});
});

test('Required parents', function() {
	var schema;

	schema = new tinymce.html.Schema();
	deepEqual(schema.getElementRule('tr').parentsRequired, ['tbody', 'thead', 'tfoot']);
	deepEqual(schema.getElementRule('li').parentsRequired, ['ul', 'ol']);
	deepEqual(schema.getElementRule('div').parentsRequired, undefined);
});

test('Remove empty elements', function() {
	var schema;

	expect(2);

	schema = new tinymce.html.Schema({valid_elements: '-span'});
	deepEqual(schema.getElementRule('span'), {"attributes": {}, "attributesOrder": [], "removeEmpty": true});

	schema = new tinymce.html.Schema({valid_elements: '#span'});
	deepEqual(schema.getElementRule('span'), {"attributes": {}, "attributesOrder": [], "paddEmpty": true});
});

test('addValidElements', function() {
	var schema;

	expect(1);

	schema = new tinymce.html.Schema({valid_elements: '@[id|style],img[src|-style]'});
	schema.addValidElements('b[class]');
	deepEqual(schema.getElementRule('b'), {"attributes": {"id": {}, "style": {}, "class": {}}, "attributesOrder": ["id", "style", "class"]});
});

test('setValidElements', function() {
	var schema;

	expect(3);

	schema = new tinymce.html.Schema({valid_elements: '@[id|style],img[src|-style]'});
	schema.setValidElements('b[class]');
	equal(schema.getElementRule('img'), undefined);
	deepEqual(schema.getElementRule('b'), {"attributes": {"class": {}}, "attributesOrder": ["class"]});

	schema = new tinymce.html.Schema({valid_elements: 'img[src]'});
	schema.setValidElements('@[id|style],img[src]');
	deepEqual(schema.getElementRule('img'), {"attributes": {"id": {}, "style": {}, "src": {}}, "attributesOrder": ["id", "style", "src"]});
});

test('getBoolAttrs', function() {
	var schema;

	expect(1);

	schema = new tinymce.html.Schema();
	deepEqual(schema.getBoolAttrs(), {
		"CONTROLS": {}, "LOOP": {}, "AUTOPLAY": {}, "SELECTED": {}, "READONLY": {}, "NOWRAP": {},
		"NOSHADE": {}, "NORESIZE": {}, "NOHREF": {}, "MULTIPLE": {}, "ISMAP": {}, "DISABLED": {}, "DEFER": {},
		"DECLARE": {}, "COMPACT": {}, "CHECKED": {},
		"controls": {}, "loop": {}, "autoplay": {}, "selected": {}, "readonly": {}, "nowrap": {},
		"noshade": {}, "noresize": {}, "nohref": {}, "multiple": {}, "ismap": {}, "disabled": {}, "defer": {},
		"declare": {}, "compact": {}, "checked": {}
	});
});

test('getBlockElements', function() {
	var schema;

	expect(1);

	schema = new tinymce.html.Schema();
	deepEqual(schema.getBlockElements(), {
		ASIDE: {}, HGROUP: {}, SECTION: {}, ARTICLE: {}, FOOTER: {}, HEADER: {},
		ISINDEX: {}, MENU: {}, NOSCRIPT: {}, FIELDSET: {}, FIGCAPTION: {}, DIR: {}, DD: {}, DT: {},
		DL: {}, CENTER: {}, BLOCKQUOTE: {}, CAPTION: {}, UL: {}, OL: {}, LI: {},
		TD: {}, TR: {}, TH: {}, TFOOT: {}, THEAD: {}, TBODY: {}, TABLE: {}, FORM: {},
		PRE: {}, ADDRESS: {}, DIV: {}, P: {}, HR: {}, H6: {}, H5: {}, H4: {}, H3: {},
		H2: {}, H1: {}, NAV: {}, FIGURE: {}, DATALIST: {}, OPTGROUP: {}, OPTION: {}, SELECT: {},
		aside: {}, hgroup: {}, section: {}, article: {}, footer: {}, header: {},
		isindex: {}, menu: {}, noscript: {}, fieldset: {}, dir: {}, dd: {}, dt: {}, dl: {}, center: {},
		blockquote: {}, caption: {}, ul: {}, ol: {}, li: {}, td: {}, tr: {}, th: {}, tfoot: {}, thead: {},
		tbody: {}, table: {}, form: {}, pre: {}, address: {}, div: {}, p: {}, hr: {}, h6: {},
		h5: {}, h4: {}, h3: {}, h2: {}, h1: {}, nav: {}, figure: {}, figcaption: {}, datalist: {}, optgroup: {},
		option: {}, select: {}
	});
});

test('getShortEndedElements', function() {
	var schema;

	expect(1);

	schema = new tinymce.html.Schema();
	deepEqual(schema.getShortEndedElements(), {
		"EMBED": {}, "PARAM": {}, "META": {}, "LINK": {}, "ISINDEX": {},
		"INPUT": {}, "IMG": {}, "HR": {}, "FRAME": {}, "COL": {}, "BR": {},
		"BASEFONT": {}, "BASE": {}, "AREA": {}, "SOURCE" : {}, "WBR" : {}, "TRACK" : {},
		"embed": {}, "param": {}, "meta": {}, "link": {}, "isindex": {},
		"input": {}, "img": {}, "hr": {}, "frame": {}, "col": {}, "br": {},
		"basefont": {}, "base": {}, "area": {}, "source" : {}, "wbr" : {}, "track" : {}
	});
});

test('getNonEmptyElements', function() {
	var schema;

	expect(1);

	schema = new tinymce.html.Schema();
	deepEqual(schema.getNonEmptyElements(), {
		"EMBED": {}, "PARAM": {}, "META": {}, "LINK": {}, "ISINDEX": {},
		"INPUT": {}, "IMG": {}, "HR": {}, "FRAME": {}, "COL": {}, "BR": {},
		"BASEFONT": {}, "BASE": {}, "AREA": {}, "SOURCE" : {},
		"TD": {}, "TH": {}, "IFRAME": {}, "VIDEO": {}, "AUDIO": {}, "OBJECT": {}, "WBR": {}, "TRACK" : {}, "SCRIPT" : {},
		"embed": {}, "param": {}, "meta": {}, "link": {}, "isindex": {},
		"input": {}, "img": {}, "hr": {}, "frame": {}, "col": {}, "br": {},
		"basefont": {}, "base": {}, "area": {}, "source" : {},
		"td": {}, "th": {}, "iframe": {}, "video": {}, "audio": {}, "object": {}, "wbr" : {}, "track" : {},  "script" : {}
	});
});

test('getWhiteSpaceElements', function() {
	var schema;

	expect(1);

	schema = new tinymce.html.Schema();
	deepEqual(schema.getWhiteSpaceElements(), {
		"IFRAME": {}, "NOSCRIPT": {}, "OBJECT": {}, "PRE": {},
		"SCRIPT": {}, "STYLE": {}, "TEXTAREA": {}, "VIDEO": {}, "AUDIO": {},
		"iframe": {}, "noscript": {}, "object": {}, "pre": {},
		"script": {}, "style": {}, "textarea": {}, "video": {}, "audio": {}
	});
});

test('getTextBlockElements', function() {
	var schema;

	expect(1);

	schema = new tinymce.html.Schema();
	deepEqual(schema.getTextBlockElements(), {
		"ADDRESS": {}, "ARTICLE": {}, "ASIDE": {}, "BLOCKQUOTE": {}, "CENTER": {}, "DIR": {}, "DIV": {}, "FIELDSET": {}, "FIGURE": {}, "FOOTER": {}, "FORM": {},
		"H1": {}, "H2": {}, "H3": {}, "H4": {}, "H5": {}, "H6": {}, "HEADER": {}, "HGROUP": {}, "NAV": {}, "P": {}, "PRE": {}, "SECTION": {},
		"address": {}, "article": {}, "aside": {}, "blockquote": {}, "center": {}, "dir": {}, "div": {}, "fieldset": {}, "figure": {}, "footer": {}, "form": {},
		"h1": {}, "h2": {}, "h3": {}, "h4": {}, "h5": {}, "h6": {}, "header": {}, "hgroup": {}, "nav": {}, "p": {}, "pre": {}, "section": {}
	});
});

test('getTextInlineElements', function() {
	var schema;

	expect(1);

	schema = new tinymce.html.Schema();
	deepEqual(schema.getTextInlineElements(), {
		"B": {}, "CITE": {}, "CODE": {}, "DFN": {},	"EM": {}, "FONT": {}, "I": {}, "MARK": {}, "Q": {},
		"SAMP": {}, "SPAN": {}, "STRIKE": {}, "STRONG": {}, "SUB": {}, "SUP": {}, "U": {}, "VAR": {},
		"b": {}, "cite": {}, "code": {}, "dfn": {}, "em": {}, "font": {}, "i": {}, "mark": {}, "q": {},
		"samp": {}, "span": {}, "strike": {}, "strong": {}, "sub": {}, "sup": {}, "u": {}, "var": {}
	});
});

test('isValidChild', function() {
	var schema;

	expect(4);

	schema = new tinymce.html.Schema();
	ok(schema.isValidChild('body', 'p'));
	ok(schema.isValidChild('p', 'img'));
	ok(!schema.isValidChild('body', 'body'));
	ok(!schema.isValidChild('p', 'body'));
});

test('getElementRule', function() {
	var schema;

	expect(3);

	schema = new tinymce.html.Schema();
	ok(schema.getElementRule('b'));
	ok(!schema.getElementRule('bx'));
	ok(!schema.getElementRule(null));
});

test('addCustomElements', function() {
	var schema;

	expect(5);

	schema = new tinymce.html.Schema({valid_elements:'inline,block'});
	schema.addCustomElements('~inline,block');
	ok(schema.getElementRule('inline'));
	ok(schema.getElementRule('block'));
	ok(schema.isValidChild('body', 'block'));
	ok(schema.isValidChild('block', 'inline'));
	ok(schema.isValidChild('p', 'inline'));
});

test('addValidChildren', function() {
	var schema;

	expect(7);

	schema = new tinymce.html.Schema();
	ok(schema.isValidChild('body', 'p'));
	ok(!schema.isValidChild('body', 'body'));
	ok(!schema.isValidChild('body', 'html'));
	schema.addValidChildren('+body[body|html]');
	ok(schema.isValidChild('body', 'body'));
	ok(schema.isValidChild('body', 'html'));

	schema = new tinymce.html.Schema();
	ok(schema.isValidChild('body', 'p'));
	schema.addValidChildren('-body[p]');
	ok(!schema.isValidChild('body', 'p'));
});

test('addCustomElements/getCustomElements', function() {
	var schema;

	expect(4);

	schema = new tinymce.html.Schema();
	schema.addCustomElements('~inline,block');
	ok(schema.getBlockElements().block);
	ok(!schema.getBlockElements().inline);
	ok(schema.getCustomElements().inline);
	ok(schema.getCustomElements().block);
});

test('whitespaceElements', function() {
	var schema;

	expect(3);

	schema = new tinymce.html.Schema({whitespace_elements : 'pre,p'});
	ok(schema.getWhiteSpaceElements().pre);
	ok(!schema.getWhiteSpaceElements().span);

	schema = new tinymce.html.Schema({whitespace_elements : 'code'});
	ok(schema.getWhiteSpaceElements().code);
});

test('selfClosingElements', function() {
	var schema;

	expect(3);

	schema = new tinymce.html.Schema({self_closing_elements : 'pre,p'});
	ok(schema.getSelfClosingElements().pre);
	ok(schema.getSelfClosingElements().p);
	ok(!schema.getSelfClosingElements().li);
});

test('shortEndedElements', function() {
	var schema;

	expect(3);

	schema = new tinymce.html.Schema({short_ended_elements : 'pre,p'});
	ok(schema.getShortEndedElements().pre);
	ok(schema.getShortEndedElements().p);
	ok(!schema.getShortEndedElements().img);
});

test('booleanAttributes', function() {
	var schema;

	expect(3);

	schema = new tinymce.html.Schema({boolean_attributes : 'href,alt'});
	ok(schema.getBoolAttrs().href);
	ok(schema.getBoolAttrs().alt);
	ok(!schema.getBoolAttrs().checked);
});

test('nonEmptyElements', function() {
	var schema;

	expect(3);

	schema = new tinymce.html.Schema({non_empty_elements : 'pre,p'});
	ok(schema.getNonEmptyElements().pre);
	ok(schema.getNonEmptyElements().p);
	ok(!schema.getNonEmptyElements().img);
});

test('blockElements', function() {
	var schema;

	expect(3);

	schema = new tinymce.html.Schema({block_elements : 'pre,p'});
	ok(schema.getBlockElements().pre);
	ok(schema.getBlockElements().p);
	ok(!schema.getBlockElements().h1);
});

test('isValid', function() {
	var schema;

	schema = new tinymce.html.Schema({valid_elements : 'a[href],i[*]'});

	ok(schema.isValid('a'));
	ok(schema.isValid('a', 'href'));
	ok(!schema.isValid('b'));
	ok(!schema.isValid('b', 'href'));
	ok(!schema.isValid('a', 'id'));
	ok(schema.isValid('i'));
	ok(schema.isValid('i', 'id'));
});

test('validStyles', function() {
	var schema;

	schema = new tinymce.html.Schema({valid_styles: 'color,font-size'});
	deepEqual(schema.getValidStyles(), {
		"*": [
			"color",
			"font-size"
		]
	});

	schema = new tinymce.html.Schema({valid_styles: 'color font-size'});
	deepEqual(schema.getValidStyles(), {
		"*": [
			"color",
			"font-size"
		]
	});

	schema = new tinymce.html.Schema({
		valid_styles: {
			'*': 'color font-size',
			'a': 'background font-family'
		}
	});
	deepEqual(schema.getValidStyles(), {
		"*": [
			"color",
			"font-size"
		],

		"a": [
			"background",
			"font-family"
		],

		"A": [
			"background",
			"font-family"
		]
	});
});

test('invalidStyles', function() {
	var schema;

	schema = new tinymce.html.Schema({invalid_styles: 'color,font-size'});
	deepEqual(schema.getInvalidStyles(), {
		'*': {
			'color': {},
			'font-size': {}
		}
	});

	schema = new tinymce.html.Schema({invalid_styles: 'color font-size'});
	deepEqual(schema.getInvalidStyles(), {
		'*': {
			'color': {},
			'font-size': {}
		}
	});

	schema = new tinymce.html.Schema({
		invalid_styles: {
			'*': 'color font-size',
			'a': 'background font-family'
		}
	});
	deepEqual(schema.getInvalidStyles(), {
		'*': {
			'color': {},
			'font-size': {}
		},

		'a': {
			'background': {},
			'font-family': {}
		},

		'A': {
			'background': {},
			'font-family': {}
		}
	});
});

test('validClasses', function() {
	var schema;

	schema = new tinymce.html.Schema({valid_classes: 'classA,classB'});
	deepEqual(schema.getValidClasses(), {
		'*': {
			'classA': {},
			'classB': {}
		}
	});

	schema = new tinymce.html.Schema({valid_classes: 'classA classB'});
	deepEqual(schema.getValidClasses(), {
		'*': {
			'classA': {},
			'classB': {}
		}
	});

	schema = new tinymce.html.Schema({
		valid_classes: {
			'*': 'classA classB',
			'a': 'classC classD'
		}
	});
	deepEqual(schema.getValidClasses(), {
		'*': {
			'classA': {},
			'classB': {}
		},

		'a': {
			'classC': {},
			'classD': {}
		},

		'A': {
			'classC': {},
			'classD': {}
		}
	});
});
