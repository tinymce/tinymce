import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import Schema from 'tinymce/core/api/html/Schema';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.html.SchemaTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  const ok = function (value, label?) {
    return LegacyUnit.equal(value, true, label);
  };

  suite.test('Valid elements global rule', function () {
    const schema = Schema({ valid_elements: '@[id|style],img[src|-style]' });
    LegacyUnit.deepEqual(schema.getElementRule('img'), { attributes: { id: {}, src: {} }, attributesOrder: ['id', 'src'] });
  });

  suite.test('Whildcard element rule', function () {
    let schema;

    schema = Schema({ valid_elements: '*[id|class]' });
    LegacyUnit.deepEqual(schema.getElementRule('b').attributes, { id: {}, class: {} });
    LegacyUnit.deepEqual(schema.getElementRule('b').attributesOrder, ['id', 'class']);

    schema = Schema({ valid_elements: 'b*[id|class]' });
    LegacyUnit.deepEqual(schema.getElementRule('b').attributes, { id: {}, class: {} });
    LegacyUnit.deepEqual(schema.getElementRule('b').attributesOrder, ['id', 'class']);
    LegacyUnit.deepEqual(schema.getElementRule('body').attributes, { id: {}, class: {} });
    LegacyUnit.deepEqual(schema.getElementRule('body').attributesOrder, ['id', 'class']);
    LegacyUnit.equal(schema.getElementRule('img'), undefined);

    schema = Schema({ valid_elements: 'b?[id|class]' });
    LegacyUnit.deepEqual(schema.getElementRule('b').attributes, { id: {}, class: {} });
    LegacyUnit.deepEqual(schema.getElementRule('b').attributesOrder, ['id', 'class']);
    LegacyUnit.deepEqual(schema.getElementRule('bx').attributes, { id: {}, class: {} });
    LegacyUnit.deepEqual(schema.getElementRule('bx').attributesOrder, ['id', 'class']);
    LegacyUnit.equal(schema.getElementRule('body'), undefined);

    schema = Schema({ valid_elements: 'b+[id|class]' });
    LegacyUnit.deepEqual(schema.getElementRule('body').attributes, { id: {}, class: {} });
    LegacyUnit.deepEqual(schema.getElementRule('body').attributesOrder, ['id', 'class']);
    LegacyUnit.deepEqual(schema.getElementRule('bx').attributes, { id: {}, class: {} });
    LegacyUnit.deepEqual(schema.getElementRule('bx').attributesOrder, ['id', 'class']);
    LegacyUnit.equal(schema.getElementRule('b'), undefined);
  });

  suite.test('Whildcard attribute rule', function () {
    let schema;

    schema = Schema({ valid_elements: 'b[id|class|*]' });
    LegacyUnit.deepEqual(schema.getElementRule('b').attributes, { id: {}, class: {} });
    LegacyUnit.deepEqual(schema.getElementRule('b').attributesOrder, ['id', 'class']);
    ok(schema.getElementRule('b').attributePatterns[0].pattern.test('x'));

    schema = Schema({ valid_elements: 'b[id|class|x?]' });
    LegacyUnit.deepEqual(schema.getElementRule('b').attributes, { id: {}, class: {} });
    LegacyUnit.deepEqual(schema.getElementRule('b').attributesOrder, ['id', 'class']);
    ok(schema.getElementRule('b').attributePatterns[0].pattern.test('xy'));
    ok(!schema.getElementRule('b').attributePatterns[0].pattern.test('xba'));
    ok(!schema.getElementRule('b').attributePatterns[0].pattern.test('a'));

    schema = Schema({ valid_elements: 'b[id|class|x+]' });
    LegacyUnit.deepEqual(schema.getElementRule('b').attributes, { id: {}, class: {} });
    LegacyUnit.deepEqual(schema.getElementRule('b').attributesOrder, ['id', 'class']);
    ok(!schema.getElementRule('b').attributePatterns[0].pattern.test('x'));
    ok(schema.getElementRule('b').attributePatterns[0].pattern.test('xb'));
    ok(schema.getElementRule('b').attributePatterns[0].pattern.test('xba'));
  });

  suite.test('Valid attributes and attribute order', function () {
    let schema;

    schema = Schema({ valid_elements: 'div,a[href|title],b[title]' });
    LegacyUnit.deepEqual(schema.getElementRule('div'), { attributes: {}, attributesOrder: [] });
    LegacyUnit.deepEqual(schema.getElementRule('a'), { attributes: { href: {}, title: {} }, attributesOrder: ['href', 'title'] });
    LegacyUnit.deepEqual(schema.getElementRule('b'), { attributes: { title: {} }, attributesOrder: ['title'] });
  });

  suite.test('Required any attributes', function () {
    let schema;

    schema = Schema({ valid_elements: 'a![id|style|href]' });
    LegacyUnit.deepEqual(
      schema.getElementRule('a'),
      { attributes: { href: {}, id: {}, style: {} }, attributesOrder: ['id', 'style', 'href'], removeEmptyAttrs: true }
    );
  });

  suite.test('Required attributes', function () {
    let schema;

    schema = Schema({ valid_elements: 'a[!href|!name]' });
    LegacyUnit.deepEqual(
      schema.getElementRule('a'),
      {
        attributes: { href: { required: true }, name: { required: true } },
        attributesOrder: ['href', 'name'], attributesRequired: ['href', 'name']
      }
    );
  });

  suite.test('Default attribute values', function () {
    let schema;

    schema = Schema({ valid_elements: 'img[border=0]' });
    LegacyUnit.deepEqual(
      schema.getElementRule('img'),
      {
        attributes: { border: { defaultValue: '0' } },
        attributesOrder: ['border'],
        attributesDefault: [{ name: 'border', value: '0' }]
      }
    );
  });

  suite.test('Forced attribute values', function () {
    let schema;

    schema = Schema({ valid_elements: 'img[border:0]' });
    LegacyUnit.deepEqual(
      schema.getElementRule('img'),
      {
        attributes: { border: { forcedValue: '0' } },
        attributesOrder: ['border'],
        attributesForced: [{ name: 'border', value: '0' }]
      }
    );
  });

  suite.test('Required attribute values', function () {
    let schema;

    schema = Schema({ valid_elements: 'span[dir<ltr?rtl]' });
    LegacyUnit.deepEqual(
      schema.getElementRule('span'),
      {
        attributes: { dir: { validValues: { rtl: {}, ltr: {} } } },
        attributesOrder: ['dir']
      }
    );
  });

  suite.test('Required parents', function () {
    let schema;

    schema = Schema();
    LegacyUnit.deepEqual(schema.getElementRule('tr').parentsRequired, ['tbody', 'thead', 'tfoot']);
    LegacyUnit.deepEqual(schema.getElementRule('li').parentsRequired, ['ul', 'ol']);
    LegacyUnit.deepEqual(schema.getElementRule('div').parentsRequired, undefined);
  });

  suite.test('Remove empty elements', function () {
    let schema;

    schema = Schema({ valid_elements: '-span' });
    LegacyUnit.deepEqual(schema.getElementRule('span'), { attributes: {}, attributesOrder: [], removeEmpty: true });

    schema = Schema({ valid_elements: '#span' });
    LegacyUnit.deepEqual(schema.getElementRule('span'), { attributes: {}, attributesOrder: [], paddEmpty: true });
  });

  suite.test('addValidElements', function () {
    let schema;

    schema = Schema({ valid_elements: '@[id|style],img[src|-style]' });
    schema.addValidElements('b[class]');
    LegacyUnit.deepEqual(
      schema.getElementRule('b'),
      {
        attributes: { id: {}, style: {}, class: {} },
        attributesOrder: ['id', 'style', 'class']
      }
    );
  });

  suite.test('addValidElements when there\'s a colon in an attribute name', function () {
    let schema;

    schema = Schema({ valid_elements: '@[xml\\:space]' });
    schema.addValidElements('pre[xml\\:lang]');
    LegacyUnit.deepEqual(
      schema.getElementRule('pre'),
      {
        attributes: { 'xml:space': {}, 'xml:lang': {} },
        attributesOrder: ['xml:space', 'xml:lang']
      }
    );
  });

  suite.test('setValidElements', function () {
    let schema;

    schema = Schema({ valid_elements: '@[id|style],img[src|-style]' });
    schema.setValidElements('b[class]');
    LegacyUnit.equal(schema.getElementRule('img'), undefined);
    LegacyUnit.deepEqual(schema.getElementRule('b'), { attributes: { class: {} }, attributesOrder: ['class'] });

    schema = Schema({ valid_elements: 'img[src]' });
    schema.setValidElements('@[id|style],img[src]');
    LegacyUnit.deepEqual(
      schema.getElementRule('img'),
      {
        attributes: { id: {}, style: {}, src: {} },
        attributesOrder: ['id', 'style', 'src']
      });
  });

  suite.test('getBoolAttrs', function () {
    let schema;

    schema = Schema();
    LegacyUnit.deepEqual(schema.getBoolAttrs(), {
      CONTROLS: {}, LOOP: {}, AUTOPLAY: {}, SELECTED: {}, READONLY: {}, NOWRAP: {},
      NOSHADE: {}, NORESIZE: {}, NOHREF: {}, MULTIPLE: {}, ISMAP: {}, DISABLED: {}, DEFER: {},
      DECLARE: {}, COMPACT: {}, CHECKED: {},
      controls: {}, loop: {}, autoplay: {}, selected: {}, readonly: {}, nowrap: {},
      noshade: {}, noresize: {}, nohref: {}, multiple: {}, ismap: {}, disabled: {}, defer: {},
      declare: {}, compact: {}, checked: {}
    });
  });

  suite.test('getBlockElements', function () {
    let schema;

    schema = Schema();
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
    let schema;

    schema = Schema();
    LegacyUnit.deepEqual(schema.getShortEndedElements(), {
      EMBED: {}, PARAM: {}, META: {}, LINK: {}, ISINDEX: {},
      INPUT: {}, IMG: {}, HR: {}, FRAME: {}, COL: {}, BR: {},
      BASEFONT: {}, BASE: {}, AREA: {}, SOURCE : {}, WBR : {}, TRACK : {},
      embed: {}, param: {}, meta: {}, link: {}, isindex: {},
      input: {}, img: {}, hr: {}, frame: {}, col: {}, br: {},
      basefont: {}, base: {}, area: {}, source : {}, wbr : {}, track : {}
    });
  });

  suite.test('getNonEmptyElements', function () {
    let schema;

    schema = Schema();
    LegacyUnit.deepEqual(schema.getNonEmptyElements(), {
      EMBED: {}, PARAM: {}, META: {}, LINK: {}, ISINDEX: {},
      INPUT: {}, IMG: {}, HR: {}, FRAME: {}, COL: {}, BR: {},
      BASEFONT: {}, BASE: {}, AREA: {}, SOURCE : {},
      TD: {}, TH: {}, IFRAME: {}, VIDEO: {}, AUDIO: {}, OBJECT: {},
      WBR: {}, TRACK : {}, SCRIPT : {}, PRE: {}, CODE: {},
      embed: {}, param: {}, meta: {}, link: {}, isindex: {},
      input: {}, img: {}, hr: {}, frame: {}, col: {}, br: {},
      basefont: {}, base: {}, area: {}, source : {},
      td: {}, th: {}, iframe: {}, video: {}, audio: {}, object: {},
      wbr : {}, track : {}, script : {}, pre: {}, code: {}
    });
  });

  suite.test('getWhiteSpaceElements', function () {
    let schema;

    schema = Schema();
    LegacyUnit.deepEqual(schema.getWhiteSpaceElements(), {
      IFRAME: {}, NOSCRIPT: {}, OBJECT: {}, PRE: {}, CODE: {},
      SCRIPT: {}, STYLE: {}, TEXTAREA: {}, VIDEO: {}, AUDIO: {},
      iframe: {}, noscript: {}, object: {}, pre: {}, code: {},
      script: {}, style: {}, textarea: {}, video: {}, audio: {}
    });
  });

  suite.test('getTextBlockElements', function () {
    let schema;

    schema = Schema();
    LegacyUnit.deepEqual(schema.getTextBlockElements(), {
      ADDRESS: {}, ARTICLE: {}, ASIDE: {}, BLOCKQUOTE: {}, CENTER: {}, DIR: {}, DIV: {},
      FIELDSET: {}, FIGURE: {}, FOOTER: {}, FORM: {},
      H1: {}, H2: {}, H3: {}, H4: {}, H5: {}, H6: {}, HEADER: {}, HGROUP: {}, NAV: {},
      P: {}, PRE: {}, SECTION: {},
      address: {}, article: {}, aside: {}, blockquote: {}, center: {}, dir: {}, div: {},
      fieldset: {}, figure: {}, footer: {}, form: {},
      h1: {}, h2: {}, h3: {}, h4: {}, h5: {}, h6: {}, header: {}, hgroup: {}, nav: {},
      p: {}, pre: {}, section: {}
    });
  });

  suite.test('getTextInlineElements', function () {
    let schema;

    schema = Schema();
    LegacyUnit.deepEqual(schema.getTextInlineElements(), {
      B: {}, CITE: {}, CODE: {}, DFN: {}, EM: {}, FONT: {}, I: {}, MARK: {}, Q: {},
      SAMP: {}, SPAN: {}, STRIKE: {}, STRONG: {}, SUB: {}, SUP: {}, U: {}, VAR: {},
      b: {}, cite: {}, code: {}, dfn: {}, em: {}, font: {}, i: {}, mark: {}, q: {},
      samp: {}, span: {}, strike: {}, strong: {}, sub: {}, sup: {}, u: {}, var: {}
    });
  });

  suite.test('isValidChild', function () {
    let schema;

    schema = Schema();
    ok(schema.isValidChild('body', 'p'));
    ok(schema.isValidChild('ul', 'LI'));
    ok(schema.isValidChild('p', 'img'));
    ok(schema.isValidChild('STRONG', 'span'));
    ok(!schema.isValidChild('body', 'body'));
    ok(!schema.isValidChild('p', 'body'));
  });

  suite.test('getElementRule', function () {
    let schema;

    schema = Schema();
    ok(!!schema.getElementRule('b'));
    ok(!schema.getElementRule('bx'));
    ok(!schema.getElementRule(null));
  });

  suite.test('addCustomElements', function () {
    let schema;

    schema = Schema({ valid_elements: 'inline,block' });
    schema.addCustomElements('~inline,block');
    ok(!!schema.getElementRule('inline'));
    ok(!!schema.getElementRule('block'));
    ok(schema.isValidChild('body', 'block'));
    ok(schema.isValidChild('block', 'inline'));
    ok(schema.isValidChild('p', 'inline'));
  });

  suite.test('addValidChildren', function () {
    let schema;

    schema = Schema();
    ok(schema.isValidChild('body', 'p'));
    ok(!schema.isValidChild('body', 'body'));
    ok(!schema.isValidChild('body', 'html'));
    schema.addValidChildren('+body[body|html]');
    ok(schema.isValidChild('body', 'body'));
    ok(schema.isValidChild('body', 'html'));

    schema = Schema();
    ok(schema.isValidChild('body', 'p'));
    schema.addValidChildren('-body[p]');
    ok(!schema.isValidChild('body', 'p'));
  });

  suite.test('addCustomElements/getCustomElements', function () {
    let schema;

    schema = Schema();
    schema.addCustomElements('~inline,block');
    ok(!!schema.getBlockElements().block);
    ok(!schema.getBlockElements().inline);
    ok(!!schema.getCustomElements().inline);
    ok(!!schema.getCustomElements().block);
  });

  suite.test('whitespaceElements', function () {
    let schema;

    schema = Schema({ whitespace_elements : 'pre,p' });
    ok(!!schema.getWhiteSpaceElements().pre);
    ok(!schema.getWhiteSpaceElements().span);

    schema = Schema({ whitespace_elements : 'code' });
    ok(!!schema.getWhiteSpaceElements().code);
  });

  suite.test('selfClosingElements', function () {
    let schema;

    schema = Schema({ self_closing_elements : 'pre,p' });
    ok(!!schema.getSelfClosingElements().pre);
    ok(!!schema.getSelfClosingElements().p);
    ok(!schema.getSelfClosingElements().li);
  });

  suite.test('shortEndedElements', function () {
    let schema;

    schema = Schema({ short_ended_elements : 'pre,p' });
    ok(!!schema.getShortEndedElements().pre);
    ok(!!schema.getShortEndedElements().p);
    ok(!schema.getShortEndedElements().img);
  });

  suite.test('booleanAttributes', function () {
    let schema;

    schema = Schema({ boolean_attributes : 'href,alt' });
    ok(!!schema.getBoolAttrs().href);
    ok(!!schema.getBoolAttrs().alt);
    ok(!schema.getBoolAttrs().checked);
  });

  suite.test('nonEmptyElements', function () {
    let schema;

    schema = Schema({ non_empty_elements : 'pre,p' });
    ok(!!schema.getNonEmptyElements().pre);
    ok(!!schema.getNonEmptyElements().p);
    ok(!schema.getNonEmptyElements().img);
  });

  suite.test('blockElements', function () {
    let schema;

    schema = Schema({ block_elements : 'pre,p' });
    ok(!!schema.getBlockElements().pre);
    ok(!!schema.getBlockElements().p);
    ok(!schema.getBlockElements().h1);
  });

  suite.test('isValid', function () {
    let schema;

    schema = Schema({ valid_elements : 'a[href],i[*]' });

    ok(schema.isValid('a'));
    ok(schema.isValid('a', 'href'));
    ok(!schema.isValid('b'));
    ok(!schema.isValid('b', 'href'));
    ok(!schema.isValid('a', 'id'));
    ok(schema.isValid('i'));
    ok(schema.isValid('i', 'id'));
  });

  suite.test('validStyles', function () {
    let schema;

    schema = Schema({ valid_styles: 'color,font-size' });
    LegacyUnit.deepEqual(schema.getValidStyles(), {
      '*': [
        'color',
        'font-size'
      ]
    });

    schema = Schema({ valid_styles: 'color font-size' });
    LegacyUnit.deepEqual(schema.getValidStyles(), {
      '*': [
        'color',
        'font-size'
      ]
    });

    schema = Schema({
      valid_styles: {
        '*': 'color font-size',
        'a': 'background font-family'
      }
    });
    LegacyUnit.deepEqual(schema.getValidStyles(), {
      '*': [
        'color',
        'font-size'
      ],

      'a': [
        'background',
        'font-family'
      ],

      'A': [
        'background',
        'font-family'
      ]
    });
  });

  suite.test('invalidStyles', function () {
    let schema;

    schema = Schema({ invalid_styles: 'color,font-size' });
    LegacyUnit.deepEqual(schema.getInvalidStyles(), {
      '*': {
        'color': {},
        'font-size': {}
      }
    });

    schema = Schema({ invalid_styles: 'color font-size' });
    LegacyUnit.deepEqual(schema.getInvalidStyles(), {
      '*': {
        'color': {},
        'font-size': {}
      }
    });

    schema = Schema({
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
    let schema;

    schema = Schema({ valid_classes: 'classA,classB' });
    LegacyUnit.deepEqual(schema.getValidClasses(), {
      '*': {
        classA: {},
        classB: {}
      }
    });

    schema = Schema({ valid_classes: 'classA classB' });
    LegacyUnit.deepEqual(schema.getValidClasses(), {
      '*': {
        classA: {},
        classB: {}
      }
    });

    schema = Schema({
      valid_classes: {
        '*': 'classA classB',
        'a': 'classC classD'
      }
    });
    LegacyUnit.deepEqual(schema.getValidClasses(), {
      '*': {
        classA: {},
        classB: {}
      },

      'a': {
        classC: {},
        classD: {}
      },

      'A': {
        classC: {},
        classD: {}
      }
    });
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
  }, failure);
});
