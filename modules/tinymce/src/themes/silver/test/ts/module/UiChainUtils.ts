import { Chain, Guard, Mouse, UiFinder } from '@ephox/agar';
import { Arr, Result } from '@ephox/katamari';

const cCountNumber = (selector) => Chain.fromChains([
  UiFinder.cFindAllIn(selector),
  Chain.mapper((ts) => ts.length)
]);

const cExtractOnlyOne = (selector) => Chain.fromChains([
  UiFinder.cFindAllIn(selector),
  Chain.binder((ts) => ts.length === 1 ? Result.value(ts[0]) : Result.error('Did not find exactly 1 of ' +
    selector + '. Found: ' + ts.length))
]);

const cResizeToPos = (sx: number, sy: number, dx: number, dy: number, delta: number = 10) => {
  // Simulate moving the mouse, by making a number of movements
  const numMoves = sy === dy ? Math.abs(dx - sx) / delta : Math.abs(dy - sy) / delta;
  // Determine the deltas based on the number of moves to make
  const deltaX = (dx - sx) / numMoves;
  const deltaY = (dy - sy) / numMoves;
  // Move and release the mouse
  return Chain.control(
    Chain.fromChains([
        UiFinder.cFindIn('.tox-blocker'),
        Mouse.cMouseMoveTo(sx, sy)
      ].concat(
      Arr.range(numMoves, (count) => {
        const nx = sx + count * deltaX;
        const ny = sy + count * deltaY;
        return Mouse.cMouseMoveTo(nx, ny);
      })
      ).concat([
        Mouse.cMouseMoveTo(dx, dy),
        Mouse.cMouseUp
      ])
    ),
    Guard.addLogging(`Resizing from (${sx}, ${sy}) to (${dx}, ${dy})`)
  );
};

export {
  cCountNumber,
  cExtractOnlyOne,
  cResizeToPos
};
