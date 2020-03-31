import { Fun, Num, Option } from '@ephox/katamari';

export type WrapArrNavigationOutcome = { row: () => number; column: () => number};
export type ArrNavigationFunc<A> = (values: A[], index: number, numRows: number, numCols: number) => Option<A>;

const withGrid = <A>(values: A[], index: number, numCols: number, f: (oldRow: number, oldColumn: number) => Option<WrapArrNavigationOutcome>): Option<A> => {
  const oldRow = Math.floor(index / numCols);
  const oldColumn = index % numCols;

  return f(oldRow, oldColumn).bind((address) => {
    const newIndex = address.row() * numCols + address.column();
    return newIndex >= 0 && newIndex < values.length ? Option.some(values[newIndex]) : Option.none();
  });
};

const cycleHorizontal = <A>(values: A[], index: number, numRows: number, numCols: number, delta: number) => withGrid(values, index, numCols, (oldRow, oldColumn) => {
  const onLastRow = oldRow === numRows - 1;
  const colsInRow = onLastRow ? values.length - (oldRow * numCols) : numCols;
  const newColumn = Num.cycleBy(oldColumn, delta, 0, colsInRow - 1);
  return Option.some({
    row: Fun.constant(oldRow),
    column: Fun.constant(newColumn)
  });
});

const cycleVertical = <A>(values: A[], index: number, numRows: number, numCols: number, delta: number) => withGrid(values, index, numCols, (oldRow, oldColumn) => {
  const newRow = Num.cycleBy(oldRow, delta, 0, numRows - 1);
  const onLastRow = newRow === numRows - 1;
  const colsInRow = onLastRow ? values.length - (newRow * numCols) : numCols;
  const newCol = Num.clamp(oldColumn, 0, colsInRow - 1);
  return Option.some({
    row: Fun.constant(newRow),
    column: Fun.constant(newCol)
  });
});

const cycleRight = <A>(values: A[], index: number, numRows: number, numCols: number) => cycleHorizontal(values, index, numRows, numCols, +1);

const cycleLeft = <A>(values: A[], index: number, numRows: number, numCols: number) => cycleHorizontal(values, index, numRows, numCols, -1);

const cycleUp = <A>(values: A[], index: number, numRows: number, numCols: number) => cycleVertical(values, index, numRows, numCols, -1);

const cycleDown = <A>(values: A[], index: number, numRows: number, numCols: number) => cycleVertical(values, index, numRows, numCols, +1);

export {
  cycleDown,
  cycleUp,
  cycleLeft,
  cycleRight
};
