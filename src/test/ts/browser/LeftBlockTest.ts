import { UnitTest, assert } from '@ephox/bedrock';
import { DomUniverse } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import LeftBlock from 'ephox/robin/api/general/LeftBlock';
import { Body, InsertAll, Hierarchy, Insert } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { Replication } from '@ephox/sugar';
import { Element } from '@ephox/sugar';

UnitTest.test('LeftBlockTest', function() {
  var universe = DomUniverse();

  var editor = Element.fromTag('div');

  var reset = function () {
    editor.dom().innerHTML = '<p>alpha<span>cat</span><b>hello<i>word</i>hi</b>there</p>';
  };

  var setup = function () {
    Insert.append(Body.body(), editor);
  };

  var cleanup = function () {
    Remove.remove(editor);
  };

  var check = function (expected, path, method) {
    reset();
    var ele = Hierarchy.follow(editor, path);
    assert.eq(true, ele.isSome(), 'Could not find element at path: ' + path);
    ele.each(function (start) {
      var group = method(universe, start);
      var clones = Arr.map(group, Replication.deep);
      var div = Element.fromTag('div');
      InsertAll.append(div, clones);
      assert.eq(expected, div.dom().innerHTML);
    });
  };

  setup();

  var result = Arr.each([
    // I'm only targeting text nodes here ... this is probably a limitation in the current implementation.
    { expected: 'alpha', path: [ 0, 0 ], method: LeftBlock.top },
    { expected: 'alpha', path: [ 0, 0 ], method: LeftBlock.all },
    { expected: 'alpha<span>cat</span>hello', path: [ 0, 2, 0 ], method: LeftBlock.top },
    { expected: 'alphacathello', path: [ 0, 2, 0 ], method: LeftBlock.all },
    { expected: 'alpha<span>cat</span>helloword', path: [ 0, 2, 1, 0 ], method: LeftBlock.top },
    { expected: 'alphacathelloword', path: [ 0, 2, 1, 0 ], method: LeftBlock.all },
    { expected: 'alpha<span>cat</span>hello<i>word</i>hi', path: [ 0, 2, 2 ], method: LeftBlock.top },
    { expected: 'alphacathellowordhi', path: [ 0, 2, 2 ], method: LeftBlock.all },
    { expected: 'alpha<span>cat</span><b>hello<i>word</i>hi</b>there', path: [ 0, 3 ], method: LeftBlock.top },
    { expected: 'alphacathellowordhithere', path: [ 0, 3 ], method: LeftBlock.all }
  ], function (item) {
    check(item.expected, item.path, item.method);
  });

  cleanup();
  
});

