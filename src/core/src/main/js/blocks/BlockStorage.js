/**
 * BlockStorage.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.blocks.BlockStorage',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Id',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'tinymce.core.blocks.api.Block',
    'tinymce.core.blocks.BlockDom'
  ],
  function (Arr, Fun, Id, Option, Insert, Remove, Element, Attr, Block, BlockDom) {
    var loadBlocks = function (editor, element) {
      Arr.map(BlockDom.findBlocks(element), function (block) {
        BlockDom.getSpec(editor, block).map(function (spec) {
          var uuid = Id.generate('block');
          Attr.set(block, 'data-mce-block-id', uuid);
          var api = Block.nu(editor, uuid, spec);
          var newElement = spec.load()(api);
          Option.from(newElement)
            .map(function (element) {
              return Element.fromDom(element.cloneNode(true));
            })
            .map(function (element) {
              Attr.set(element, 'data-mce-block-id', uuid);
              Attr.set(element, 'contenteditable', 'false');
              BlockDom.paddContentEditables(element);
              Insert.before(block, element);
              Remove.remove(block);
            });
        });
      });
    };

    var saveBlocks = function (editor, element) {
      Arr.map(BlockDom.findBlocks(element), function (block) {
        BlockDom.getSpec(editor, block).map(function (spec) {
          var api = Block.nu(editor, BlockDom.getUuid(block), spec);
          var newElement = spec.save()(api);
          Option.from(newElement)
            .map(function (element) {
              return Element.fromDom(element.cloneNode(true));
            })
            .map(function (element) {
              BlockDom.removeInternalAttrs(element);
              Insert.before(block, element);
              Remove.remove(block);
            });
        });
      });
    };

    var setup = function (editor) {
      editor.on('SetContent', function (e) {
        loadBlocks(editor, Element.fromDom(editor.getBody()));
      });

      editor.on('PreProcess', function (e) {
        saveBlocks(editor, Element.fromDom(e.node));
      });
    };

    return {
      setup: setup
    };
  }
);
