import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Obj, Type } from '@ephox/katamari';
import { SugarElement, SugarNode } from '@ephox/sugar';
import { assert } from 'chai';

import Schema, { AttributePattern, SchemaElement } from 'tinymce/core/api/html/Schema';

describe('browser.tinymce.core.html.SchemaTest', () => {
  const getElementRule = (schema: Schema, name: string) =>
    schema.getElementRule(name) as SchemaElement;

  const getFirstAttributePattern = (schema: Schema, name: string) => {
    const rule = getElementRule(schema, name);
    return rule.attributePatterns?.[0] as AttributePattern;
  };

  it('Valid elements global rule', () => {
    const schema = Schema({ valid_elements: '@[id|style],img[src|-style]' });
    assert.deepEqual(getElementRule(schema, 'img'), { attributes: { id: {}, src: {}}, attributesOrder: [ 'id', 'src' ] });
  });

  it('Wildcard element rule', () => {
    let schema = Schema({ valid_elements: '*[id|class]' });
    assert.deepEqual(getElementRule(schema, 'b').attributes, { id: {}, class: {}});
    assert.deepEqual(getElementRule(schema, 'b').attributesOrder, [ 'id', 'class' ]);

    schema = Schema({ valid_elements: 'b*[id|class]' });
    assert.deepEqual(getElementRule(schema, 'b').attributes, { id: {}, class: {}});
    assert.deepEqual(getElementRule(schema, 'b').attributesOrder, [ 'id', 'class' ]);
    assert.deepEqual(getElementRule(schema, 'body').attributes, { id: {}, class: {}});
    assert.deepEqual(getElementRule(schema, 'body').attributesOrder, [ 'id', 'class' ]);
    assert.isUndefined(getElementRule(schema, 'img'));

    schema = Schema({ valid_elements: 'b?[id|class]' });
    assert.deepEqual(getElementRule(schema, 'b').attributes, { id: {}, class: {}});
    assert.deepEqual(getElementRule(schema, 'b').attributesOrder, [ 'id', 'class' ]);
    assert.deepEqual(getElementRule(schema, 'bx').attributes, { id: {}, class: {}});
    assert.deepEqual(getElementRule(schema, 'bx').attributesOrder, [ 'id', 'class' ]);
    assert.isUndefined(getElementRule(schema, 'body'));

    schema = Schema({ valid_elements: 'b+[id|class]' });
    assert.deepEqual(getElementRule(schema, 'body').attributes, { id: {}, class: {}});
    assert.deepEqual(getElementRule(schema, 'body').attributesOrder, [ 'id', 'class' ]);
    assert.deepEqual(getElementRule(schema, 'bx').attributes, { id: {}, class: {}});
    assert.deepEqual(getElementRule(schema, 'bx').attributesOrder, [ 'id', 'class' ]);
    assert.isUndefined(getElementRule(schema, 'b'));
  });

  it('Wildcard attribute rule', () => {
    let schema = Schema({ valid_elements: 'b[id|class|*]' });
    assert.deepEqual(getElementRule(schema, 'b').attributes, { id: {}, class: {}});
    assert.deepEqual(getElementRule(schema, 'b').attributesOrder, [ 'id', 'class' ]);
    assert.isTrue(getFirstAttributePattern(schema, 'b').pattern.test('x'));

    schema = Schema({ valid_elements: 'b[id|class|x?]' });
    assert.deepEqual(getElementRule(schema, 'b').attributes, { id: {}, class: {}});
    assert.deepEqual(getElementRule(schema, 'b').attributesOrder, [ 'id', 'class' ]);
    assert.isTrue(getFirstAttributePattern(schema, 'b').pattern.test('xy'));
    assert.isFalse(getFirstAttributePattern(schema, 'b').pattern.test('xba'));
    assert.isFalse(getFirstAttributePattern(schema, 'b').pattern.test('a'));

    schema = Schema({ valid_elements: 'b[id|class|x+]' });
    assert.deepEqual(getElementRule(schema, 'b').attributes, { id: {}, class: {}});
    assert.deepEqual(getElementRule(schema, 'b').attributesOrder, [ 'id', 'class' ]);
    assert.isFalse(getFirstAttributePattern(schema, 'b').pattern.test('x'));
    assert.isTrue(getFirstAttributePattern(schema, 'b').pattern.test('xb'));
    assert.isTrue(getFirstAttributePattern(schema, 'b').pattern.test('xba'));
  });

  it('Valid attributes and attribute order', () => {
    const schema = Schema({ valid_elements: 'div,a[href|title],b[title]' });
    assert.deepEqual(getElementRule(schema, 'div'), { attributes: {}, attributesOrder: [] });
    assert.deepEqual(getElementRule(schema, 'a'), { attributes: { href: {}, title: {}}, attributesOrder: [ 'href', 'title' ] });
    assert.deepEqual(getElementRule(schema, 'b'), { attributes: { title: {}}, attributesOrder: [ 'title' ] });
  });

  it('Required any attributes', () => {
    const schema = Schema({ valid_elements: 'a![id|style|href]' });
    assert.deepEqual(
      getElementRule(schema, 'a'),
      { attributes: { href: {}, id: {}, style: {}}, attributesOrder: [ 'id', 'style', 'href' ], removeEmptyAttrs: true }
    );
  });

  it('Required attributes', () => {
    const schema = Schema({ valid_elements: 'a[!href|!name]' });
    assert.deepEqual(
      getElementRule(schema, 'a'),
      {
        attributes: { href: { required: true }, name: { required: true }},
        attributesOrder: [ 'href', 'name' ], attributesRequired: [ 'href', 'name' ]
      }
    );
  });

  it('Default attribute values', () => {
    const schema = Schema({ valid_elements: 'img[border=0]' });
    assert.deepEqual(
      getElementRule(schema, 'img'),
      {
        attributes: { border: { defaultValue: '0' }},
        attributesOrder: [ 'border' ],
        attributesDefault: [{ name: 'border', value: '0' }]
      }
    );
  });

  it('Forced attribute values', () => {
    const schema = Schema({ valid_elements: 'img[border~0]' });
    schema.addValidElements('a[href~a|xlink:href~b]');
    assert.deepEqual(
      getElementRule(schema, 'img'),
      {
        attributes: { border: { forcedValue: '0' }},
        attributesOrder: [ 'border' ],
        attributesForced: [{ name: 'border', value: '0' }]
      }
    );
    assert.deepEqual(
      getElementRule(schema, 'a'),
      {
        attributes: { 'href': { forcedValue: 'a' }, 'xlink:href': { forcedValue: 'b' }},
        attributesOrder: [ 'href', 'xlink:href' ],
        attributesForced: [{ name: 'href', value: 'a' }, { name: 'xlink:href', value: 'b' }]
      }
    );
  });

  it('Required attribute values', () => {
    const schema = Schema({ valid_elements: 'span[dir<ltr?rtl]' });
    assert.deepEqual(
      getElementRule(schema, 'span'),
      {
        attributes: { dir: { validValues: { rtl: {}, ltr: {}}}},
        attributesOrder: [ 'dir' ]
      }
    );
  });

  it('Required parents', () => {
    const schema = Schema();
    assert.deepEqual(getElementRule(schema, 'tr').parentsRequired, [ 'tbody', 'thead', 'tfoot' ]);
    assert.deepEqual(getElementRule(schema, 'li').parentsRequired, [ 'ul', 'ol' ]);
    assert.isUndefined(getElementRule(schema, 'div').parentsRequired);
  });

  it('Remove empty elements', () => {
    let schema = Schema({ valid_elements: '-span' });
    assert.deepEqual(getElementRule(schema, 'span'), { attributes: {}, attributesOrder: [], removeEmpty: true });

    schema = Schema({ valid_elements: '#span' });
    assert.deepEqual(getElementRule(schema, 'span'), { attributes: {}, attributesOrder: [], paddEmpty: true });

    // Empty table rows should not be removed
    schema = Schema();
    assert.isUndefined(getElementRule(schema, 'tr').removeEmpty);
  });

  it('addValidElements', () => {
    const schema = Schema({ valid_elements: '@[id|style],img[src|-style]' });
    schema.addValidElements('b[class]');
    assert.deepEqual(
      getElementRule(schema, 'b'),
      {
        attributes: { id: {}, style: {}, class: {}},
        attributesOrder: [ 'id', 'style', 'class' ]
      }
    );
    schema.addValidElements('custom-element[custom-attribute]');
    assert.deepEqual(
      getElementRule(schema, 'custom-element'),
      {
        attributes: { 'id': {}, 'style': {}, 'custom-attribute': {}},
        attributesOrder: [ 'id', 'style', 'custom-attribute' ]
      }
    );
  });

  it(`addValidElements when there's a colon in an attribute name`, () => {
    // Test that both a literal and escaped colon are correctly handled
    const schema = Schema({ valid_elements: '@[xml\\:space]' });
    schema.addValidElements('pre[xml:lang]');
    assert.deepEqual(
      getElementRule(schema, 'pre'),
      {
        attributes: { 'xml:space': {}, 'xml:lang': {}},
        attributesOrder: [ 'xml:space', 'xml:lang' ]
      }
    );
  });

  it('setValidElements', () => {
    let schema = Schema({ valid_elements: '@[id|style],img[src|-style]' });
    schema.setValidElements('b[class]');
    assert.isUndefined(getElementRule(schema, 'img'));
    assert.deepEqual(getElementRule(schema, 'b'), { attributes: { class: {}}, attributesOrder: [ 'class' ] });

    schema = Schema({ valid_elements: 'img[src]' });
    schema.setValidElements('@[id|style],img[src]');
    assert.deepEqual(
      getElementRule(schema, 'img'),
      {
        attributes: { id: {}, style: {}, src: {}},
        attributesOrder: [ 'id', 'style', 'src' ]
      });
  });

  it('getBoolAttrs', () => {
    const schema = Schema();
    assert.deepEqual(schema.getBoolAttrs(), {
      ALLOWFULLSCREEN: {}, CONTROLS: {}, LOOP: {}, AUTOPLAY: {}, SELECTED: {}, READONLY: {}, NOWRAP: {},
      NOSHADE: {}, NORESIZE: {}, NOHREF: {}, MULTIPLE: {}, ISMAP: {}, DISABLED: {}, DEFER: {},
      DECLARE: {}, COMPACT: {}, CHECKED: {},
      allowfullscreen: {}, controls: {}, loop: {}, autoplay: {}, selected: {}, readonly: {}, nowrap: {},
      noshade: {}, noresize: {}, nohref: {}, multiple: {}, ismap: {}, disabled: {}, defer: {},
      declare: {}, compact: {}, checked: {}
    });
  });

  it('getBlockElements', () => {
    const schema = Schema();
    assert.deepEqual(schema.getBlockElements(), {
      LISTING: {}, MULTICOL: {}, BODY: {}, HTML: {}, SUMMARY: {}, MAIN: {},
      DETAILS: {}, ASIDE: {}, HGROUP: {}, SECTION: {}, ARTICLE: {}, FOOTER: {}, HEADER: {},
      ISINDEX: {}, MENU: {}, NOSCRIPT: {}, FIELDSET: {}, FIGCAPTION: {}, DIR: {}, DD: {}, DT: {},
      DL: {}, CENTER: {}, BLOCKQUOTE: {}, CAPTION: {}, UL: {}, OL: {}, LI: {},
      TD: {}, TR: {}, TH: {}, TFOOT: {}, THEAD: {}, TBODY: {}, TABLE: {}, FORM: {},
      PRE: {}, ADDRESS: {}, DIV: {}, P: {}, HR: {}, H6: {}, H5: {}, H4: {}, H3: {},
      H2: {}, H1: {}, NAV: {}, FIGURE: {}, DATALIST: {}, OPTGROUP: {}, OPTION: {}, SELECT: {},
      details: {}, listing: {}, multicol: {}, body: {}, html: {}, summary: {}, main: {}, aside: {}, hgroup: {}, section: {}, article: {}, footer: {}, header: {},
      isindex: {}, menu: {}, noscript: {}, fieldset: {}, dir: {}, dd: {}, dt: {}, dl: {}, center: {},
      blockquote: {}, caption: {}, ul: {}, ol: {}, li: {}, td: {}, tr: {}, th: {}, tfoot: {}, thead: {},
      tbody: {}, table: {}, form: {}, pre: {}, address: {}, div: {}, p: {}, hr: {}, h6: {},
      h5: {}, h4: {}, h3: {}, h2: {}, h1: {}, nav: {}, figure: {}, figcaption: {}, datalist: {}, optgroup: {},
      option: {}, select: {}
    });
  });

  it('getVoidElements', () => {
    const schema = Schema();
    assert.deepEqual(schema.getVoidElements(), {
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
      WBR: {}, TRACK: {}, SCRIPT: {}, PRE: {}, CODE: {}, SVG: {},
      embed: {}, param: {}, meta: {}, link: {}, isindex: {},
      input: {}, img: {}, hr: {}, frame: {}, col: {}, br: {},
      basefont: {}, base: {}, area: {}, source: {},
      td: {}, th: {}, iframe: {}, video: {}, audio: {}, object: {},
      wbr: {}, track: {}, script: {}, pre: {}, code: {}, svg: {}
    });
  });

  it('getWhitespaceElements', () => {
    const schema = Schema();
    assert.deepEqual(schema.getWhitespaceElements(), {
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

  it('getTransparentElements', () => {
    const schema = Schema();
    assert.deepEqual(schema.getTransparentElements(), {
      MAP: {}, CANVAS: {}, DEL: {}, INS: {}, A: {},
      map: {}, canvas: {}, del: {}, ins: {}, a: {}
    });
  });

  it('getTextInlineElements', () => {
    const schema = Schema();
    assert.deepEqual(schema.getTextInlineElements(), {
      B: {}, CITE: {}, CODE: {}, DFN: {}, EM: {}, FONT: {}, I: {}, MARK: {}, Q: {}, SAMP: {},
      SPAN: {}, S: {}, STRIKE: {}, STRONG: {}, SUB: {}, SUP: {}, U: {}, VAR: {},
      b: {}, cite: {}, code: {}, dfn: {}, em: {}, font: {}, i: {}, mark: {}, q: {}, samp: {},
      span: {}, s: {}, strike: {}, strong: {}, sub: {}, sup: {}, u: {}, var: {}
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
      'xmp',
      'plaintext'
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
    assert.isObject(getElementRule(schema, 'b'));
    assert.isUndefined(getElementRule(schema, 'bx'));
    assert.isUndefined(schema.getElementRule(null as any));
  });

  it('addCustomElements', () => {
    const schema = Schema({ valid_elements: 'inline,block' });
    schema.addCustomElements('~inline,block');
    assert.isObject(getElementRule(schema, 'inline'));
    assert.isObject(getElementRule(schema, 'block'));
    assert.isTrue(schema.isValidChild('body', 'block'));
    assert.isTrue(schema.isValidChild('block', 'inline'));
    assert.isTrue(schema.isValidChild('p', 'inline'));
  });

  it('addValidChildren add, remove', () => {
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

  it('addValidChildren replace should remove all children except the specified ones', () => {
    const schema = Schema();

    assert.isTrue(schema.isValidChild('a', 'span'));
    assert.isTrue(schema.isValidChild('a', 'b'));

    schema.addValidChildren('a[span]');

    assert.isTrue(schema.isValidChild('a', 'span'));
    assert.isFalse(schema.isValidChild('a', 'b'));
  });

  it('addCustomElements/getCustomElements', () => {
    const schema = Schema();
    schema.addCustomElements('~inline,block');
    assert.isObject(schema.getBlockElements().block);
    assert.isUndefined(schema.getBlockElements().inline);
    assert.isString(schema.getCustomElements().inline);
    assert.isString(schema.getCustomElements().block);
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

  it('TINY-9768: html4 schema should not allow non-inline children for caption, address and dt elements ', () => {
    const schemaHtml4 = Schema({ schema: 'html4' });
    const schemaHtml5 = Schema({ schema: 'html5' });
    Arr.each([ 'caption', 'address', 'dt' ], (parent) => {
      Obj.each(schemaHtml4.getTextBlockElements(), (_v, child) => {
        assert.isFalse(schemaHtml4.isValidChild(parent, child));
      });
      Obj.each(schemaHtml5.getTextBlockElements(), (_v, child) => {
        assert.isTrue(schemaHtml5.isValidChild(parent, child));
      });

    });
  });

  it('TINY-9805: html4 schema should not allow block children elements for the link element ', () => {
    const schemaHtml4 = Schema({ schema: 'html4' });
    Obj.each(schemaHtml4.getTextBlockElements(), (_v, child) => {
      assert.isFalse(schemaHtml4.isValidChild('a', child));
    });
  });

  context('custom elements', () => {
    it('TBA: custom elements are added as element rules and copy the span/div rules', () => {
      const schema = Schema({
        custom_elements: '~foo-bar,bar-foo'
      });

      const inlineRule = getElementRule(schema, 'foo-bar');
      const spanRule = getElementRule(schema, 'span');
      assert.deepEqual(inlineRule.attributes, spanRule.attributes, 'inline custom element rules should be copied from the span rules');
      assert.deepEqual(inlineRule.attributesOrder, spanRule.attributesOrder, 'inline custom element rules should be copied from the span rules');
      assert.deepEqual(schema.children['foo-bar'], schema.children.span);

      const blockRule = getElementRule(schema, 'bar-foo');
      const divRule = getElementRule(schema, 'div');
      assert.deepEqual(blockRule.attributes, divRule.attributes, 'block custom element rules should be copied from the div rules');
      assert.deepEqual(blockRule.attributesOrder, divRule.attributesOrder, 'block custom element rules should be copied from the div rules');
      assert.deepEqual(schema.children['bar-foo'], schema.children.div);
    });

    it('TINY-4784: custom elements should be added to the non-empty elements list by default', () => {
      const schema = Schema({
        custom_elements: '~foo-bar,bar-foo'
      });

      assert.hasAnyKeys(schema.getNonEmptyElements(), [ 'foo-bar', 'FOO-BAR', 'bar-foo', 'BAR-FOO' ]);
    });
  });

  context('TINY-10139: check elements', () => {
    const checkElement = (name: string, predicate: (elm: SugarElement<Node>) => boolean, expectedValue: boolean) => {
      assert.equal(predicate(SugarElement.fromTag(name)), expectedValue, `Should be ${expectedValue} for ${name}`);
    };

    const checkText = (predicate: (elm: SugarElement<Node>) => boolean) => {
      assert.isFalse(predicate(SugarElement.fromText('text')), 'Should be false for non element');
    };

    it('TINY-10139: check block elements', () => {
      const schema = Schema({
        custom_elements: 'foo,bar'
      });
      checkElement('p', (el) => schema.isBlock(SugarNode.name(el)), true);
      checkElement('h1', (el) => schema.isBlock(SugarNode.name(el)), true);
      checkElement('table', (el) => schema.isBlock(SugarNode.name(el)), true);
      checkElement('span', (el) => schema.isBlock(SugarNode.name(el)), false);
      checkElement('b', (el) => schema.isBlock(SugarNode.name(el)), false);
      checkText((el) => schema.isBlock(SugarNode.name(el)));

      checkElement('foo', (el) => schema.isBlock(SugarNode.name(el)), true);
      checkElement('bar', (el) => schema.isBlock(SugarNode.name(el)), true);
    });

    it('TINY-10139: check inline elements', () => {
      const schema = Schema({
        custom_elements: '~foo,~bar'
      });
      checkElement('b', (el) => schema.isInline(SugarNode.name(el)), true);
      checkElement('span', (el) => schema.isInline(SugarNode.name(el)), true);
      checkElement('p', (el) => schema.isInline(SugarNode.name(el)), false);
      checkElement('h1', (el) => schema.isInline(SugarNode.name(el)), false);
      checkText((el) => schema.isInline(SugarNode.name(el)));

      checkElement('foo', (el) => schema.isInline(SugarNode.name(el)), true);
      checkElement('bar', (el) => schema.isInline(SugarNode.name(el)), true);
    });

    it('TINY-10385: with valid_elements: "*[*]" elements that starts with # should not be valid', () => {
      const schema = Schema({
        valid_elements: '*[*]'
      });

      const cases: ({ elementName: string; expectedValue: boolean })[] = [
        { elementName: '#text', expectedValue: false },
        { elementName: '#comment', expectedValue: false },
        { elementName: '#cdata', expectedValue: false },
        { elementName: '#pi', expectedValue: false },
        { elementName: '#doctype', expectedValue: false },
        { elementName: '#document-fragment', expectedValue: false }
      ];

      Arr.each(cases, (c) => {
        assert.equal(schema.isInline(c.elementName), c.expectedValue, `For schema.isInline should be ${c.expectedValue} for ${c.elementName}`);
        assert.equal(schema.isBlock(c.elementName), c.expectedValue, `For schema.isBlock should be ${c.expectedValue} for ${c.elementName}`);
        assert.equal(schema.isWrapper(c.elementName), c.expectedValue, `For schema.isWrapper should be ${c.expectedValue} for ${c.elementName}`);
      });

      assert.equal(schema.isInline('some-fake-element'), true, `For schema.isInline should be 'some-fake-element' for true`);
      assert.equal(schema.isBlock('some-fake-element'), false, `For schema.isBlock should be 'some-fake-element' for false`);
      assert.equal(schema.isWrapper('some-fake-element'), true, `For schema.isWrapper should be 'some-fake-element' for true`);
    });
  });

  context('paddInEmptyBlock', () => {
    it('TINY-8639: default behaviour', () => {
      const schema = Schema({});
      const rules = Obj.mapToArray(schema.getTextInlineElements(), (_value, name) => getElementRule(schema, name.toLowerCase()));
      assert.isTrue(rules.length > 0 && Arr.forall(rules, (rule) => Type.isUndefined(rule.paddInEmptyBlock)));
    });

    it('TINY-8639: padd_empty_block_inline_children: false', () => {
      const schema = Schema({ padd_empty_block_inline_children: false });
      const rules = Obj.mapToArray(schema.getTextInlineElements(), (_value, name) => getElementRule(schema, name.toLowerCase()));
      assert.isTrue(rules.length > 0 && Arr.forall(rules, (rule) => Type.isUndefined(rule.paddInEmptyBlock)));
    });

    it('TINY-8639: padd_empty_block_inline_children: true', () => {
      const schema = Schema({ padd_empty_block_inline_children: true });
      const rules = Obj.mapToArray(schema.getTextInlineElements(), (_value, name) => getElementRule(schema, name.toLowerCase()));
      assert.isTrue(rules.length > 0 && Arr.forall(rules, (rule) => rule.paddInEmptyBlock === true));
    });
  });
});
