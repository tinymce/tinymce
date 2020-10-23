import { assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { SugarElement, SugarNode, Traverse } from '@ephox/sugar';
import * as DomLook from 'ephox/robin/api/dom/DomLook';
import * as DomParent from 'ephox/robin/api/dom/DomParent';
import * as DomStructure from 'ephox/robin/api/dom/DomStructure';
import * as BrowserCheck from 'ephox/robin/test/BrowserCheck';

UnitTest.test('BlockTest', function () {
  const check = function (expected: string, input: string, look: (e: SugarElement) => Optional<SugarElement>) {
    BrowserCheck.run(input, function (node) {
      const actual = DomParent.sharedOne(look, [ node ]);
      actual.fold(function () {
        assert.fail('Expected a common ' + expected + ' tag');
      }, function (act) {
        assert.eq(expected, SugarNode.name(act));
      });
    });
  };

  const checkNone = function (input: string, look: (e: SugarElement) => Optional<SugarElement>) {
    BrowserCheck.run(input, function (node) {
      const actual = DomParent.sharedOne(look, [ node ]);
      actual.each(function (a) {
        assert.fail('Expected no common tag matching the look. Received: ' + SugarNode.name(a));
      });
    });
  };

  check('p', '<p>this<span class="me"> is it </span></p>', DomLook.selector('p'));
  checkNone('<p>this<span class="me"> is it</span></p>', DomLook.selector('blockquote'));

  check('p', '<p>this<span class="me"> is it </span></p>', DomLook.predicate(function (element) {
    return SugarNode.name(element) === 'p';
  }));

  check('p', '<p>this<span class="me"> is it </span></p>', DomLook.predicate(DomStructure.isBlock));

  BrowserCheck.run('<p>this<span class="child"> is it </span></p>', function (node) {
    const actual = DomParent.sharedOne(DomLook.exact(Traverse.parent(node).getOrDie()), [ node ]);
    actual.fold(function () {
      assert.fail('Expected a common tag');
    }, function (act) {
      assert.eq('span', SugarNode.name(act));
    });
  });
});
