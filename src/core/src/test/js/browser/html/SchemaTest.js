asynctest(
  'browser.tinymce.core.html.SchemaTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.html.Schema'
  ],
  function (LegacyUnit, Pipeline, Schema) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    var ok = function (value, label) {
      return LegacyUnit.equal(value, true, label);
    };

    suite.test('Valid elements global rule', function () {
      var schema = new Schema({ valid_elements: '@[id|style],img[src|-style]' });
      LegacyUnit.deepEqual(schema.getElementRule('img'), { "attributes": { "id": {}, "src": {} }, "attributesOrder": ["id", "src"] });
    });

    suite.test('Whildcard element rule', function () {
      var schema;

      schema = new Schema({ valid_elements: '*[id|class]' });
      LegacyUnit.deepEqual(schema.getElementRule('b').attributes, { "id": {}, "class": {} });
      LegacyUnit.deepEqual(schema.getElementRule('b').attributesOrder, ["id", "class"]);

      schema = new Schema({ valid_elements: 'b*[id|class]' });
      LegacyUnit.deepEqual(schema.getElementRule('b').attributes, { "id": {}, "class": {} });
      LegacyUnit.deepEqual(schema.getElementRule('b').attributesOrder, ["id", "class"]);
      LegacyUnit.deepEqual(schema.getElementRule('body').attributes, { "id": {}, "class": {} });
      LegacyUnit.deepEqual(schema.getElementRule('body').attributesOrder, ["id", "class"]);
      LegacyUnit.equal(schema.getElementRule('img'), undefined);

      schema = new Schema({ valid_elements: 'b?[id|class]' });
      LegacyUnit.deepEqual(schema.getElementRule('b').attributes, { "id": {}, "class": {} });
      LegacyUnit.deepEqual(schema.getElementRule('b').attributesOrder, ["id", "class"]);
      LegacyUnit.deepEqual(schema.getElementRule('bx').attributes, { "id": {}, "class": {} });
      LegacyUnit.deepEqual(schema.getElementRule('bx').attributesOrder, ["id", "class"]);
      LegacyUnit.equal(schema.getElementRule('body'), undefined);

      schema = new Schema({ valid_elements: 'b+[id|class]' });
      LegacyUnit.deepEqual(schema.getElementRule('body').attributes, { "id": {}, "class": {} });
      LegacyUnit.deepEqual(schema.getElementRule('body').attributesOrder, ["id", "class"]);
      LegacyUnit.deepEqual(schema.getElementRule('bx').attributes, { "id": {}, "class": {} });
      LegacyUnit.deepEqual(schema.getElementRule('bx').attributesOrder, ["id", "class"]);
      LegacyUnit.equal(schema.getElementRule('b'), undefined);
    });

    suite.test('Whildcard attribute rule', function () {
      var schema;

      schema = new Schema({ valid_elements: 'b[id|class|*]' });
      LegacyUnit.deepEqual(schema.getElementRule('b').attributes, { "id": {}, "class": {} });
      LegacyUnit.deepEqual(schema.getElementRule('b').attributesOrder, ["id", "class"]);
      ok(schema.getElementRule('b').attributePatterns[0].pattern.test('x'));

      schema = new Schema({ valid_elements: 'b[id|class|x?]' });
      LegacyUnit.deepEqual(schema.getElementRule('b').attributes, { "id": {}, "class": {} });
      LegacyUnit.deepEqual(schema.getElementRule('b').attributesOrder, ["id", "class"]);
      ok(schema.getElementRule('b').attributePatterns[0].pattern.test('xy'));
      ok(!schema.getElementRule('b').attributePatterns[0].pattern.test('xba'));
      ok(!schema.getElementRule('b').attributePatterns[0].pattern.test('a'));

      schema = new Schema({ valid_elements: 'b[id|class|x+]' });
      LegacyUnit.deepEqual(schema.getElementRule('b').attributes, { "id": {}, "class": {} });
      LegacyUnit.deepEqual(schema.getElementRule('b').attributesOrder, ["id", "class"]);
      ok(!schema.getElementRule('b').attributePatterns[0].pattern.test('x'));
      ok(schema.getElementRule('b').attributePatterns[0].pattern.test('xb'));
      ok(schema.getElementRule('b').attributePatterns[0].pattern.test('xba'));
    });

    suite.test('Valid attributes and attribute order', function () {
      var schema;

      schema = new Schema({ valid_elements: 'div,a[href|title],b[title]' });
      LegacyUnit.deepEqual(schema.getElementRule('div'), { "attributes": {}, "attributesOrder": [] });
      LegacyUnit.deepEqual(schema.getElementRule('a'), { "attributes": { "href": {}, "title": {} }, "attributesOrder": ["href", "title"] });
      LegacyUnit.deepEqual(schema.getElementRule('b'), { "attributes": { "title": {} }, "attributesOrder": ["title"] });
    });

    suite.test('Required any attributes', function () {
      var schema;

      schema = new Schema({ valid_elements: 'a![id|style|href]' });
      LegacyUnit.deepEqual(
        schema.getElementRule('a'),
        { "attributes": { "href": {}, "id": {}, "style": {} }, "attributesOrder": ["id", "style", "href"], "removeEmptyAttrs": true }
      );
    });

    suite.test('Required attributes', function () {
      var schema;

      schema = new Schema({ valid_elements: 'a[!href|!name]' });
      LegacyUnit.deepEqual(
        schema.getElementRule('a'),
        {
          "attributes": { "href": { "required": true }, "name": { "required": true } },
          "attributesOrder": ["href", "name"], "attributesRequired": ["href", "name"]
        }
      );
    });

    suite.test('Default attribute values', function () {
      var schema;

      schema = new Schema({ valid_elements: 'img[border=0]' });
      LegacyUnit.deepEqual(
        schema.getElementRule('img'),
        {
          "attributes": { "border": { "defaultValue": "0" } },
          "attributesOrder": ["border"],
          "attributesDefault": [{ "name": "border", "value": "0" }]
        }
      );
    });

    suite.test('Forced attribute values', function () {
      var schema;

      schema = new Schema({ valid_elements: 'img[border:0]' });
      LegacyUnit.deepEqual(
        schema.getElementRule('img'),
        {
          "attributes": { "border": { "forcedValue": "0" } },
          "attributesOrder": ["border"],
          "attributesForced": [{ "name": "border", "value": "0" }]
        }
      );
    });

    suite.test('Required attribute values', function () {
      var schema;

      schema = new Schema({ valid_elements: 'span[dir<ltr?rtl]' });
      LegacyUnit.deepEqual(
        schema.getElementRule('span'),
        {
          "attributes": { "dir": { "validValues": { "rtl": {}, "ltr": {} } } },
          "attributesOrder": ["dir"]
        }
      );
    });

    suite.test('Required parents', function () {
      var schema;

      schema = new Schema();
      LegacyUnit.deepEqual(schema.getElementRule('tr').parentsRequired, ['tbody', 'thead', 'tfoot']);
      LegacyUnit.deepEqual(schema.getElementRule('li').parentsRequired, ['ul', 'ol']);
      LegacyUnit.deepEqual(schema.getElementRule('div').parentsRequired, undefined);
    });

    suite.test('Remove empty elements', function () {
      var schema;

      schema = new Schema({ valid_elements: '-span' });
      LegacyUnit.deepEqual(schema.getElementRule('span'), { "attributes": {}, "attributesOrder": [], "removeEmpty": true });

      schema = new Schema({ valid_elements: '#span' });
      LegacyUnit.deepEqual(schema.getElementRule('span'), { "attributes": {}, "attributesOrder": [], "paddEmpty": true });
    });

    suite.test('addValidElements', function () {
      var schema;

      schema = new Schema({ valid_elements: '@[id|style],img[src|-style]' });
      schema.addValidElements('b[class]');
      LegacyUnit.deepEqual(
        schema.getElementRule('b'),
        {
          "attributes": { "id": {}, "style": {}, "class": {} },
          "attributesOrder": ["id", "style", "class"]
        }
      );
    });

    suite.test("addValidElements when there's a colon in an attribute name", function () {
      var schema;

      schema = new Schema({ valid_elements: '@[xml\\:space]' });
      schema.addValidElements('pre[xml\\:lang]');
      LegacyUnit.deepEqual(
        schema.getElementRule('pre'),
        {
          "attributes": { "xml:space":{}, "xml:lang": {} },
          "attributesOrder": ["xml:space", "xml:lang"]
        }
      );
    });

    suite.test('setValidElements', function () {
      var schema;

      schema = new Schema({ valid_elements: '@[id|style],img[src|-style]' });
      schema.setValidElements('b[class]');
      LegacyUnit.equal(schema.getElementRule('img'), undefined);
      LegacyUnit.deepEqual(schema.getElementRule('b'), { "attributes": { "class": {} }, "attributesOrder": ["class"] });

      schema = new Schema({ valid_elements: 'img[src]' });
      schema.setValidElements('@[id|style],img[src]');
      LegacyUnit.deepEqual(
        schema.getElementRule('img'),
        {
          "attributes": { "id": {}, "style": {}, "src": {} },
          "attributesOrder": ["id", "style", "src"]
        });
    });

    suite.test('getBoolAttrs', function () {
      var schema;

      schema = new Schema();
      LegacyUnit.deepEqual(schema.getBoolAttrs(), {
        "CONTROLS": {}, "LOOP": {}, "AUTOPLAY": {}, "SELECTED": {}, "READONLY": {}, "NOWRAP": {},
        "NOSHADE": {}, "NORESIZE": {}, "NOHREF": {}, "MULTIPLE": {}, "ISMAP": {}, "DISABLED": {}, "DEFER": {},
        "DECLARE": {}, "COMPACT": {}, "CHECKED": {},
        "controls": {}, "loop": {}, "autoplay": {}, "selected": {}, "readonly": {}, "nowrap": {},
        "noshade": {}, "noresize": {}, "nohref": {}, "multiple": {}, "ismap": {}, "disabled": {}, "defer": {},
        "declare": {}, "compact": {}, "checked": {}
      });
    });

    suite.test('getBlockElements', function () {
      var schema;

      schema = new Schema();
      LegacyUnit.deepEqual(schema.getBlockElements(), {
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

    suite.test('getShortEndedElements', function () {
      var schema;

      schema = new Schema();
      LegacyUnit.deepEqual(schema.getShortEndedElements(), {
        "EMBED": {}, "PARAM": {}, "META": {}, "LINK": {}, "ISINDEX": {},
        "INPUT": {}, "IMG": {}, "HR": {}, "FRAME": {}, "COL": {}, "BR": {},
        "BASEFONT": {}, "BASE": {}, "AREA": {}, "SOURCE" : {}, "WBR" : {}, "TRACK" : {},
        "embed": {}, "param": {}, "meta": {}, "link": {}, "isindex": {},
        "input": {}, "img": {}, "hr": {}, "frame": {}, "col": {}, "br": {},
        "basefont": {}, "base": {}, "area": {}, "source" : {}, "wbr" : {}, "track" : {}
      });
    });

    suite.test('getNonEmptyElements', function () {
      var schema;

      schema = new Schema();
      LegacyUnit.deepEqual(schema.getNonEmptyElements(), {
        "EMBED": {}, "PARAM": {}, "META": {}, "LINK": {}, "ISINDEX": {},
        "INPUT": {}, "IMG": {}, "HR": {}, "FRAME": {}, "COL": {}, "BR": {},
        "BASEFONT": {}, "BASE": {}, "AREA": {}, "SOURCE" : {},
        "TD": {}, "TH": {}, "IFRAME": {}, "VIDEO": {}, "AUDIO": {}, "OBJECT": {},
        "WBR": {}, "TRACK" : {}, "SCRIPT" : {}, "PRE": {}, "CODE": {},
        "embed": {}, "param": {}, "meta": {}, "link": {}, "isindex": {},
        "input": {}, "img": {}, "hr": {}, "frame": {}, "col": {}, "br": {},
        "basefont": {}, "base": {}, "area": {}, "source" : {},
        "td": {}, "th": {}, "iframe": {}, "video": {}, "audio": {}, "object": {},
        "wbr" : {}, "track" : {}, "script" : {}, "pre": {}, "code": {}
      });
    });

    suite.test('getWhiteSpaceElements', function () {
      var schema;

      schema = new Schema();
      LegacyUnit.deepEqual(schema.getWhiteSpaceElements(), {
        "IFRAME": {}, "NOSCRIPT": {}, "OBJECT": {}, "PRE": {}, "CODE": {},
        "SCRIPT": {}, "STYLE": {}, "TEXTAREA": {}, "VIDEO": {}, "AUDIO": {},
        "iframe": {}, "noscript": {}, "object": {}, "pre": {}, "code": {},
        "script": {}, "style": {}, "textarea": {}, "video": {}, "audio": {}
      });
    });

    suite.test('getTextBlockElements', function () {
      var schema;

      schema = new Schema();
      LegacyUnit.deepEqual(schema.getTextBlockElements(), {
        "ADDRESS": {}, "ARTICLE": {}, "ASIDE": {}, "BLOCKQUOTE": {}, "CENTER": {}, "DIR": {}, "DIV": {},
        "FIELDSET": {}, "FIGURE": {}, "FOOTER": {}, "FORM": {},
        "H1": {}, "H2": {}, "H3": {}, "H4": {}, "H5": {}, "H6": {}, "HEADER": {}, "HGROUP": {}, "NAV": {},
        "P": {}, "PRE": {}, "SECTION": {},
        "address": {}, "article": {}, "aside": {}, "blockquote": {}, "center": {}, "dir": {}, "div": {},
        "fieldset": {}, "figure": {}, "footer": {}, "form": {},
        "h1": {}, "h2": {}, "h3": {}, "h4": {}, "h5": {}, "h6": {}, "header": {}, "hgroup": {}, "nav": {},
        "p": {}, "pre": {}, "section": {}
      });
    });

    suite.test('getTextInlineElements', function () {
      var schema;

      schema = new Schema();
      LegacyUnit.deepEqual(schema.getTextInlineElements(), {
        "B": {}, "CITE": {}, "CODE": {}, "DFN": {}, "EM": {}, "FONT": {}, "I": {}, "MARK": {}, "Q": {},
        "SAMP": {}, "SPAN": {}, "STRIKE": {}, "STRONG": {}, "SUB": {}, "SUP": {}, "U": {}, "VAR": {},
        "b": {}, "cite": {}, "code": {}, "dfn": {}, "em": {}, "font": {}, "i": {}, "mark": {}, "q": {},
        "samp": {}, "span": {}, "strike": {}, "strong": {}, "sub": {}, "sup": {}, "u": {}, "var": {}
      });
    });

    suite.test('isValidChild', function () {
      var schema;

      schema = new Schema();
      ok(schema.isValidChild('body', 'p'));
      ok(schema.isValidChild('ul', 'LI'));
      ok(schema.isValidChild('p', 'img'));
      ok(schema.isValidChild('STRONG', 'span'));
      ok(!schema.isValidChild('body', 'body'));
      ok(!schema.isValidChild('p', 'body'));
    });

    suite.test('getElementRule', function () {
      var schema;

      schema = new Schema();
      ok(!!schema.getElementRule('b'));
      ok(!schema.getElementRule('bx'));
      ok(!schema.getElementRule(null));
    });

    suite.test('addCustomElements', function () {
      var schema;

      schema = new Schema({ valid_elements:'inline,block' });
      schema.addCustomElements('~inline,block');
      ok(!!schema.getElementRule('inline'));
      ok(!!schema.getElementRule('block'));
      ok(schema.isValidChild('body', 'block'));
      ok(schema.isValidChild('block', 'inline'));
      ok(schema.isValidChild('p', 'inline'));
    });

    suite.test('addValidChildren', function () {
      var schema;

      schema = new Schema();
      ok(schema.isValidChild('body', 'p'));
      ok(!schema.isValidChild('body', 'body'));
      ok(!schema.isValidChild('body', 'html'));
      schema.addValidChildren('+body[body|html]');
      ok(schema.isValidChild('body', 'body'));
      ok(schema.isValidChild('body', 'html'));

      schema = new Schema();
      ok(schema.isValidChild('body', 'p'));
      schema.addValidChildren('-body[p]');
      ok(!schema.isValidChild('body', 'p'));
    });

    suite.test('addCustomElements/getCustomElements', function () {
      var schema;

      schema = new Schema();
      schema.addCustomElements('~inline,block');
      ok(!!schema.getBlockElements().block);
      ok(!schema.getBlockElements().inline);
      ok(!!schema.getCustomElements().inline);
      ok(!!schema.getCustomElements().block);
    });

    suite.test('whitespaceElements', function () {
      var schema;

      schema = new Schema({ whitespace_elements : 'pre,p' });
      ok(!!schema.getWhiteSpaceElements().pre);
      ok(!schema.getWhiteSpaceElements().span);

      schema = new Schema({ whitespace_elements : 'code' });
      ok(!!schema.getWhiteSpaceElements().code);
    });

    suite.test('selfClosingElements', function () {
      var schema;

      schema = new Schema({ self_closing_elements : 'pre,p' });
      ok(!!schema.getSelfClosingElements().pre);
      ok(!!schema.getSelfClosingElements().p);
      ok(!schema.getSelfClosingElements().li);
    });

    suite.test('shortEndedElements', function () {
      var schema;

      schema = new Schema({ short_ended_elements : 'pre,p' });
      ok(!!schema.getShortEndedElements().pre);
      ok(!!schema.getShortEndedElements().p);
      ok(!schema.getShortEndedElements().img);
    });

    suite.test('booleanAttributes', function () {
      var schema;

      schema = new Schema({ boolean_attributes : 'href,alt' });
      ok(!!schema.getBoolAttrs().href);
      ok(!!schema.getBoolAttrs().alt);
      ok(!schema.getBoolAttrs().checked);
    });

    suite.test('nonEmptyElements', function () {
      var schema;

      schema = new Schema({ non_empty_elements : 'pre,p' });
      ok(!!schema.getNonEmptyElements().pre);
      ok(!!schema.getNonEmptyElements().p);
      ok(!schema.getNonEmptyElements().img);
    });

    suite.test('blockElements', function () {
      var schema;

      schema = new Schema({ block_elements : 'pre,p' });
      ok(!!schema.getBlockElements().pre);
      ok(!!schema.getBlockElements().p);
      ok(!schema.getBlockElements().h1);
    });

    suite.test('isValid', function () {
      var schema;

      schema = new Schema({ valid_elements : 'a[href],i[*]' });

      ok(schema.isValid('a'));
      ok(schema.isValid('a', 'href'));
      ok(!schema.isValid('b'));
      ok(!schema.isValid('b', 'href'));
      ok(!schema.isValid('a', 'id'));
      ok(schema.isValid('i'));
      ok(schema.isValid('i', 'id'));
    });

    suite.test('validStyles', function () {
      var schema;

      schema = new Schema({ valid_styles: 'color,font-size' });
      LegacyUnit.deepEqual(schema.getValidStyles(), {
        "*": [
          "color",
          "font-size"
        ]
      });

      schema = new Schema({ valid_styles: 'color font-size' });
      LegacyUnit.deepEqual(schema.getValidStyles(), {
        "*": [
          "color",
          "font-size"
        ]
      });

      schema = new Schema({
        valid_styles: {
          '*': 'color font-size',
          'a': 'background font-family'
        }
      });
      LegacyUnit.deepEqual(schema.getValidStyles(), {
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

    suite.test('invalidStyles', function () {
      var schema;

      schema = new Schema({ invalid_styles: 'color,font-size' });
      LegacyUnit.deepEqual(schema.getInvalidStyles(), {
        '*': {
          'color': {},
          'font-size': {}
        }
      });

      schema = new Schema({ invalid_styles: 'color font-size' });
      LegacyUnit.deepEqual(schema.getInvalidStyles(), {
        '*': {
          'color': {},
          'font-size': {}
        }
      });

      schema = new Schema({
        invalid_styles: {
          '*': 'color font-size',
          'a': 'background font-family'
        }
      });
      LegacyUnit.deepEqual(schema.getInvalidStyles(), {
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

    suite.test('validClasses', function () {
      var schema;

      schema = new Schema({ valid_classes: 'classA,classB' });
      LegacyUnit.deepEqual(schema.getValidClasses(), {
        '*': {
          'classA': {},
          'classB': {}
        }
      });

      schema = new Schema({ valid_classes: 'classA classB' });
      LegacyUnit.deepEqual(schema.getValidClasses(), {
        '*': {
          'classA': {},
          'classB': {}
        }
      });

      schema = new Schema({
        valid_classes: {
          '*': 'classA classB',
          'a': 'classC classD'
        }
      });
      LegacyUnit.deepEqual(schema.getValidClasses(), {
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

    Pipeline.async({}, suite.toSteps({}), function () {
      success();
    }, failure);
  }
);