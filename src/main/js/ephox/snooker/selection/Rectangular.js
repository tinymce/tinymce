define(
  'ephox.snooker.selection.Rectangular',

  [

  ],

  function () {

    // Given a table, startCell and an endCell, we need to figure out if the range spanning across
    // cells is a rectangular selection or not.
    // To do so:
    // 1. Find the position of the cells within the table:
    //      a.  Transform the table into a matrix of positions [ [ 'a', 'a', 'a' ] ]
    //      b.  Find how many rows there are before of getting to that cell
    //      c.  Find how many cols there are before of getting to that cell
    //      d.  Find by how much the cell spans in rows/cols
    //          i.  Look left to the cell and count how many times the cell is repeated: colspan
    //          ii. Look down to the cell and count how many times the cell is repeated: rowspan
    // 2. Find the coordinates of the rectangle 'drawn' by the selection
    // 3. Start looking from the beginning of the table of all the cells, checking if
    //      a.  The cell is completely outside of the selection
    //      b.  The cell is completely inside the selection rectangle
    //      c.  The cell is partially inside the selection rectangle





    var isRectangular = function (table, startCell, endCell) {

    };

    return {
      isRectangular: isRectangular
    };
  }
);