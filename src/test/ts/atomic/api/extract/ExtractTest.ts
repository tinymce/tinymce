import { Gene } from '@ephox/boss';
import { TestUniverse } from '@ephox/boss';
import { TextGene } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import * as Extract from 'ephox/phoenix/api/general/Extract';
import * as Finder from 'ephox/phoenix/test/Finder';
import * as TestRenders from 'ephox/phoenix/test/TestRenders';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('api.Extract.(from,all,extract,extractTo)', function() {
  var doc = TestUniverse(
    Gene('root', 'root', [
      Gene('1', 'div', [
        Gene('1.1', 'p', [
          Gene('1.1.1', 'img', []),
          TextGene('1.1.2', 'post-image text')
        ]),
        Gene('1.2', 'p', [
          TextGene('1.2.1', 'This is text'),
          Gene('1.2.2', 'span', [
            TextGene('1.2.2.1', 'inside a span')
          ]),
          TextGene('1.2.3', 'More text'),
          Gene('1.2.4', 'em', [
            TextGene('1.2.4.1', 'Inside em')
          ]),
          TextGene('1.2.5', 'Last piece of text')
        ])
      ])
    ])
  );

  var check = function (expected, extract, initial) {
    var start = Finder.get(doc, initial);
    var actual = extract(doc, start);
    assert.eq(expected, Arr.map(actual, TestRenders.typeditem));
  };

  var checkFrom = function (expected, initial) {
    check(expected, Extract.from, initial);
  };

  var checkAll = function (expected, initial) {
    var start = Finder.get(doc, initial);
    var actual = Extract.all(doc, start);
    assert.eq(expected, Arr.map(actual, function (a) {
      return a.id;
    }));
  };

  //
  // var extract = function (universe, child, offset) {
  var checkExtract = function (expected, childId, offset) {
    var child = Finder.get(doc, childId);
    var actual = Extract.extract(doc, child, offset);
    assert.eq(expected.id, actual.element().id);
    assert.eq(expected.offset, actual.offset());
  };

  var checkExtractTo = function (expected, childId, offset, pred) {
    var child = Finder.get(doc, childId);
    var actual = Extract.extractTo(doc, child, offset, pred);
    assert.eq(expected.id, actual.element().id);
    assert.eq(expected.offset, actual.offset());
  };

  checkFrom([
    'boundary(1)',
    'boundary(1.1)',
    'empty(1.1.1)',
    'text("post-image text")',
    'boundary(1.1)',
    'boundary(1.2)',
    'text("This is text")',
    'text("inside a span")',
    'text("More text")',
    'text("Inside em")',
    'text("Last piece of text")',
    'boundary(1.2)',
    'boundary(1)'
  ], 'root');

  checkAll([
    '1', '1.1', '1.1.1', '1.1.2', '1.1', '1.2', '1.2.1', '1.2.2.1',
    '1.2.3', '1.2.4.1', '1.2.5', '1.2', '1'
  ], 'root');

  checkExtract({ id: '1.2', offset: 3 }, '1.2.1', 3);
  checkExtract({ id: '1.2', offset: 'This is textinside a span'.length }, '1.2.3', 0);
  checkExtract({
    id: '1.2',
    offset: 'This is textinside a spanMore textInside em'.length
  }, '1.2.5', 0);
  checkExtract({ id: '1.1', offset: 1 }, '1.1.2', 0);

  checkExtractTo({ id: '1.2', offset: 'This is textinside a spanMore text'.length + 2 }, '1.2.4.1', 2, function (item) {
    return item.name === 'p';
  });
});

