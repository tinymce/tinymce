/**
 * Blocks.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.blocks.api.Blocks',
  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'tinymce.core.blocks.BlockSchema',
    'tinymce.core.blocks.InsertBlock'
  ],
  function (Fun, Option, BlockSchema, InsertBlock) {
    return function (editor) {
      var blocks = { };

      var register = function (id, spec) {
        blocks[id] = BlockSchema.asStruct(spec);
      };

      var insert = function (id) {
        return get(id).map(Fun.curry(InsertBlock.insert, editor)).getOr(false);
      };

      var canInsert = function (id) {
        return get(id).map(Fun.curry(InsertBlock.canInsert, editor)).getOr(false);
      };

      var get = function (id) {
        return Option.from(blocks[id]);
      };

      var getAll = function () {
        return blocks;
      };

      return {
        register: register,
        insert: insert,
        canInsert: canInsert,
        getAll: getAll
      };
    };
  }
);
