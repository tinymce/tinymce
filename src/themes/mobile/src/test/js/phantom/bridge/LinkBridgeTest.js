test(
  'Test: phantom.bridge.LinkBridgeTest',

  [
    'ephox.agar.api.Logger',
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.test.TestStore',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Element',
    'tinymce.themes.mobile.bridge.LinkBridge'
  ],

  function (Logger, RawAssertions, TestStore, FieldSchema, Objects, ValueSchema, Cell, Fun, Element, LinkBridge) {
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
          text: scenario.expected
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
  }
);
