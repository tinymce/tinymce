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
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element',
    'tinymce.core.blocks.api.Block',
    'tinymce.core.blocks.BlockSchema',
    'tinymce.core.blocks.BlockUtils',
    'tinymce.core.blocks.InsertBlock'
  ],
  function (Fun, Merger, Obj, Option, Element, Block, BlockSchema, BlockUtils, InsertBlock) {
    return function (editor) {
      var blocks = { };

      var register = function (id, spec) {
        blocks[id] = BlockSchema.asStruct(Merger.merge({ id: id }, spec));
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
        return Obj.mapToArray(blocks, function (spec, key) {
          return spec;
        });
      };

      var createApi = function (element, spec) {
        return Option.from(element).map(function (element) {
          return Block.nu(editor, BlockUtils.getUuid(Element.fromDom(element)), spec);
        }).getOr(null);
      };

      return {
        register: register,
        insert: insert,
        canInsert: canInsert,
        getAll: getAll,
        createApi: createApi
      };
    };
  }
);
