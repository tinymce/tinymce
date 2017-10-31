/**
 * TableGridSize.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.table.queries.TableGridSize',
  [
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse'
  ],
  function (DetailsList, Warehouse) {
    var getGridSize = function (table) {
      var input = DetailsList.fromTable(table);
      var warehouse = Warehouse.generate(input);
      return warehouse.grid();
    };

    return {
      getGridSize: getGridSize
    };
  }
);
