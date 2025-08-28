import { Assertions } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Hierarchy, Html, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as SimpleTableModel from 'tinymce/core/selection/SimpleTableModel';

describe('browser.tinymce.core.selection.SimpleTableModel', () => {
  const fromDom = (html: string) => SimpleTableModel.fromDom(SugarElement.fromHtml(html));

  const fromDomSubSection = (html: string, startPath: number[], endPath: number[]) => {
    const tableElm = SugarElement.fromHtml<HTMLTableElement>(html);
    const startElm = Hierarchy.follow(tableElm, startPath).getOrDie();
    const endElm = Hierarchy.follow(tableElm, endPath).getOrDie();
    return SimpleTableModel.subsection(SimpleTableModel.fromDom(tableElm), startElm, endElm).getOrDie('Failed to get the subsection');
  };

  const assertWidth = (tableModel: SimpleTableModel.TableModel, expectedWidth: number) => {
    assert.equal(tableModel.width, expectedWidth, 'Should be expected width');
  };

  const assertHeight = (tableModel: SimpleTableModel.TableModel, expectedHeight: number) => {
    assert.equal(tableModel.rows.length, expectedHeight, 'Should be expected height');
  };

  const assertModelAsHtml = (tableModel: SimpleTableModel.TableModel, expectedHtml: string) => {
    const actualHtml = Html.getOuter(SimpleTableModel.toDom(tableModel));
    Assertions.assertHtml('Should be expected table html', expectedHtml, actualHtml);
  };

  context('fromDom/toDom', () => {
    it('Table 1x1', () => {
      const model = fromDom('<table><tbody><tr><td>A</td></tr></tbody></table>');
      assertWidth(model, 1);
      assertHeight(model, 1);
      assertModelAsHtml(model, '<table><tbody><tr><td>A</td></tr></tbody></table>');
    });

    it('Table 1x1 with classes', () => {
      const model = fromDom('<table class="a"><tbody><tr class="b"><td class="c">A</td></tr></tbody></table>');
      assertWidth(model, 1);
      assertHeight(model, 1);
      assertModelAsHtml(model, '<table class="a"><tbody><tr class="b"><td class="c">A</td></tr></tbody></table>');
    });

    it('Table 2x1', () => {
      const model = fromDom('<table><tbody><tr><td>A</td><td>B</td></tr></tbody></table>');
      assertWidth(model, 2);
      assertHeight(model, 1);
      assertModelAsHtml(model, '<table><tbody><tr><td>A</td><td>B</td></tr></tbody></table>');
    });

    it('Table 2x2', () => {
      const model = fromDom('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>');
      assertWidth(model, 2);
      assertHeight(model, 2);
      assertModelAsHtml(model, '<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>');
    });

    it('Table 2x2 with colspan', () => {
      const model = fromDom('<table><tbody><tr><td colspan="2">A</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>');
      assertWidth(model, 2);
      assertHeight(model, 2);
      assertModelAsHtml(model, '<table><tbody><tr><td>A</td><td></td></tr><tr><td>C</td><td>D</td></tr></tbody></table>');
    });

    it('Table 2x2 with rowspan', () => {
      const model = fromDom('<table><tbody><tr><td rowspan="2">A</td><td>B</td></tr><tr><td>D</td></tr></tbody></table>');
      assertWidth(model, 2);
      assertHeight(model, 2);
      assertModelAsHtml(model, '<table><tbody><tr><td>A</td><td>B</td></tr><tr><td></td><td>D</td></tr></tbody></table>');
    });

    it('Table 3x3 with colspan & rowspan', () => {
      const model = fromDom('<table><tbody><tr><td colspan="2" rowspan="2">A</td><td>B</td></tr><tr><td>C</td></tr><tr><td>D</td><td>E</td><td>F</td></tr></tbody></table>');
      assertWidth(model, 3);
      assertHeight(model, 3);
      assertModelAsHtml(model, '<table><tbody><tr><td>A</td><td></td><td>B</td></tr><tr><td></td><td></td><td>C</td></tr><tr><td>D</td><td>E</td><td>F</td></tr></tbody></table>');
    });
  });

  context('subsection', () => {
    it('Table 1x1 subsection (1,1)-(1,1)', () => {
      const model = fromDomSubSection('<table><tbody><tr><td>A</td></tr></tbody></table>', [ 0, 0, 0 ], [ 0, 0, 0 ]);
      assertWidth(model, 1);
      assertHeight(model, 1);
      assertModelAsHtml(model, '<table><tbody><tr><td>A</td></tr></tbody></table>');
    });

    it('Table 2x2 subsection (1,1)-(2,1)', () => {
      const model = fromDomSubSection('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>', [ 0, 0, 0 ], [ 0, 0, 1 ]);
      assertWidth(model, 2);
      assertHeight(model, 1);
      assertModelAsHtml(model, '<table><tbody><tr><td>A</td><td>B</td></tr></tbody></table>');
    });

    it('Table 2x2 subsection (2,1)-(1,1)', () => {
      const model = fromDomSubSection('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>', [ 0, 0, 1 ], [ 0, 0, 0 ]);
      assertWidth(model, 2);
      assertHeight(model, 1);
      assertModelAsHtml(model, '<table><tbody><tr><td>A</td><td>B</td></tr></tbody></table>');
    });

    it('Table 2x2 subsection (1,1)-(1,2)', () => {
      const model = fromDomSubSection('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>', [ 0, 0, 0 ], [ 0, 1, 0 ]);
      assertWidth(model, 1);
      assertHeight(model, 2);
      assertModelAsHtml(model, '<table><tbody><tr><td>A</td></tr><tr><td>C</td></tr></tbody></table>');
    });

    it('Table 2x2 subsection (1,2)-(1,1)', () => {
      const model = fromDomSubSection('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>', [ 0, 1, 0 ], [ 0, 0, 0 ]);
      assertWidth(model, 1);
      assertHeight(model, 2);
      assertModelAsHtml(model, '<table><tbody><tr><td>A</td></tr><tr><td>C</td></tr></tbody></table>');
    });

    it('Table 3x3 subsection (2,2)-(3,3)', () => {
      const model = fromDomSubSection('<table><tbody><tr><td>A</td><td>B</td><td>C</td></tr><tr><td>D</td><td>E</td><td>F</td></tr><tr><td>G</td><td>H</td><td>I</td></tr></tbody></table>', [ 0, 1, 1 ], [ 0, 2, 2 ]);
      assertWidth(model, 2);
      assertHeight(model, 2);
      assertModelAsHtml(model, '<table><tbody><tr><td>E</td><td>F</td></tr><tr><td>H</td><td>I</td></tr></tbody></table>');
    });

    it('Table 3x3 subsection (3,3)-(2,2)', () => {
      const model = fromDomSubSection('<table><tbody><tr><td>A</td><td>B</td><td>C</td></tr><tr><td>D</td><td>E</td><td>F</td></tr><tr><td>G</td><td>H</td><td>I</td></tr></tbody></table>', [ 0, 2, 2 ], [ 0, 1, 1 ]);
      assertWidth(model, 2);
      assertHeight(model, 2);
      assertModelAsHtml(model, '<table><tbody><tr><td>E</td><td>F</td></tr><tr><td>H</td><td>I</td></tr></tbody></table>');
    });
  });
});
