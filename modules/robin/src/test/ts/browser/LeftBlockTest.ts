import { Assert, UnitTest } from '@ephox/bedrock-client';
import { DomUniverse, Universe } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import { Hierarchy, Insert, InsertAll, Remove, Replication, SugarBody, SugarElement } from '@ephox/sugar';

import * as LeftBlock from 'ephox/robin/api/general/LeftBlock';

UnitTest.test('LeftBlockTest', () => {
  const universe = DomUniverse();

  const editor = SugarElement.fromTag('div');

  const reset = () => {
    editor.dom.innerHTML = '<p>alpha<span>cat</span><b>hello<i>word</i>hi</b>there</p>';
  };

  const setup = () => {
    Insert.append(SugarBody.body(), editor);
  };

  const cleanup = () => {
    Remove.remove(editor);
  };

  const check = (expected: string, path: number[], method: <E, D>(universe: Universe<E, D>, item: E) => E[]) => {
    reset();
    const ele = Hierarchy.follow(editor, path);
    Assert.eq('Could not find element at path: ' + path, true, ele.isSome());
    ele.each((start) => {
      const group = method(universe, start);
      const clones = Arr.map(group, Replication.deep);
      const div = SugarElement.fromTag('div');
      InsertAll.append(div, clones);
      Assert.eq('', expected, div.dom.innerHTML);
    });
  };

  setup();

  Arr.each([
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
  ], (item) => {
    check(item.expected, item.path, item.method);
  });

  cleanup();

});
