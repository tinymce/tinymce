import { UnitTest, assert } from '@ephox/bedrock';
import { Arr } from '@ephox/katamari';
import DomStructure from 'ephox/robin/api/dom/DomStructure';
import { Element } from '@ephox/sugar';

UnitTest.test('DomStructureTest', function() {
  var expectInlineElements = ['span', 'em', 'strong', 'b', 'i', 'a' ];

  var getInline = function (el) {
    var element = Element.fromTag(el);
    return DomStructure.isInline(element);
  };
  Arr.each(expectInlineElements, function (e) {
    assert.eq(true, getInline(e), 'Expected ' + e + 'to be inline, but it wasn\'t ');
  });

  var expectNonInlineElements = ['p', 'div', 'blockquote', 'h1', 'h2', 'h3', 'ul', 'li' ];
  Arr.each(expectNonInlineElements, function (e) {
    assert.eq(false, getInline(e), 'Expected ' + e + ' to not be inline, but it was');
  });
});

