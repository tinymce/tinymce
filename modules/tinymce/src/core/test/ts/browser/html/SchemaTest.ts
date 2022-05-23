import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Obj, Type } from '@ephox/katamari';
import { assert } from 'chai';

import Schema from 'tinymce/core/api/html/Schema';

describe('browser.tinymce.core.html.SchemaTest', () => {
  it('Valid elements global rule', () => {
    const schema = Schema({ valid_elements: '@[id|style],img[src|-style]' });
    assert.deepEqual(schema.getElementRule('img'), { attributes: { id: {}, src: {}}, attributesOrder: [ 'id', 'src' ] });
  });

  it('Wildcard element rule', () => {
    let schema = Schema({ valid_elements: '*[id|class]' });
    assert.deepEqual(schema.getElementRule('b').attributes, { id: {}, class: {}});
    assert.deepEqual(schema.getElementRule('b').attributesOrder, [ 'id', 'class' ]);

    schema = Schema({ valid_elements: 'b*[id|class]' });
    assert.deepEqual(schema.getElementRule('b').attributes, { id: {}, class: {}});
    assert.deepEqual(schema.getElementRule('b').attributesOrder, [ 'id', 'class' ]);
    assert.deepEqual(schema.getElementRule('body').attributes, { id: {}, class: {}});
    assert.deepEqual(schema.getElementRule('body').attributesOrder, [ 'id', 'class' ]);
    assert.isUndefined(schema.getElementRule('img'));

    schema = Schema({ valid_elements: 'b?[id|class]' });
    assert.deepEqual(schema.getElementRule('b').attributes, { id: {}, class: {}});
    assert.deepEqual(schema.getElementRule('b').attributesOrder, [ 'id', 'class' ]);
    assert.deepEqual(schema.getElementRule('bx').attributes, { id: {}, class: {}});
    assert.deepEqual(schema.getElementRule('bx').attributesOrder, [ 'id', 'class' ]);
    assert.isUndefined(schema.getElementRule('body'));

    schema = Schema({ valid_elements: 'b+[id|class]' });
    assert.deepEqual(schema.getElementRule('body').attributes, { id: {}, class: {}});
    assert.deepEqual(schema.getElementRule('body').attributesOrder, [ 'id', 'class' ]);
    assert.deepEqual(schema.getElementRule('bx').attributes, { id: {}, class: {}});
    assert.deepEqual(schema.getElementRule('bx').attributesOrder, [ 'id', 'class' ]);
    assert.isUndefined(schema.getElementRule('b'));
  });

  it('Wildcard attribute rule', () => {
    let schema = Schema({ valid_elements: 'b[id|class|*]' });
    assert.deepEqual(schema.getElementRule('b').attributes, { id: {}, class: {}});
    assert.deepEqual(schema.getElementRule('b').attributesOrder, [ 'id', 'class' ]);
    assert.isTrue(schema.getElementRule('b').attributePatterns[0].pattern.test('x'));

    schema = Schema({ valid_elements: 'b[id|class|x?]' });
    assert.deepEqual(schema.getElementRule('b').attributes, { id: {}, class: {}});
    assert.deepEqual(schema.getElementRule('b').attributesOrder, [ 'id', 'class' ]);
    assert.isTrue(schema.getElementRule('b').attributePatterns[0].pattern.test('xy'));
    assert.isFalse(schema.getElementRule('b').attributePatterns[0].pattern.test('xba'));
    assert.isFalse(schema.getElementRule('b').attributePatterns[0].pattern.test('a'));

    schema = Schema({ valid_elements: 'b[id|class|x+]' });
    assert.deepEqual(schema.getElementRule('b').attributes, { id: {}, class: {}});
    assert.deepEqual(schema.getElementRule('b').attributesOrder, [ 'id', 'class' ]);
    assert.isFalse(schema.getElementRule('b').attributePatterns[0].pattern.test('x'));
    assert.isTrue(schema.getElementRule('b').attributePatterns[0].pattern.test('xb'));
    assert.isTrue(schema.getElementRule('b').attributePatterns[0].pattern.test('xba'));
  });

  it('Valid attributes and attribute order', () => {
    const schema = Schema({ valid_elements: 'div,a[href|title],b[title]' });
    assert.deepEqual(schema.getElementRule('div'), { attributes: {}, attributesOrder: [] });
    assert.deepEqual(schema.getElementRule('a'), { attributes: { href: {}, title: {}}, attributesOrder: [ 'href', 'title' ] });
    assert.deepEqual(schema.getElementRule('b'), { attributes: { title: {}}, attributesOrder: [ 'title' ] });
  });

  it('Required any attributes', () => {
    const schema = Schema({ valid_elements: 'a![id|style|href]' });
    assert.deepEqual(
      schema.getElementRule('a'),
      { attributes: { href: {}, id: {}, style: {}}, attributesOrder: [ 'id', 'style', 'href' ], removeEmptyAttrs: true }
    );
  });

  it('Required attributes', () => {
    const schema = Schema({ valid_elements: 'a[!href|!name]' });
    assert.deepEqual(
      schema.getElementRule('a'),
      {
        attributes: { href: { required: true }, name: { required: true }},
        attributesOrder: [ 'href', 'name' ], attributesRequired: [ 'href', 'name' ]
      }
    );
  });

  it('Default attribute values', () => {
    const schema = Schema({ valid_elements: 'img[border=0]' });
    assert.deepEqual(
      schema.getElementRule('img'),
      {
        attributes: { border: { defaultValue: '0' }},
        attributesOrder: [ 'border' ],
        attributesDefault: [{ name: 'border', value: '0' }]
      }
    );
  });

  it('Forced attribute values', () => {
    const schema = Schema({ valid_elements: 'img[border:0]' });
    assert.deepEqual(
      schema.getElementRule('img'),
      {
        attributes: { border: { forcedValue: '0' }},
        attributesOrder: [ 'border' ],
        attributesForced: [{ name: 'border', value: '0' }]
      }
    );
  });

  it('Required attribute values', () => {
    const schema = Schema({ valid_elements: 'span[dir<ltr?rtl]' });
    assert.deepEqual(
      schema.getElementRule('span'),
      {
        attributes: { dir: { validValues: { rtl: {}, ltr: {}}}},
        attributesOrder: [ 'dir' ]
      }
    );
  });

  it('Required parents', () => {
    const schema = Schema();
    assert.deepEqual(schema.getElementRule('tr').parentsRequired, [ 'tbody', 'thead', 'tfoot' ]);
    assert.deepEqual(schema.getElementRule('li').parentsRequired, [ 'ul', 'ol' ]);
    assert.isUndefined(schema.getElementRule('div').parentsRequired);
  });

  it('Remove empty elements', () => {
    let schema = Schema({ valid_elements: '-span' });
    assert.deepEqual(schema.getElementRule('span'), { attributes: {}, attributesOrder: [], removeEmpty: true });

    schema = Schema({ valid_elements: '#span' });
    assert.deepEqual(schema.getElementRule('span'), { attributes: {}, attributesOrder: [], paddEmpty: true });

    // Empty table rows should not be removed
    schema = Schema();
    assert.isUndefined(schema.getElementRule('tr').removeEmpty);
  });

  it('addValidElements', () => {
    const schema = Schema({ valid_elements: '@[id|style],img[src|-style]' });
    schema.addValidElements('b[class]');
    assert.deepEqual(
      schema.getElementRule('b'),
      {
        attributes: { id: {}, style: {}, class: {}},
        attributesOrder: [ 'id', 'style', 'class' ]
      }
    );
    schema.addValidElements('custom-element[custom-attribute]');
    assert.deepEqual(
      schema.getElementRule('custom-element'),
      {
        attributes: { 'id': {}, 'style': {}, 'custom-attribute': {}},
        attributesOrder: [ 'id', 'style', 'custom-attribute' ]
      }
    );
  });

  it(`addValidElements when there's a colon in an attribute name`, () => {
    const schema = Schema({ valid_elements: '@[xml\\:space]' });
    schema.addValidElements('pre[xml\\:lang]');
    assert.deepEqual(
      schema.getElementRule('pre'),
      {
        attributes: { 'xml:space': {}, 'xml:lang': {}},
        attributesOrder: [ 'xml:space', 'xml:lang' ]
      }
    );
  });

  it('setValidElements', () => {
    let schema = Schema({ valid_elements: '@[id|style],img[src|-style]' });
    schema.setValidElements('b[class]');
    assert.isUndefined(schema.getElementRule('img'));
    assert.deepEqual(schema.getElementRule('b'), { attributes: { class: {}}, attributesOrder: [ 'class' ] });

    schema = Schema({ valid_elements: 'img[src]' });
    schema.setValidElements('@[id|style],img[src]');
    assert.deepEqual(
      schema.getElementRule('img'),
      {
        attributes: { id: {}, style: {}, src: {}},
        attributesOrder: [ 'id', 'style', 'src' ]
      });
  });

  it('getBoolAttrs', () => {
    const schema = Schema();
    assert.deepEqual(schema.getBoolAttrs(), {
      CONTROLS: {}, LOOP: {}, AUTOPLAY: {}, SELECTED: {}, READONLY: {}, NOWRAP: {},
      NOSHADE: {}, NORESIZE: {}, NOHREF: {}, MULTIPLE: {}, ISMAP: {}, DISABLED: {}, DEFER: {},
      DECLARE: {}, COMPACT: {}, CHECKED: {},
      controls: {}, loop: {}, autoplay: {}, selected: {}, readonly: {}, nowrap: {},
      noshade: {}, noresize: {}, nohref: {}, multiple: {}, ismap: {}, disabled: {}, defer: {},
      declare: {}, compact: {}, checked: {}
    });
  });

  it('getBlockElements', () => {
    const schema = Schema();
    assert.deepEqual(schema.getBlockElements(), {
      SUMMARY: {}, MAIN: {}, DETAILS: {}, ASIDE: {}, HGROUP: {}, SECTION: {}, ARTICLE: {}, FOOTER: {}, HEADER: {},
      ISINDEX: {}, MENU: {}, NOSCRIPT: {}, FIELDSET: {}, FIGCAPTION: {}, DIR: {}, DD: {}, DT: {},
      DL: {}, CENTER: {}, BLOCKQUOTE: {}, CAPTION: {}, UL: {}, OL: {}, LI: {},
      TD: {}, TR: {}, TH: {}, TFOOT: {}, THEAD: {}, TBODY: {}, TABLE: {}, FORM: {},
      PRE: {}, ADDRESS: {}, DIV: {}, P: {}, HR: {}, H6: {}, H5: {}, H4: {}, H3: {},
      H2: {}, H1: {}, NAV: {}, FIGURE: {}, DATALIST: {}, OPTGROUP: {}, OPTION: {}, SELECT: {},
      details: {}, summary: {}, main: {}, aside: {}, hgroup: {}, section: {}, article: {}, footer: {}, header: {},
      isindex: {}, menu: {}, noscript: {}, fieldset: {}, dir: {}, dd: {}, dt: {}, dl: {}, center: {},
      blockquote: {}, caption: {}, ul: {}, ol: {}, li: {}, td: {}, tr: {}, th: {}, tfoot: {}, thead: {},
      tbody: {}, table: {}, form: {}, pre: {}, address: {}, div: {}, p: {}, hr: {}, h6: {},
      h5: {}, h4: {}, h3: {}, h2: {}, h1: {}, nav: {}, figure: {}, figcaption: {}, datalist: {}, optgroup: {},
      option: {}, select: {}
    });
  });

  it('getShortEndedElements', () => {
    const schema = Schema();
    assert.deepEqual(schema.getShortEndedElements(), {
      EMBED: {}, PARAM: {}, META: {}, LINK: {}, ISINDEX: {},
      INPUT: {}, IMG: {}, HR: {}, FRAME: {}, COL: {}, BR: {},
      BASEFONT: {}, BASE: {}, AREA: {}, SOURCE: {}, WBR: {}, TRACK: {},
      embed: {}, param: {}, meta: {}, link: {}, isindex: {},
      input: {}, img: {}, hr: {}, frame: {}, col: {}, br: {},
      basefont: {}, base: {}, area: {}, source: {}, wbr: {}, track: {}
    });
  });

  it('getNonEmptyElements', () => {
    const schema = Schema();
    assert.deepEqual(schema.getNonEmptyElements(), {
      EMBED: {}, PARAM: {}, META: {}, LINK: {}, ISINDEX: {},
      INPUT: {}, IMG: {}, HR: {}, FRAME: {}, COL: {}, BR: {},
      BASEFONT: {}, BASE: {}, AREA: {}, SOURCE: {},
      TD: {}, TH: {}, IFRAME: {}, VIDEO: {}, AUDIO: {}, OBJECT: {},
      WBR: {}, TRACK: {}, SCRIPT: {}, PRE: {}, CODE: {},
      embed: {}, param: {}, meta: {}, link: {}, isindex: {},
      input: {}, img: {}, hr: {}, frame: {}, col: {}, br: {},
      basefont: {}, base: {}, area: {}, source: {},
      td: {}, th: {}, iframe: {}, video: {}, audio: {}, object: {},
      wbr: {}, track: {}, script: {}, pre: {}, code: {}
    });
  });

  it('getWhiteSpaceElements', () => {
    const schema = Schema();
    assert.deepEqual(schema.getWhiteSpaceElements(), {
      IFRAME: {}, NOSCRIPT: {}, OBJECT: {}, PRE: {}, CODE: {},
      SCRIPT: {}, STYLE: {}, TEXTAREA: {}, VIDEO: {}, AUDIO: {},
      iframe: {}, noscript: {}, object: {}, pre: {}, code: {},
      script: {}, style: {}, textarea: {}, video: {}, audio: {}
    });
  });

  it('getTextBlockElements', () => {
    const schema = Schema();
    assert.deepEqual(schema.getTextBlockElements(), {
      ADDRESS: {}, MAIN: {}, ARTICLE: {}, ASIDE: {}, BLOCKQUOTE: {}, CENTER: {}, DIR: {}, DIV: {},
      FIELDSET: {}, FIGURE: {}, FOOTER: {}, FORM: {},
      H1: {}, H2: {}, H3: {}, H4: {}, H5: {}, H6: {}, HEADER: {}, HGROUP: {}, NAV: {},
      P: {}, PRE: {}, SECTION: {},
      address: {}, main: {}, article: {}, aside: {}, blockquote: {}, center: {}, dir: {}, div: {},
      fieldset: {}, figure: {}, footer: {}, form: {},
      h1: {}, h2: {}, h3: {}, h4: {}, h5: {}, h6: {}, header: {}, hgroup: {}, nav: {},
      p: {}, pre: {}, section: {}
    });
  });

  it('getTextInlineElements', () => {
    const schema = Schema();
    assert.deepEqual(schema.getTextInlineElements(), {
      B: {}, CITE: {}, CODE: {}, DFN: {}, EM: {}, FONT: {}, I: {}, MARK: {}, Q: {},
      SAMP: {}, SPAN: {}, S: {}, STRIKE: {}, STRONG: {}, SUB: {}, SUP: {}, U: {}, VAR: {},
      b: {}, cite: {}, code: {}, dfn: {}, em: {}, font: {}, i: {}, mark: {}, q: {},
      samp: {}, span: {}, s: {}, strike: {}, strong: {}, sub: {}, sup: {}, u: {}, var: {}
    });
  });

  it('getSpecialElements', () => {
    const schema = Schema();
    const keys = Arr.sort(Obj.keys(schema.getSpecialElements()));
    assert.sameMembers(keys, [
      'script',
      'noscript',
      'iframe',
      'noframes',
      'noembed',
      'title',
      'style',
      'textarea',
      'xmp'
    ], 'special elements');
  });

  it('isValidChild', () => {
    const schema = Schema();
    assert.isTrue(schema.isValidChild('body', 'p'));
    assert.isTrue(schema.isValidChild('ul', 'LI'));
    assert.isTrue(schema.isValidChild('p', 'img'));
    assert.isTrue(schema.isValidChild('STRONG', 'span'));
    assert.isFalse(schema.isValidChild('body', 'body'));
    assert.isFalse(schema.isValidChild('p', 'body'));
  });

  it('getElementRule', () => {
    const schema = Schema();
    assert.isObject(schema.getElementRule('b'));
    assert.isUndefined(schema.getElementRule('bx'));
    assert.isUndefined(schema.getElementRule(null));
  });

  it('addCustomElements', () => {
    const schema = Schema({ valid_elements: 'inline,block' });
    schema.addCustomElements('~inline,block');
    assert.isObject(schema.getElementRule('inline'));
    assert.isObject(schema.getElementRule('block'));
    assert.isTrue(schema.isValidChild('body', 'block'));
    assert.isTrue(schema.isValidChild('block', 'inline'));
    assert.isTrue(schema.isValidChild('p', 'inline'));
  });

  it('addValidChildren', () => {
    let schema = Schema();
    assert.isTrue(schema.isValidChild('body', 'p'));
    assert.isFalse(schema.isValidChild('body', 'body'));
    assert.isFalse(schema.isValidChild('body', 'html'));
    schema.addValidChildren('+body[body|html]');
    assert.isTrue(schema.isValidChild('body', 'body'));
    assert.isTrue(schema.isValidChild('body', 'html'));

    schema = Schema();
    assert.isTrue(schema.isValidChild('body', 'p'));
    schema.addValidChildren('-body[p]');
    assert.isFalse(schema.isValidChild('body', 'p'));
  });

  it('addCustomElements/getCustomElements', () => {
    const schema = Schema();
    schema.addCustomElements('~inline,block');
    assert.isObject(schema.getBlockElements().block);
    assert.isUndefined(schema.getBlockElements().inline);
    assert.isString(schema.getCustomElements().inline);
    assert.isString(schema.getCustomElements().block);
  });

  it('whitespaceElements', () => {
    let schema = Schema({ whitespace_elements: 'pre,p' });
    assert.isObject(schema.getWhiteSpaceElements().pre);
    assert.isUndefined(schema.getWhiteSpaceElements().span);

    schema = Schema({ whitespace_elements: 'code' });
    assert.isObject(schema.getWhiteSpaceElements().code);
  });

  it('selfClosingElements', () => {
    const schema = Schema({ self_closing_elements: 'pre,p' });
    assert.isObject(schema.getSelfClosingElements().pre);
    assert.isObject(schema.getSelfClosingElements().p);
    assert.isUndefined(schema.getSelfClosingElements().li);
  });

  it('shortEndedElements', () => {
    const schema = Schema({ short_ended_elements: 'pre,p' });
    assert.isObject(schema.getShortEndedElements().pre);
    assert.isObject(schema.getShortEndedElements().p);
    assert.isUndefined(schema.getShortEndedElements().img);
  });

  it('booleanAttributes', () => {
    const schema = Schema({ boolean_attributes: 'href,alt' });
    assert.isObject(schema.getBoolAttrs().href);
    assert.isObject(schema.getBoolAttrs().alt);
    assert.isUndefined(schema.getBoolAttrs().checked);
  });

  it('nonEmptyElements', () => {
    const schema = Schema({ non_empty_elements: 'pre,p' });
    assert.isObject(schema.getNonEmptyElements().pre);
    assert.isObject(schema.getNonEmptyElements().p);
    assert.isUndefined(schema.getNonEmptyElements().img);
  });

  it('blockElements', () => {
    const schema = Schema({ block_elements: 'pre,p' });
    assert.isObject(schema.getBlockElements().pre);
    assert.isObject(schema.getBlockElements().p);
    assert.isUndefined(schema.getBlockElements().h1);
  });

  it('isValid', () => {
    const schema = Schema({ valid_elements: 'a[href],i[*]' });

    assert.isTrue(schema.isValid('a'));
    assert.isTrue(schema.isValid('a', 'href'));
    assert.isFalse(schema.isValid('b'));
    assert.isFalse(schema.isValid('b', 'href'));
    assert.isFalse(schema.isValid('a', 'id'));
    assert.isTrue(schema.isValid('i'));
    assert.isTrue(schema.isValid('i', 'id'));
  });

  it('validStyles', () => {
    let schema = Schema({ valid_styles: 'color,font-size' });
    assert.deepEqual(schema.getValidStyles(), {
      '*': [
        'color',
        'font-size'
      ]
    });

    schema = Schema({ valid_styles: 'color font-size' });
    assert.deepEqual(schema.getValidStyles(), {
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
    assert.deepEqual(schema.getValidStyles(), {
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

  it('invalidStyles', () => {
    let schema = Schema({ invalid_styles: 'color,font-size' });
    assert.deepEqual(schema.getInvalidStyles(), {
      '*': {
        'color': {},
        'font-size': {}
      }
    });

    schema = Schema({ invalid_styles: 'color font-size' });
    assert.deepEqual(schema.getInvalidStyles(), {
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
    assert.deepEqual(schema.getInvalidStyles(), {
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

  it('validClasses', () => {
    let schema = Schema({ valid_classes: 'classA,classB' });
    assert.deepEqual(schema.getValidClasses(), {
      '*': {
        classA: {},
        classB: {}
      }
    });

    schema = Schema({ valid_classes: 'classA classB' });
    assert.deepEqual(schema.getValidClasses(), {
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
    assert.deepEqual(schema.getValidClasses(), {
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

  context('paddInEmptyBlock', () => {
    it('TINY-8639: default behaviour', () => {
      const schema = Schema({});
      const rules = Obj.mapToArray(schema.getTextInlineElements(), (_value, name) => schema.getElementRule(name.toLowerCase()));
      assert.isTrue(rules.length > 0 && Arr.forall(rules, (rule) => Type.isUndefined(rule.paddInEmptyBlock)));
    });

    it('TINY-8639: padd_empty_block_inline_children: false', () => {
      const schema = Schema({ padd_empty_block_inline_children: false });
      const rules = Obj.mapToArray(schema.getTextInlineElements(), (_value, name) => schema.getElementRule(name.toLowerCase()));
      assert.isTrue(rules.length > 0 && Arr.forall(rules, (rule) => Type.isUndefined(rule.paddInEmptyBlock)));
    });

    it('TINY-8639: padd_empty_block_inline_children: true', () => {
      const schema = Schema({ padd_empty_block_inline_children: true });
      const rules = Obj.mapToArray(schema.getTextInlineElements(), (_value, name) => schema.getElementRule(name.toLowerCase()));
      assert.isTrue(rules.length > 0 && Arr.forall(rules, (rule) => rule.paddInEmptyBlock === true));
    });
  });
});
