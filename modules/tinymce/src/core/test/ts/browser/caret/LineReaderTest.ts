import { Assertions, Chain, GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { console } from '@ephox/dom-globals';
import { Arr, Fun, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Hierarchy, Element } from '@ephox/sugar';
import { CaretPosition } from 'tinymce/core/caret/CaretPosition';
import { getPositionsUntilPreviousLine, LineInfo, getPositionsUntilNextLine, getPositionsAbove, getPositionsBelow, isAtFirstLine, isAtLastLine, findClosestHorizontalPosition, BreakType } from 'tinymce/core/caret/LineReader';
import ViewBlock from '../../module/test/ViewBlock';

UnitTest.asynctest('browser.tinymce.core.caret.LineReader', (success, failure) => {
  const viewBlock = ViewBlock();
  const browser = PlatformDetection.detect().browser;

  interface Path {
    path: number[];
    offset: number;
  }

  const cSetHtml = (html: string) => {
    return Chain.op(function () {
      viewBlock.update(html);
    });
  };

  const logPositions = (msg, positions) => {
    Arr.each(positions, (pos) => {
      // tslint:disable-next-line:no-console
      console.log(msg, pos.container(), pos.offset(), pos.getClientRects());
    });
  };

  const cGetPositionsUntilPreviousLine = (path: number[], offset: number) => {
    return Chain.mapper(function (scope: any) {
      const container = Hierarchy.follow(Element.fromDom(scope.get()), path).getOrDie();
      const pos = CaretPosition(container.dom(), offset);
      return getPositionsUntilPreviousLine(scope.get(), pos);
    });
  };

  const cGetPositionsUntilNextLine = (path: number[], offset: number) => {
    return Chain.mapper(function (scope: any) {
      const container = Hierarchy.follow(Element.fromDom(scope.get()), path).getOrDie();
      const pos = CaretPosition(container.dom(), offset);
      return getPositionsUntilNextLine(scope.get(), pos);
    });
  };

  const cGetAbovePositions = (path: number[], offset: number) => {
    return Chain.mapper(function (scope: any) {
      const container = Hierarchy.follow(Element.fromDom(scope.get()), path).getOrDie();
      const pos = CaretPosition(container.dom(), offset);
      return getPositionsAbove(scope.get(), pos);
    });
  };

  const cGetBelowPositions = (path: number[], offset: number) => {
    return Chain.mapper(function (scope: any) {
      const container = Hierarchy.follow(Element.fromDom(scope.get()), path).getOrDie();
      const pos = CaretPosition(container.dom(), offset);
      return getPositionsBelow(scope.get(), pos);
    });
  };

  const cFindClosestHorizontalPosition = (path: number[], offset: number) => {
    return Chain.mapper(function (positions: CaretPosition[]) {
      const container = Hierarchy.follow(Element.fromDom(viewBlock.get()), path).getOrDie();
      const pos = CaretPosition(container.dom(), offset);
      return findClosestHorizontalPosition(positions, pos);
    });
  };

  const cAssertCaretPositions = (expectedPositions: Path[]) => {
    return Chain.op(function (actualPositions: CaretPosition[]) {
      if (expectedPositions.length !== actualPositions.length) {
        logPositions('cAssertCaretPositions', actualPositions);
      }

      Assertions.assertEq('Should be the expected amount of positions', expectedPositions.length, actualPositions.length);
      Arr.each(expectedPositions, (p: Path, i) => {
        const container = Hierarchy.follow(Element.fromDom(viewBlock.get()), p.path).getOrDie();
        Assertions.assertDomEq('Should be the expected container', container, Element.fromDom(actualPositions[i].container()));
        Assertions.assertEq('Should be the expected offset', p.offset, actualPositions[i].offset());
      });
    });
  };

  const cAssertNone = Chain.op(function (a: Option<any>) {
    Assertions.assertEq('Option return value should be none', true, a.isNone());
  });

  const cAssertLineInfoCaretPositions = (expectedPositions: Path[]) => {
    return Chain.op(function (lineInfo: LineInfo) {
      const actualPositions = lineInfo.positions;

      if (expectedPositions.length !== actualPositions.length) {
        if (expectedPositions.length !== actualPositions.length) {
          logPositions('cAssertLineInfoCaretPositions', actualPositions);
        }
      }

      Assertions.assertEq('Should be the expected amount of positions', expectedPositions.length, actualPositions.length);
      Arr.each(expectedPositions, (p: Path, i) => {
        const container = Hierarchy.follow(Element.fromDom(viewBlock.get()), p.path).getOrDie();
        Assertions.assertDomEq('Should be the expected container', container, Element.fromDom(actualPositions[i].container()));
        Assertions.assertEq('Should be the expected offset', p.offset, actualPositions[i].offset());
      });
    });
  };

  const cAssertBreakPositionNone = Chain.op(function (linebreak: LineInfo) {
    Assertions.assertEq('Should not be a line break position', true, linebreak.breakAt.isNone());
  });

  const cAssertBreakPosition = (path: number[], offset: number) => {
    return Chain.op(function (linebreak: LineInfo) {
      const container = Hierarchy.follow(Element.fromDom(viewBlock.get()), path).getOrDie();
      const breakPos = linebreak.breakAt.getOrDie();

      Assertions.assertDomEq('Should be the expected container', container, Element.fromDom(breakPos.container()));
      Assertions.assertEq('Should be the expected offset', offset, breakPos.offset());
    });
  };

  const cAssertBreakType = (expectedBreakType: BreakType) => {
    return Chain.op(function (linebreak: LineInfo) {
      const actualBreakType = linebreak.breakType;
      Assertions.assertEq('Should be the expected break type',  expectedBreakType, actualBreakType);
    });
  };

  const cAssertCaretPosition = (path: number[], offset: number) => {
    return Chain.op(function (posOption: Option<any>) {
      const container = Hierarchy.follow(Element.fromDom(viewBlock.get()), path).getOrDie();
      const pos = posOption.getOrDie('Needs to return a caret');

      Assertions.assertDomEq('Should be the expected container', container, Element.fromDom(pos.container()));
      Assertions.assertEq('Should be the expected offset', offset, pos.offset());
    });
  };

  const cVisualCaretCheck = (predicate, path: number[], offset: number) => {
    return Chain.mapper(function (scope: any) {
      const container = Hierarchy.follow(Element.fromDom(scope.get()), path).getOrDie();
      const pos = CaretPosition(container.dom(), offset);
      return predicate(scope.get(), pos);
    });
  };

  const cIsAtFirstLine = Fun.curry(cVisualCaretCheck, isAtFirstLine);
  const cIsAtLastLine = Fun.curry(cVisualCaretCheck, isAtLastLine);

  viewBlock.attach();
  Pipeline.async({}, [
    Logger.t('getPositionsUntilPreviousLine', GeneralSteps.sequence([
      Logger.t('Should be an empty array of positions and no linebreak', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cGetPositionsUntilPreviousLine([0, 0], 0),
        cAssertLineInfoCaretPositions([]),
        cAssertBreakType(BreakType.Eol),
        cAssertBreakPositionNone
      ])),
      Logger.t('Should be an array with the first position and second position and no linebreak', Chain.asStep(viewBlock, [
        cSetHtml('<p>ab</p>'),
        cGetPositionsUntilPreviousLine([0, 0], 2),
        cAssertLineInfoCaretPositions([
          { path: [0, 0], offset: 0 },
          { path: [0, 0], offset: 1 }
        ]),
        cAssertBreakType(BreakType.Eol),
        cAssertBreakPositionNone
      ])),
      Logger.t('Should be an array with one position from the second line and a break on the first line 1 <br>', Chain.asStep(viewBlock, [
        cSetHtml('<p>a<br>b</p>'),
        cGetPositionsUntilPreviousLine([0, 2], 1),
        cAssertLineInfoCaretPositions([
          { path: [0, 2], offset: 0 }
        ]),
        cAssertBreakType(BreakType.Br),
        cAssertBreakPosition([0], 1)
      ])),
      Logger.t('Should be an array with one position from the second line and a break on the first line 2 <br>', Chain.asStep(viewBlock, [
        cSetHtml('<p>a<br>bc</p>'),
        cGetPositionsUntilPreviousLine([0, 2], 1),
        cAssertLineInfoCaretPositions([
          { path: [0, 2], offset: 0 }
        ]),
        cAssertBreakType(BreakType.Br),
        cAssertBreakPosition([0], 1)
      ])),
      Logger.t('Should be an array with one position from the second line and a break on the first line <p>', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p><p>b</p>'),
        cGetPositionsUntilPreviousLine([1, 0], 1),
        cAssertLineInfoCaretPositions([
          { path: [1, 0], offset: 0 }
        ]),
        cAssertBreakType(BreakType.Block),
        cAssertBreakPosition([0, 0], 1)
      ])),
      Logger.t('Should be an array with one position from the second line and a break on the first line (wrap)', Chain.asStep(viewBlock, Arr.flatten([
        [
          cSetHtml('<div style="width: 10px">abc def ghi</div>'),
          cGetPositionsUntilPreviousLine([0, 0], 6)
        ],
        browser.isSafari() ? [
          cAssertLineInfoCaretPositions([
            { path: [0, 0], offset: 4 },
            { path: [0, 0], offset: 5 }
          ]),
          cAssertBreakType(BreakType.Wrap),
          cAssertBreakPosition([0, 0], 3)
        ] : [
          cAssertLineInfoCaretPositions([
            { path: [0, 0], offset: 5 }
          ]),
          cAssertBreakType(BreakType.Wrap),
          cAssertBreakPosition([0, 0], 4)
        ]
      ]))),
      Logger.t('Should be an array with zero positions from the second line and a break on the first line', Chain.asStep(viewBlock, Arr.flatten([
        [
          cSetHtml('<div style="width: 10px">abc def ghi</div>'),
          cGetPositionsUntilPreviousLine([0, 0], 5)
        ],
        browser.isSafari() ? [
          cAssertLineInfoCaretPositions([
            { path: [0, 0], offset: 4 }
          ]),
          cAssertBreakType(BreakType.Wrap),
          cAssertBreakPosition([0, 0], 3)
        ] : [
          cAssertLineInfoCaretPositions([]),
          cAssertBreakType(BreakType.Wrap),
          cAssertBreakPosition([0, 0], 4)
        ]
      ])))
    ])),

    Logger.t('getPositionsUntilNextLine', GeneralSteps.sequence([
      Logger.t('Should be an empty array of positions and no linebreak', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cGetPositionsUntilNextLine([0, 0], 1),
        cAssertLineInfoCaretPositions([]),
        cAssertBreakType(BreakType.Eol),
        cAssertBreakPositionNone
      ])),
      Logger.t('Should be an array with the first position and second position and no linebreak', Chain.asStep(viewBlock, [
        cSetHtml('<p>ab</p>'),
        cGetPositionsUntilNextLine([0, 0], 0),
        cAssertLineInfoCaretPositions([
          { path: [0, 0], offset: 1 },
          { path: [0, 0], offset: 2 }
        ]),
        cAssertBreakType(BreakType.Eol),
        cAssertBreakPositionNone
      ])),
      Logger.t('Should be an array with one position from the first line and a break on the first line <br>', Chain.asStep(viewBlock, [
        cSetHtml('<p>a<br>b</p>'),
        cGetPositionsUntilNextLine([0, 0], 0),
        cAssertLineInfoCaretPositions([
          { path: [0, 0], offset: 1 },
          { path: [0], offset: 1 }
        ]),
        cAssertBreakType(BreakType.Br),
        cAssertBreakPosition([0], 1)
      ])),
      Logger.t('Should be an array with one position from the first line and a break on the first line <br>', Chain.asStep(viewBlock, [
        cSetHtml('<p><input><br>b</p>'),
        cGetPositionsUntilNextLine([0], 0),
        cAssertLineInfoCaretPositions([
          { path: [0], offset: 1 }
        ]),
        cAssertBreakType(BreakType.Br),
        cAssertBreakPosition([0], 1)
      ])),
      Logger.t('Should be an array with one position from the first line and a break on the first line <p>', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p><p>b</p>'),
        cGetPositionsUntilNextLine([0, 0], 0),
        cAssertLineInfoCaretPositions([
          { path: [0, 0], offset: 1 }
        ]),
        cAssertBreakType(BreakType.Block),
        cAssertBreakPosition([1, 0], 0)
      ])),
      Logger.t('Should be an array with one position from the second line and a break on the last line', Chain.asStep(viewBlock, [
        cSetHtml('<div style="width: 10px">abc def ghi</div>'),
        cGetPositionsUntilNextLine([0, 0], 6),
        cAssertLineInfoCaretPositions([
          { path: [0, 0], offset: 7 }
        ]),
        cAssertBreakType(BreakType.Wrap),
        cAssertBreakPosition([0, 0], 8)
      ])),
      Logger.t('Should be an array with zero positions from the second line and a break on the last line', Chain.asStep(viewBlock, [
        cSetHtml('<div style="width: 10px">abc def ghi</div>'),
        cGetPositionsUntilNextLine([0, 0], 7),
        cAssertLineInfoCaretPositions([]),
        cAssertBreakType(BreakType.Wrap),
        cAssertBreakPosition([0, 0], 8)
      ]))
    ])),

    Logger.t('isAtFirstLine', GeneralSteps.sequence([
      Logger.t('Should return true at first visual position in paragraph', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cIsAtFirstLine([0, 0], 0),
        Assertions.cAssertEq('Should be true on first position in paragraph', true)
      ])),
      Logger.t('Should return true at second visual position in paragraph', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cIsAtFirstLine([0, 0], 1),
        Assertions.cAssertEq('Should be true on second position in paragraph', true)
      ])),
      Logger.t('Should return false at second br line in paragraph', Chain.asStep(viewBlock, [
        cSetHtml('<p>a<br>b</p>'),
        cIsAtFirstLine([0, 2], 0),
        Assertions.cAssertEq('Should be false on second line in paragraph', false)
      ])),
      Logger.t('Should return false at second pos after br line in paragraph', Chain.asStep(viewBlock, [
        cSetHtml('<p>a<br>b</p>'),
        cIsAtFirstLine([0, 2], 1),
        Assertions.cAssertEq('Should be false on second line in paragraph', false)
      ])),
      Logger.t('Should return false at second paragraph', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p><p>b</p>'),
        cIsAtFirstLine([1, 0], 0),
        Assertions.cAssertEq('Should be false on second line in paragraph', false)
      ])),
      Logger.t('Should return false at second line in a wrapped element', Chain.asStep(viewBlock, [
        cSetHtml('<div style="width: 10px">abc def ghi</div>'),
        cIsAtFirstLine([0, 0], 4),
        Assertions.cAssertEq('Should be false on second line in paragraph', false)
      ])),
      Logger.t('Should return true at paragraph in td', Chain.asStep(viewBlock, [
        cSetHtml('<table><tbody><tr><td><p>a</p></td></tr></tbody></table>'),
        cIsAtFirstLine([0, 0, 0, 0, 0, 0], 0),
        Assertions.cAssertEq('Should be true since it is the first line in td', true)
      ])),
      Logger.t('Should return false at second paragraph in td', Chain.asStep(viewBlock, [
        cSetHtml('<table><tbody><tr><td><p>a</p><p>b</p></td></tr></tbody></table>'),
        cIsAtFirstLine([0, 0, 0, 0, 1, 0], 0),
        Assertions.cAssertEq('Should be false since it is the second line in td', false)
      ]))
    ])),

    Logger.t('isAtLastLine', GeneralSteps.sequence([
      Logger.t('Should return true at first visual position in paragraph', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cIsAtLastLine([0, 0], 0),
        Assertions.cAssertEq('Should be true on first position in paragraph', true)
      ])),
      Logger.t('Should return true at second visual position in paragraph', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cIsAtLastLine([0, 0], 1),
        Assertions.cAssertEq('Should be true on second position in paragraph', true)
      ])),
      Logger.t('Should return false at before first br line in paragraph', Chain.asStep(viewBlock, [
        cSetHtml('<p>a<br>b</p>'),
        cIsAtLastLine([0, 0], 0),
        Assertions.cAssertEq('Should be false on first line in paragraph', false)
      ])),
      Logger.t('Should return false at first line at second pos before br line in paragraph', Chain.asStep(viewBlock, [
        cSetHtml('<p>a<br>b</p>'),
        cIsAtLastLine([0, 0], 1),
        Assertions.cAssertEq('Should be false on first line in paragraph', false)
      ])),
      Logger.t('Should return false at first paragraph', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p><p>b</p>'),
        cIsAtLastLine([0, 0], 0),
        Assertions.cAssertEq('Should be false on first paragraph line', false)
      ])),
      Logger.t('Should return false at second line in a wrapped element', Chain.asStep(viewBlock, [
        cSetHtml('<div style="width: 10px">abc def ghi</div>'),
        cIsAtLastLine([0, 0], 6),
        Assertions.cAssertEq('Should be false on second line in paragraph', false)
      ])),
      Logger.t('Should return false at first paragraph in td', Chain.asStep(viewBlock, [
        cSetHtml('<table><tbody><tr><td><p>a</p><p>b</p></td></tr></tbody></table>'),
        cIsAtLastLine([0, 0, 0, 0, 0, 0], 0),
        Assertions.cAssertEq('Should be false since it is the first line in td', false)
      ])),
      Logger.t('Should return true at second paragraph in td', Chain.asStep(viewBlock, [
        cSetHtml('<table><tbody><tr><td><p>a</p><p>b</p></td></tr></tbody></table>'),
        cIsAtLastLine([0, 0, 0, 0, 1, 0], 0),
        Assertions.cAssertEq('Should be true since it is the second line in td', true)
      ]))
    ])),

    Logger.t('getAbovePositions', GeneralSteps.sequence([
      Logger.t('Should return zero positions since there is no line above', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cGetAbovePositions([0, 0], 1),
        cAssertCaretPositions([])
      ])),
      Logger.t('Should return three positions for the line above', Chain.asStep(viewBlock, [
        cSetHtml('<p>ab</p><p>a</p>'),
        cGetAbovePositions([1, 0], 0),
        cAssertCaretPositions([
          { path: [0, 0], offset: 0 },
          { path: [0, 0], offset: 1 },
          { path: [0, 0], offset: 2 }
        ])
      ])),
      Logger.t('Should return four positions for the line above2', Chain.asStep(viewBlock, [
        cSetHtml('<p>a<input>b</p><p>a</p>'),
        cGetAbovePositions([1, 0], 0),
        cAssertCaretPositions([
          { path: [0, 0], offset: 0 },
          { path: [0, 0], offset: 1 },
          { path: [0], offset: 1 },
          { path: [0], offset: 2 },
          { path: [0, 2], offset: 0 },
          { path: [0, 2], offset: 1 }
        ])
      ]))
    ])),

    Logger.t('getBelowPositions', GeneralSteps.sequence([
      Logger.t('Should return zero positions since there is no line below', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cGetBelowPositions([0, 0], 0),
        cAssertCaretPositions([])
      ])),
      Logger.t('Should return three positions for the line below', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p><p>ab</p>'),
        cGetBelowPositions([0, 0], 0),
        cAssertCaretPositions([
          { path: [1, 0], offset: 0 },
          { path: [1, 0], offset: 1 },
          { path: [1, 0], offset: 2 }
        ])
      ])),
      Logger.t('Should return five positions for the line below', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p><p>a<input>b</p>'),
        cGetBelowPositions([0, 0], 0),
        cAssertCaretPositions([
          { path: [1, 0], offset: 0 },
          { path: [1, 0], offset: 1 },
          { path: [1], offset: 1 },
          { path: [1], offset: 2 },
          { path: [1, 2], offset: 0 },
          { path: [1, 2], offset: 1 }
        ])
      ]))
    ])),

    Logger.t('findClosestHoriontalPosition (above)', GeneralSteps.sequence([
      Logger.t('Should not return a position since there is no above positions', Chain.asStep(viewBlock, [
        cSetHtml('<p>ab</p>'),
        cGetAbovePositions([0, 0], 0),
        cFindClosestHorizontalPosition([0, 0], 0),
        cAssertNone
      ])),
      Logger.t('Should return first caret position on the line above', Chain.asStep(viewBlock, [
        cSetHtml('<p>ab</p><p>cd</p>'),
        cGetAbovePositions([1, 0], 0),
        cFindClosestHorizontalPosition([1, 0], 0),
        cAssertCaretPosition([0, 0], 0)
      ])),
      Logger.t('Should return last caret position on the line above', Chain.asStep(viewBlock, [
        cSetHtml('<p>ab</p><p>cd</p>'),
        cGetAbovePositions([1, 0], 0),
        cFindClosestHorizontalPosition([1, 0], 2),
        cAssertCaretPosition([0, 0], 2)
      ])),
      Logger.t('Should return first indexed caret position on the line above', Chain.asStep(viewBlock, [
        cSetHtml('<p><input></p><p><input></p>'),
        cGetAbovePositions([1], 0),
        cFindClosestHorizontalPosition([1], 0),
        cAssertCaretPosition([0], 0)
      ])),
      Logger.t('Should return first indexed caret position on the line above', Chain.asStep(viewBlock, [
        cSetHtml('<p><input></p><p><input></p>'),
        cGetAbovePositions([1], 0),
        cFindClosestHorizontalPosition([1], 1),
        cAssertCaretPosition([0], 1)
      ])),
      Logger.t('Should return last text node position at the line above', Chain.asStep(viewBlock, [
        cSetHtml('<p>a<input>b</p><p>a<input>b</p>'),
        cGetAbovePositions([1, 2], 0),
        cFindClosestHorizontalPosition([1, 2], 0),
        cAssertCaretPosition([0, 2], 0)
      ]))
    ])),

    Logger.t('findClosestHoriontalPosition (below)', GeneralSteps.sequence([
      Logger.t('Should not return a position since there is no below positions', Chain.asStep(viewBlock, [
        cSetHtml('<p>ab</p>'),
        cGetBelowPositions([0, 0], 0),
        cFindClosestHorizontalPosition([0, 0], 0),
        cAssertNone
      ])),
      Logger.t('Should return first caret position on the line below', Chain.asStep(viewBlock, [
        cSetHtml('<p>ab</p><p>cd</p>'),
        cGetBelowPositions([0, 0], 0),
        cFindClosestHorizontalPosition([0, 0], 0),
        cAssertCaretPosition([1, 0], 0)
      ])),
      Logger.t('Should return last caret position on the line below', Chain.asStep(viewBlock, [
        cSetHtml('<p>ab</p><p>cd</p>'),
        cGetBelowPositions([0, 0], 0),
        cFindClosestHorizontalPosition([0, 0], 2),
        cAssertCaretPosition([1, 0], 2)
      ])),
      Logger.t('Should return first indexed caret position on the line below', Chain.asStep(viewBlock, [
        cSetHtml('<p><input></p><p><input></p>'),
        cGetBelowPositions([0], 0),
        cFindClosestHorizontalPosition([0], 0),
        cAssertCaretPosition([1], 0)
      ])),
      Logger.t('Should return first indexed caret position on the line below', Chain.asStep(viewBlock, [
        cSetHtml('<p><input></p><p><input></p>'),
        cGetBelowPositions([0], 0),
        cFindClosestHorizontalPosition([0], 1),
        cAssertCaretPosition([1], 1)
      ])),
      Logger.t('Should return first text node position at the line below', Chain.asStep(viewBlock, [
        cSetHtml('<p>a<input>b</p><p>a<input>b</p>'),
        cGetBelowPositions([0, 0], 0),
        cFindClosestHorizontalPosition([0, 0], 0),
        cAssertCaretPosition([1, 0], 0)
      ])),
      Logger.t('Should return last text node position at the line below', Chain.asStep(viewBlock, [
        cSetHtml('<p>a<input>b</p><p>a<input>b</p>'),
        cGetBelowPositions([0, 2], 0),
        cFindClosestHorizontalPosition([0, 2], 0),
        cAssertCaretPosition([1, 2], 0)
      ]))
    ]))
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});
