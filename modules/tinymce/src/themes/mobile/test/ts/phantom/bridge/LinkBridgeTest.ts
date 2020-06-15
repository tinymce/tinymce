import { ApproxStructure, Assertions, Logger } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { FieldSchema, Objects, ValueSchema } from '@ephox/boulder';
import { Cell, Fun, Option, Result } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import { Element } from '@ephox/sugar';

import * as LinkBridge from 'tinymce/themes/mobile/bridge/LinkBridge';

UnitTest.test('Test: phantom.bridge.LinkBridgeTest', function () {
  const store = TestHelpers.TestStore();

  const editorState = {
    start: Cell(null),
    content: Cell('')
  };

  const editor = {
    selection: {
      getStart: editorState.start.get,
      getContent: editorState.content.get,
      select: Fun.noop
    },
    insertContent(data) {
      store.adder({ method: 'insertContent', data })();
    },
    execCommand(name) {
      store.adder({ method: 'execCommand', data: name })();
    },
    dom: {
      createHTML(tag, attributes, innerText) {
        return { tag, attributes, innerText };
      },
      encode: Fun.identity
    },
    focus: Fun.noop
  };

  const checkGetNoLink = function (rawScenario) {
    const schema = ValueSchema.objOfOnly([
      FieldSchema.strict('label'),
      FieldSchema.defaulted('nodeText', ''),
      FieldSchema.defaulted('selection', ''),
      FieldSchema.strict('expected')
    ]);

    const scenario = ValueSchema.asRawOrDie(rawScenario.label, schema, rawScenario);

    Logger.sync('getInfo ... ' + scenario.label, function () {
      editorState.start.set(Element.fromText(scenario.nodeText).dom());
      editorState.content.set(scenario.selection);
      const info = LinkBridge.getInfo(editor);
      Assert.eq('Checking getInfo (no link)', {
        url: '',
        text: scenario.expected,
        title: '',
        target: ''
      }, Objects.narrow(info, [ 'url', 'text', 'target', 'title' ]));
      KAssert.eqNone('Checking link is not set', info.link);
    });
  };

  const checkGetALink = function (rawScenario) {
    const schema = ValueSchema.objOfOnly([
      FieldSchema.strict('label'),
      FieldSchema.defaulted('linkHtml', ''),
      FieldSchema.defaulted('selection', ''),
      FieldSchema.strict('expected')
    ]);

    const scenario = ValueSchema.asRawOrDie(rawScenario.label, schema, rawScenario);

    Logger.sync('getInfo ... ' + scenario.label + ', link: ' + scenario.linkHtml, function () {
      editorState.start.set(Element.fromHtml(scenario.linkHtml).dom());
      editorState.content.set(scenario.selection);
      const info = LinkBridge.getInfo(editor);
      Assert.eq('Checking getInfo (link)', scenario.expected, Objects.narrow(info, [ 'url', 'text', 'target', 'title' ]));
      Assert.eq('Checking link is set', true, info.link.isSome());
    });
  };

  const checkApply = function (rawScenario) {
    const toResult = (info, param) => Option.from(info[param]).fold(() => Result.error('Missing ' + param), Result.value);
    const scenario = {
      label: Option.from(rawScenario.label).getOrDie('Missing label'),
      info: Option.from(rawScenario.info).map((info) => ({
        url: toResult(info, 'url'),
        text: toResult(info, 'text'),
        title: toResult(info, 'title'),
        target: toResult(info, 'target'),
        link: toResult(info, 'link')
      })).getOrDie('Missing info'),
      mutations: Option.from(rawScenario.mutations).getOr(Fun.noop),
      expected: Option.from(rawScenario.expected).getOr([])
    };

    Logger.sync('setInfo ... ' + scenario.label, function () {
      store.clear();
      LinkBridge.applyInfo(editor, scenario.info);
      store.assertEq('Checking store', scenario.expected);
      const link = scenario.info.link.bind(Fun.identity);
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
    mutations(_elem) {

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
    mutations(_elem) {

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
    mutations(_elem) {

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
    mutations(_elem) {

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
    mutations(elem) {
      Assertions.assertStructure('Checking structure', ApproxStructure.build(function (s, str, _arr) {
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
    mutations(elem) {
      Assertions.assertStructure('Checking structure', ApproxStructure.build(function (s, str, _arr) {
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
    mutations(elem) {
      Assertions.assertStructure('Checking structure', ApproxStructure.build(function (s, str, _arr) {
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
});
