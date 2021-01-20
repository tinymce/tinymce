import { assert, UnitTest } from '@ephox/bedrock-client';
import { SugarElement, TextContent } from '@ephox/sugar';
import * as Structs from 'ephox/snooker/api/Structs';
import { Warehouse } from 'ephox/snooker/api/Warehouse';
import * as Blocks from 'ephox/snooker/lookup/Blocks';

UnitTest.test('BlocksTest', () => {
  const createCell = (text: string): SugarElement => {
    const elem = SugarElement.fromTag('td');
    TextContent.set(elem, text);
    return elem;
  };
  const s = (elemText: string, rowspan: number, colspan: number) => Structs.detail(createCell(elemText), rowspan, colspan);
  const f = (cells: Structs.Detail[], section: 'tbody' | 'thead' | 'tfoot') => Structs.rowdata(SugarElement.fromTag('tr'), cells, section);

  const warehouse = Warehouse.generate([
    f([ s('a', 1, 1), s('b', 1, 2) ], 'thead'),
    f([ s('c', 2, 1), s('d', 1, 1), s('e', 1, 1) ], 'tbody'),
    f([ s('f', 1, 1), s('g', 1, 1) ], 'tbody'),
    f([ s('h', 1, 1), s('i', 1, 2) ], 'tfoot')
  ]);

  assert.eq([ 'a', 'd', 'e' ], Blocks.columns(warehouse).map((c) => {
    return c.map(TextContent.get).getOrDie();
  }));
});
