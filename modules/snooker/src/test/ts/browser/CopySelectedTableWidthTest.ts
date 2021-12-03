import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Css, SugarElement } from '@ephox/sugar';

import * as CopySelected from 'ephox/snooker/api/CopySelected';
import { reducePrecision } from 'ephox/snooker/test/SizeUtils';

const SEL_CLASS = 'copy-selected';

interface TestCase {
  readonly label: string;
  readonly expectedWidth: string;
  readonly table: string;
}

const matchWithReducedPrecision = (label: string, expected: string, tableWidth: string) => {
  const roundedWidth = reducePrecision(tableWidth, 0);
  Assert.eq(label, expected, roundedWidth);
};

const assertWidth = (testCase: TestCase) => () => {
  const table = SugarElement.fromHtml<HTMLTableElement>(testCase.table);
  // Table needs to be in the actual DOM to perform certain calculations
  document.body.appendChild(table.dom);

  const replica = CopySelected.extract(table, `.${SEL_CLASS}`);
  const tableWidth = Css.get(replica, 'width');

  if (testCase.expectedWidth === '') {
    Assert.eq(testCase.label, testCase.expectedWidth, tableWidth);
  } else {
    matchWithReducedPrecision(testCase.label, testCase.expectedWidth, tableWidth);
  }
  document.body.removeChild(table.dom);
};

const testCases: TestCase[] = [
  {
    label: 'TINY-6664: Assert table width - pixel width single column',
    expectedWidth: '474px',
    table: (
      `<table style="border-collapse: collapse; width: 1036px; height: 235px;" border="1">
        <tbody>
          <tr>
            <td style="width: 330px;">&nbsp;</td>
            <td style="width: 209px;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 454px;">&nbsp;</td>
          </tr>
          <tr>
            <td style="width: 330px;">&nbsp;</td>
            <td style="width: 209px;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 454px;">&nbsp;</td>
          </tr>
        </tbody>
      </table>`
    ),
  },
  {
    label: 'TINY-6664: Assert table width - pixel width multiple columns',
    expectedWidth: '692px',
    table: (
      `<table style="border-collapse: collapse; width: 1036px; height: 235px;" border="1">
        <tbody>
          <tr>
            <td style="width: 330px;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 209px;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 454px;">&nbsp;</td>
          </tr>
          <tr>
            <td style="width: 330px;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 209px;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 454px;">&nbsp;</td>
          </tr>
        </tbody>
      </table>`
    ),
  },
  {
    label: 'TINY-6664: Assert table width - pixel width entire table',
    expectedWidth: '1036px',
    table: (
      `<table style="border-collapse: collapse; width: 1036px; height: 235px;" border="1">
        <tbody>
          <tr>
          <td class="${SEL_CLASS}" style="width: 330px;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 209px;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 454px;">&nbsp;</td>
          </tr>
          <tr>
          <td class="${SEL_CLASS}" style="width: 330px;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 209px;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 454px;">&nbsp;</td>
          </tr>
        </tbody>
      </table>`
    ),
  },
  {
    label: 'TINY-6664: Assert table width - relative width single column',
    expectedWidth: '21%',
    table: (
      `<table style="border-collapse: collapse; width: 63.352%; height: 258px;" border="1">
        <tbody>
          <tr>
            <td style="width: 32.7674%;">&nbsp;</td>
            <td style="width: 32.7674%;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 32.7674%;">&nbsp;</td>
          </tr>
          <tr>
            <td style="width: 32.7674%;">&nbsp;</td>
            <td style="width: 32.7674%;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 32.7674%;">&nbsp;</td>
          </tr>
          <tr>
            <td style="width: 32.7674%;">&nbsp;</td>
            <td style="width: 32.7674%;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 32.7674%;">&nbsp;</td>
          </tr>
        </tbody>
      </table>`
    ),
  },
  {
    label: 'TINY-6664: Assert table width - relative width multiple columns',
    expectedWidth: '42%',
    table: (
      `<table style="border-collapse: collapse; width: 63.352%; height: 258px;" border="1">
        <tbody>
          <tr>
            <td style="width: 32.7674%;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 32.7674%;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 32.7674%;">&nbsp;</td>
          </tr>
          <tr>
            <td style="width: 32.7674%;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 32.7674%;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 32.7674%;">&nbsp;</td>
          </tr>
          <tr>
            <td style="width: 32.7674%;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 32.7674%;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 32.7674%;">&nbsp;</td>
          </tr>
        </tbody>
      </table>`
    ),
  },
  {
    label: 'TINY-6664: Assert table width - relative width entire table',
    expectedWidth: '63%',
    table: (
      `<table style="border-collapse: collapse; width: 63.352%; height: 258px;" border="1">
        <tbody>
          <tr>
            <td class="${SEL_CLASS}" style="width: 32.7674%;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 32.7674%;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 32.7674%;">&nbsp;</td>
          </tr>
          <tr>
            <td class="${SEL_CLASS}" style="width: 32.7674%;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 32.7674%;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 32.7674%;">&nbsp;</td>
          </tr>
          <tr>
            <td class="${SEL_CLASS}" style="width: 32.7674%;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 32.7674%;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 32.7674%;">&nbsp;</td>
          </tr>
        </tbody>
      </table>`
    ),
  },
  {
    label: 'TINY-6664: Assert table width - responsive single column',
    expectedWidth: '',
    table: (
      `<table style="border-collapse: collapse;" border="1">
        <tbody>
          <tr>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td class="${SEL_CLASS}">&nbsp;</td>
          </tr>
          <tr>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td class="${SEL_CLASS}">&nbsp;</td>
          </tr>
        </tbody>
      </table>`
    ),
  },
  {
    label: 'TINY-6664: Assert table width - responsive multiple columns',
    expectedWidth: '',
    table: (
      `<table style="border-collapse: collapse;" border="1">
        <tbody>
          <tr>
            <td>&nbsp;</td>
            <td class="${SEL_CLASS}">&nbsp;</td>
            <td class="${SEL_CLASS}">&nbsp;</td>
          </tr>
          <tr>
            <td>&nbsp;</td>
            <td class="${SEL_CLASS}">&nbsp;</td>
            <td class="${SEL_CLASS}">&nbsp;</td>
          </tr>
        </tbody>
      </table>`
    ),
  },
  {
    label: 'TINY-6664: Assert table width - responsive entire table',
    expectedWidth: '',
    table: (
      `<table style="border-collapse: collapse;" border="1">
        <tbody>
          <tr>
            <td class="${SEL_CLASS}">&nbsp;</td>
            <td class="${SEL_CLASS}">&nbsp;</td>
            <td class="${SEL_CLASS}">&nbsp;</td>
          </tr>
          <tr>
            <td class="${SEL_CLASS}">&nbsp;</td>
            <td class="${SEL_CLASS}">&nbsp;</td>
            <td class="${SEL_CLASS}">&nbsp;</td>
          </tr>
        </tbody>
      </table>`
    ),
  },
  {
    label: 'TINY-6664: Assert table width - colspans (colspan not selected)',
    expectedWidth: '25%',
    table: (
      `<table style="border-collapse: collapse; width: 100%;" border="1">
        <tbody>
          <tr>
            <td class="${SEL_CLASS}" style="width: 24.3849%;">&nbsp;</td>
            <td colspan="2">&nbsp;</td>
            <td style="width: 24.3849%;">&nbsp;</td>
          </tr>
          <tr>
            <td class="${SEL_CLASS}" style="width: 24.3849%;">&nbsp;</td>
            <td style="width: 24.3849%;">&nbsp;</td>
            <td style="width: 24.3849%;">&nbsp;</td>
            <td style="width: 24.3849%;">&nbsp;</td>
          </tr>
          <tr>
            <td class="${SEL_CLASS}" style="width: 24.3849%;">&nbsp;</td>
            <td style="width: 24.3849%;">&nbsp;</td>
            <td style="width: 24.3849%;">&nbsp;</td>
            <td style="width: 24.3849%;">&nbsp;</td>
          </tr>
        </tbody>
      </table>`
    ),
  },
  {
    label: 'TINY-6664: Assert table width - colspans (colspan included in selection)',
    expectedWidth: '75%',
    table: (
      `<table style="border-collapse: collapse; width: 100%;" border="1">
        <tbody>
          <tr>
            <td class="${SEL_CLASS}" style="width: 24.3849%;">&nbsp;</td>
            <td class="${SEL_CLASS}" colspan="2">&nbsp;</td>
            <td style="width: 24.3849%;">&nbsp;</td>
          </tr>
          <tr>
            <td class="${SEL_CLASS}" style="width: 24.3849%;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 24.3849%;">&nbsp;</td>
            <td style="width: 24.3849%;">&nbsp;</td>
            <td style="width: 24.3849%;">&nbsp;</td>
          </tr>
          <tr>
            <td class="${SEL_CLASS}" style="width: 24.3849%;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 24.3849%;">&nbsp;</td>
            <td style="width: 24.3849%;">&nbsp;</td>
            <td style="width: 24.3849%;">&nbsp;</td>
          </tr>
        </tbody>
      </table>`
    ),
  },
  {
    label: 'TINY-6664: Assert table width - rowspans (rowspan not selected)',
    expectedWidth: '25%',
    table: (
      `<table style="border-collapse: collapse; width: 100%;" border="1">
        <tbody>
          <tr>
            <td rowspan="2">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 24.3998%;">&nbsp;</td>
            <td style="width: 24.3998%;">&nbsp;</td>
            <td style="width: 24.3998%;">&nbsp;</td>
          </tr>
          <tr>
            <td class="${SEL_CLASS}" style="width: 24.3998%;">&nbsp;</td>
            <td style="width: 24.3998%;">&nbsp;</td>
            <td style="width: 24.3998%;">&nbsp;</td>
          </tr>
          <tr>
            <td style="width: 24.3562%;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 24.3998%;">&nbsp;</td>
            <td style="width: 24.3998%;">&nbsp;</td>
            <td style="width: 24.3998%;">&nbsp;</td>
          </tr>
        </tbody>
      </table>`
    ),
  },
  {
    label: 'TINY-6664: Assert table width - rowspans (rowspan included in selection)',
    expectedWidth: '50%',
    table: (
      `<table style="border-collapse: collapse; width: 100%;" border="1">
        <tbody>
          <tr>
            <td class="${SEL_CLASS}" rowspan="2">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 24.3998%;">&nbsp;</td>
            <td style="width: 24.3998%;">&nbsp;</td>
            <td style="width: 24.3998%;">&nbsp;</td>
          </tr>
          <tr>
            <td class="${SEL_CLASS}" style="width: 24.3998%;">&nbsp;</td>
            <td style="width: 24.3998%;">&nbsp;</td>
            <td style="width: 24.3998%;">&nbsp;</td>
          </tr>
          <tr>
            <td class="${SEL_CLASS}" style="width: 24.3562%;">&nbsp;</td>
            <td class="${SEL_CLASS}" style="width: 24.3998%;">&nbsp;</td>
            <td style="width: 24.3998%;">&nbsp;</td>
            <td style="width: 24.3998%;">&nbsp;</td>
          </tr>
        </tbody>
      </table>`
    ),
  },
  {
    label: 'TINY-6664: Assert table width - colgroups',
    expectedWidth: '25%',
    table: (
      `<table style="border-collapse: collapse; width: 100%;" border="1">
        <colgroup>
          <col style="width: 24.9564%;" />
          <col style="width: 25%;" />
          <col style="width: 25%;" />
          <col style="width: 25%;" />
        </colgroup>
        <tbody>
          <tr>
            <td class="${SEL_CLASS}">&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
          <tr>
            <td class="${SEL_CLASS}">&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
          <tr>
            <td class="${SEL_CLASS}">&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
        </tbody>
      </table>`
    ),
  },
];

Arr.each(testCases, (testCase) => {
  UnitTest.test(testCase.label, assertWidth(testCase));
});
