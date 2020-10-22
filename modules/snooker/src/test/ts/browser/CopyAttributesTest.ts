import { Log, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';
import { SelectorFind, SugarDocument, SugarElement } from '@ephox/sugar';

import { cellOperations } from 'ephox/snooker/api/TableFill';

UnitTest.asynctest('modules.snooker.src.test.ts.browser.CopyAttributesTest.ts', (success, failure) => {
  const operations = cellOperations(Fun.noop, SugarDocument.getDocument(), Optional.none());

  const generateCell = (input: string, type: string) => {
    const modifiedInput = '<table><tbody><tr>' + input + '</tr></tbody></table>';
    const element = SugarElement.fromHtml<HTMLTableElement>(modifiedInput);
    return SelectorFind.descendant<HTMLTableCellElement>(element, type).getOrDie('Error here');
  };

  const sMakeCellComparison = (id: string, desctripion: string, type: string, input: string, expectedOutput: string): Step<any, any> =>
    Log.step(id, desctripion, Step.sync(() => {
      const newCell = operations.cell({
        element: generateCell(input, type),
        colspan: 0,
        rowspan: 0
      });

      Assert.eq(
        'Ensure output html matches expectations',
        expectedOutput,
        newCell.dom.outerHTML
      );
    }));

  Pipeline.async({}, [
    sMakeCellComparison('TINY-6485', 'nothing copied if nothing is added for td', 'td', '<td></td>', '<td><br></td>'),
    sMakeCellComparison('TINY-6485', 'nothing copied if nothing is added for th', 'th', '<th></th>', '<th><br></th>'),
    sMakeCellComparison('TINY-6485', 'copy scope if value is row for td', 'td', '<td scope="row"></td>', '<td scope="row"><br></td>'),
    sMakeCellComparison('TINY-6485', 'copy scope if value is row for th', 'th', '<th scope="row"></th>', '<th scope="row"><br></th>'),
    sMakeCellComparison('TINY-6485', 'copy scope if value is col', 'th', '<th scope="col"></th>', '<th scope="col"><br></th>'),
    sMakeCellComparison('TINY-6485', 'nothing copied if scope value is not a pre-approved value', 'th', '<th scope="wrong"></th>', '<th><br></th>'),
    sMakeCellComparison('TINY-6485', 'do not copy random attributes for td.', 'td', '<td badAttribute="something"></td>', '<td><br></td>'),
    sMakeCellComparison('TINY-6485', 'do not copy random attributes for th.', 'th', '<th badAttribute="something"></th>', '<th><br></th>')
  ], success, failure);
});