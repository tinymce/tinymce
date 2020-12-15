import { Num, Optional } from '@ephox/katamari';

export interface MatrixNavigationOutcome<A> {
  readonly rowIndex: number;
  readonly columnIndex: number;
  readonly cell: A;
}

export type MatrixNavigationFunc<A> = (matrix: A[][], startRow: number, startCol: number) => Optional<MatrixNavigationOutcome<A>>;

const toCell = <A>(matrix: A[][], rowIndex: number, columnIndex: number): Optional<MatrixNavigationOutcome<A>> => Optional.from(matrix[rowIndex]).bind((row) => Optional.from(row[columnIndex]).map((cell) => ({
  rowIndex,
  columnIndex,
  cell
})));

const cycleHorizontal = <A>(matrix: A[][], rowIndex: number, startCol: number, deltaCol: number) => {
  const row = matrix[rowIndex];
  const colsInRow = row.length;
  const newColIndex = Num.cycleBy(startCol, deltaCol, 0, colsInRow - 1);
  return toCell(matrix, rowIndex, newColIndex);
};

const cycleVertical = <A>(matrix: A[][], colIndex: number, startRow: number, deltaRow: number) => {
  const nextRowIndex = Num.cycleBy(startRow, deltaRow, 0, matrix.length - 1);
  const colsInNextRow = matrix[nextRowIndex].length;
  const nextColIndex = Num.clamp(colIndex, 0, colsInNextRow - 1);
  return toCell(matrix, nextRowIndex, nextColIndex);
};

const moveHorizontal = <A>(matrix: A[][], rowIndex: number, startCol: number, deltaCol: number) => {
  const row = matrix[rowIndex];
  const colsInRow = row.length;
  const newColIndex = Num.clamp(startCol + deltaCol, 0, colsInRow - 1);
  return toCell(matrix, rowIndex, newColIndex);
};

const moveVertical = <A>(matrix: A[][], colIndex: number, startRow: number, deltaRow: number) => {
  const nextRowIndex = Num.clamp(startRow + deltaRow, 0, matrix.length - 1);
  const colsInNextRow = matrix[nextRowIndex].length;
  const nextColIndex = Num.clamp(colIndex, 0, colsInNextRow - 1);
  return toCell(matrix, nextRowIndex, nextColIndex);
};

// return address(Math.floor(index / columns), index % columns);
const cycleRight = <A>(matrix: A[][], startRow: number, startCol: number): Optional<MatrixNavigationOutcome<A>> =>
  cycleHorizontal(matrix, startRow, startCol, +1);

const cycleLeft = <A>(matrix: A[][], startRow: number, startCol: number): Optional<MatrixNavigationOutcome<A>> =>
  cycleHorizontal(matrix, startRow, startCol, -1);

const cycleUp = <A>(matrix: A[][], startRow: number, startCol: number): Optional<MatrixNavigationOutcome<A>> =>
  cycleVertical(matrix, startCol, startRow, -1);

const cycleDown = <A>(matrix: A[][], startRow: number, startCol: number): Optional<MatrixNavigationOutcome<A>> =>
  cycleVertical(matrix, startCol, startRow, +1);

const moveLeft = <A>(matrix: A[][], startRow: number, startCol: number): Optional<MatrixNavigationOutcome<A>> =>
  moveHorizontal(matrix, startRow, startCol, -1);

const moveRight = <A>(matrix: A[][], startRow: number, startCol: number): Optional<MatrixNavigationOutcome<A>> =>
  moveHorizontal(matrix, startRow, startCol, +1);

const moveUp = <A>(matrix: A[][], startRow: number, startCol: number): Optional<MatrixNavigationOutcome<A>> =>
  moveVertical(matrix, startCol, startRow, -1);

const moveDown = <A>(matrix: A[][], startRow: number, startCol: number): Optional<MatrixNavigationOutcome<A>> =>
  moveVertical(matrix, startCol, startRow, +1);

export {
  cycleRight,
  cycleLeft,
  cycleUp,
  cycleDown,

  moveLeft,
  moveRight,
  moveUp,
  moveDown
};
