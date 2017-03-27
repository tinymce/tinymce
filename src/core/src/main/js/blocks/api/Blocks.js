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
    'tinymce.core.blocks.BlockDom',
    'tinymce.core.blocks.BlockPlaceholders',
    'tinymce.core.blocks.BlockSchema',
    'tinymce.core.blocks.BlockStorage',
    'tinymce.core.blocks.InsertBlock'
  ],
  function (Fun, Merger, Obj, Option, Element, Block, BlockDom, BlockPlaceholders, BlockSchema, BlockStorage, InsertBlock) {
    return function (editor) {
      var blocks = { };

      var loadSaveNoop = function (api) {
        return api.dom();
      };

      var register = function (id, spec) {
        blocks[id] = BlockSchema.asStruct(Merger.merge({
          id: id,
          save: loadSaveNoop,
          load: loadSaveNoop,
          remove: Fun.noop
        }, spec));
      };

      var insert = function (id) {
        return Option.from(get(id)).map(Fun.curry(InsertBlock.insert, editor)).getOr(false);
      };

      var canInsert = function (id) {
        return Option.from(get(id)).map(Fun.curry(InsertBlock.canInsert, editor)).getOr(false);
      };

      var get = function (id) {
        return blocks.hasOwnProperty(id) ? blocks[id] : null;
      };

      var getAll = function () {
        return Obj.mapToArray(blocks, function (spec, key) {
          return spec;
        });
      };

      var createApi = function (element, spec) {
        var rootElement = Element.fromDom(editor.getBody());

        return Option
          .from(element)
          .map(Element.fromDom)
          .bind(function (element) {
            return BlockDom.findParentBlock(rootElement, element);
          })
          .map(function (element) {
            return Block.nu(editor, BlockDom.getUuid(element), spec);
          }).getOr(null);
      };

      var setup = function (editor) {
        BlockStorage.setup(editor);
        BlockPlaceholders.setup(editor);
      };

      setup(editor);

      return {
        register: register,
        insert: insert,
        canInsert: canInsert,
        get: get,
        getAll: getAll,
        createApi: createApi
      };
    };
  }
);
