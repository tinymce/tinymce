test(
  'Test: phantom.bridge.LinkBridgeTest',

  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Logger',
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.test.TestStore',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element',
    'tinymce.themes.mobile.bridge.LinkBridge'
  ],

  function (ApproxStructure, Assertions, Logger, RawAssertions, TestStore, FieldSchema, Objects, ValueSchema, Cell, Fun, Option, Element, LinkBridge) {
    var store = TestStore();

    var editorState = {
      start: Cell(null),
      content: Cell('')
    };

    var editor = {
      selection: {
        getStart: editorState.start.get,
        getContent: editorState.content.get,
        select: Fun.noop
      },
      insertContent: function (data) {
        store.adder({ method: 'insertContent', data: data })();
      },
      execCommand: function (name) {
        store.adder({ method: 'execCommand', data: name })();
      },
      dom: {
        createHTML: function (tag, attributes, innerText) {
          return { tag: tag, attributes: attributes, innerText: innerText };
        },
        encode: Fun.identity
      },
      focus: Fun.noop
    };

    var checkGetNoLink = function (rawScenario) {
      var schema = ValueSchema.objOfOnly([
        FieldSchema.strict('label'),
        FieldSchema.defaulted('nodeText', ''),
        FieldSchema.defaulted('selection', ''),
        FieldSchema.strict('expected')
      ]);

      var scenario = ValueSchema.asRawOrDie(rawScenario.label, schema, rawScenario);

      Logger.sync('getInfo ... ' + scenario.label, function () {
        editorState.start.set(Element.fromText(scenario.nodeText).dom());
        editorState.content.set(scenario.selection);
        var info = LinkBridge.getInfo(editor);
        RawAssertions.assertEq('Checking getInfo (no link)', {
          url: '',
          text: scenario.expected,
          title: '',
          target: ''
        }, Objects.narrow(info, [ 'url', 'text', 'target', 'title' ]));
        RawAssertions.assertEq('Checking link is not set', true, info.link.isNone());
      });
    };

    var checkGetALink = function (rawScenario) {
      var schema = ValueSchema.objOfOnly([
        FieldSchema.strict('label'),
        FieldSchema.defaulted('linkHtml', ''),
        FieldSchema.defaulted('selection', ''),
        FieldSchema.strict('expected')
      ]);

      var scenario = ValueSchema.asRawOrDie(rawScenario.label, schema, rawScenario);

      Logger.sync('getInfo ... ' + scenario.label + ', link: ' + scenario.linkHtml, function () {
        editorState.start.set(Element.fromHtml(scenario.linkHtml).dom());
        editorState.content.set(scenario.selection);
        var info = LinkBridge.getInfo(editor);
        RawAssertions.assertEq('Checking getInfo (link)', scenario.expected, Objects.narrow(info, [ 'url', 'text', 'target', 'title' ]));
        RawAssertions.assertEq('Checking link is set', true, info.link.isSome());
      });
    };

    var checkApply = function (rawScenario) {
      var schema = ValueSchema.objOfOnly([
        FieldSchema.strict('label'),
        FieldSchema.strictObjOf('info', [
          FieldSchema.option('url'),
          FieldSchema.option('text'),
          FieldSchema.option('title'),
          FieldSchema.option('target'),
          FieldSchema.option('link')
        ]),
        FieldSchema.defaulted('mutations', Fun.noop),
        FieldSchema.defaulted('expected', [ ])
      ]);

      var scenario = ValueSchema.asRawOrDie(rawScenario.label, schema, rawScenario);
      Logger.sync('setInfo ... ' + scenario.label, function () {
        store.clear();
        LinkBridge.applyInfo(editor, scenario.info);
        store.assertEq('Checking store', scenario.expected);
        var link = scenario.info.link.bind(Fun.identity);
        link.each(scenario.mutations);
      });
    };

    checkGetNoLink({
      label: 'Basic text node with no text',
      expected: ''
    });

    checkGetNoLink({
      label: 'Basic text node with some text and no selection',
      nodeText: 'some',
      expected: ''
    });

    checkGetNoLink({
      label: 'Basic text node with some text and "sel" selection',
      nodeText: 'some',
      selection: 'sel',
      expected: 'sel'
    });

    checkGetALink({
      label: 'Link with href',
      linkHtml: '<a href="http://foo">Foo</a>',
      selection: 'sel',
      expected: {
        url: 'http://foo',
        text: 'Foo',
        title: '',
        target: ''
      }
    });

    checkGetALink({
      label: 'Link with href and target',
      linkHtml: '<a href="http://foo" target="_blank">Foo</a>',
      selection: 'sel',
      expected: {
        url: 'http://foo',
        text: 'Foo',
        title: '',
        target: '_blank'
      }
    });

    checkGetALink({
      label: 'Link with href and target and title',
      linkHtml: '<a href="http://foo" target="_blank" title="wow">Foo</a>',
      selection: 'sel',
      expected: {
        url: 'http://foo',
        text: 'Foo',
        title: 'wow',
        target: '_blank'
      }
    });

    checkGetALink({
      label: 'Link with href and matching text (should ignore text)',
      linkHtml: '<a href="http://foo">http://foo</a>',
      selection: 'sel',
      expected: {
        url: 'http://foo',
        text: '',
        title: '',
        target: ''
      }
    });

    checkApply({
      label: 'Applying to empty text',
      info: {
        url: 'hi'
      },
      mutations: function (elem) {

      },
      expected: [
        {
          method: 'insertContent',
          data: {
            tag: 'a',
            attributes: {
              href: 'hi'
            },
            innerText: 'hi'
          }
        }
      ]
    });

    checkApply({
      label: 'Applying to empty text with [ text ]',
      info: {
        url: 'hi',
        text: 'hello'
      },
      mutations: function (elem) {

      },
      expected: [
        {
          method: 'insertContent',
          data: {
            tag: 'a',
            attributes: {
              href: 'hi'
            },
            innerText: 'hello'
          }
        }
      ]
    });

    checkApply({
      label: 'Applying to empty text with [ text, title ]',
      info: {
        url: 'hi',
        text: 'hello',
        title: 'Title'
      },
      mutations: function (elem) {

      },
      expected: [
        {
          method: 'insertContent',
          data: {
            tag: 'a',
            attributes: {
              href: 'hi',
              title: 'Title'
            },
            innerText: 'hello'
          }
        }
      ]
    });

    checkApply({
      label: 'Applying to empty text with [ text, title, target ]',
      info: {
        url: 'hi',
        text: 'hello',
        title: 'Title',
        target: 'new'
      },
      mutations: function (elem) {

      },
      expected: [
        {
          method: 'insertContent',
          data: {
            tag: 'a',
            attributes: {
              href: 'hi',
              title: 'Title',
              target: 'new'
            },
            innerText: 'hello'
          }
        }
      ]
    });

    checkApply({
      label: 'Applying to simple link (http://foo) with url',
      info: {
        url: 'hi',
        text: '',
        title: '',
        target: '',
        link: Option.some(
          Element.fromHtml('<a href="http://foo">http://foo</a>')
        )
      },
      mutations: function (elem) {
        Assertions.assertStructure('Checking structure', ApproxStructure.build(function (s, str, arr) {
          return s.element('a', {
            attrs: {
              href: str.is('hi')
            },
            html: str.is('hi')
          });
        }), elem);
      }
    });

    checkApply({
      label: 'Applying to complex link (http://foo), Foo with url',
      info: {
        url: 'hi',
        text: '',
        title: '',
        target: '',
        link: Option.some(
          Element.fromHtml('<a href="http://foo">Foo</a>')
        )
      },
      mutations: function (elem) {
        Assertions.assertStructure('Checking structure', ApproxStructure.build(function (s, str, arr) {
          return s.element('a', {
            attrs: {
              href: str.is('hi')
            },
            html: str.is('Foo')
          });
        }), elem);
      }
    });

    checkApply({
      label: 'Applying to complex link (http://foo), Foo with url, text, and title',
      info: {
        url: 'hi',
        text: 'new-text',
        title: 'new-title',
        target: '',
        link: Option.some(
          Element.fromHtml('<a href="http://foo">Foo</a>')
        )
      },
      mutations: function (elem) {
        Assertions.assertStructure('Checking structure', ApproxStructure.build(function (s, str, arr) {
          return s.element('a', {
            attrs: {
              href: str.is('hi'),
              title: str.is('new-title')
            },
            html: str.is('new-text')
          });
        }), elem);
      }
    });

    checkApply({
      label: 'Unlinking a link by removing the URL',
      info: {
        url: '',
        text: 'new-text',
        title: 'new-title',
        target: '',
        link: Option.some(
          Element.fromHtml('<a href="http://foo">Foo</a>')
        )
      },
      expected: [
        {
          method: 'execCommand',
          data: 'unlink'
        }
      ]
    });

    checkApply({
      label: 'Unlinking should not be called if there is no existing link',
      info: {
        url: '',
        text: 'new-text',
        title: 'new-title',
        target: '',
        link: Option.none()
      },
      expected: [ ]
    });
  }
);
