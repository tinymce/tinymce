/**
 * BlockSchema.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.blocks.BlockSchema',
  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Result'
  ],
  function (FieldSchema, ValueSchema, Fun, Result) {
    var ofType = function (expectedType) {
      return ValueSchema.valueOf(function (f) {
        var actualType = typeof f;
        return actualType === expectedType ? Result.value(f) : Result.error('incorrect type expected ' + expectedType + ' but got ' + actualType);
      });
    };

    var blockSchema = [
      FieldSchema.strictOf('id', ofType('string')),
      FieldSchema.defaulted('type', 'simple'),
      FieldSchema.strictOf('title', ofType('string')),
      FieldSchema.strictOf('icon', ofType('string')),
      FieldSchema.defaultedOf('toolbar', [], ValueSchema.arrOfObj([
        FieldSchema.defaulted('type', 'button'),
        FieldSchema.strictOf('icon', ofType('string')),
        FieldSchema.strictOf('tooltip', ofType('string')),
        FieldSchema.defaulted('selectorSelected', ''),
        FieldSchema.strictOf('action', ofType('function'))
      ])),
      FieldSchema.strictOf('insert', ofType('function')),
      FieldSchema.strictOf('remove', ofType('function')),
      FieldSchema.strictOf('load', ofType('function')),
      FieldSchema.strictOf('save', ofType('function'))
    ];

    var asStruct = function (obj) {
      return ValueSchema.asStructOrDie('Block struct', ValueSchema.objOf(blockSchema), obj);
    };

    return {
      asStruct: asStruct
    };
  }
);
