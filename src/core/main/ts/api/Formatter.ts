/**
 * Formatter.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Cell, Fun } from '@ephox/katamari';
import ApplyFormat from '../fmt/ApplyFormat';
import * as CaretFormat from '../fmt/CaretFormat';
import FormatChanged from '../fmt/FormatChanged';
import FormatRegistry from '../fmt/FormatRegistry';
import MatchFormat from '../fmt/MatchFormat';
import Preview from '../fmt/Preview';
import RemoveFormat from '../fmt/RemoveFormat';
import ToggleFormat from '../fmt/ToggleFormat';
import FormatShortcuts from '../keyboard/FormatShortcuts';

/**
 * Text formatter engine class. This class is used to apply formats like bold, italic, font size
 * etc to the current selection or specific nodes. This engine was built to replace the browser's
 * default formatting logic for execCommand due to its inconsistent and buggy behavior.
 *
 * @class tinymce.Formatter
 * @example
 *  tinymce.activeEditor.formatter.register('mycustomformat', {
 *    inline: 'span',
 *    styles: {color: '#ff0000'}
 *  });
 *
 *  tinymce.activeEditor.formatter.apply('mycustomformat');
 */

export default function (editor) {
  const formats = FormatRegistry(editor);
  const formatChangeState = Cell(null);

  FormatShortcuts.setup(editor);
  CaretFormat.setup(editor);

  return {
    /**
     * Returns the format by name or all formats if no name is specified.
     *
     * @method get
     * @param {String} name Optional name to retrieve by.
     * @return {Array/Object} Array/Object with all registered formats or a specific format.
     */
    get: formats.get,

    /**
     * Registers a specific format by name.
     *
     * @method register
     * @param {Object/String} name Name of the format for example "bold".
     * @param {Object/Array} format Optional format object or array of format variants
     * can only be omitted if the first arg is an object.
     */
    register: formats.register,

    /**
     * Unregister a specific format by name.
     *
     * @method unregister
     * @param {String} name Name of the format for example "bold".
     */
    unregister: formats.unregister,

    /**
     * Applies the specified format to the current selection or specified node.
     *
     * @method apply
     * @param {String} name Name of format to apply.
     * @param {Object} vars Optional list of variables to replace within format before applying it.
     * @param {Node} node Optional node to apply the format to defaults to current selection.
     */
    apply: Fun.curry(ApplyFormat.applyFormat, editor),

    /**
     * Removes the specified format from the current selection or specified node.
     *
     * @method remove
     * @param {String} name Name of format to remove.
     * @param {Object} vars Optional list of variables to replace within format before removing it.
     * @param {Node/Range} node Optional node or DOM range to remove the format from defaults to current selection.
     */
    remove: Fun.curry(RemoveFormat.remove, editor),

    /**
     * Toggles the specified format on/off.
     *
     * @method toggle
     * @param {String} name Name of format to apply/remove.
     * @param {Object} vars Optional list of variables to replace within format before applying/removing it.
     * @param {Node} node Optional node to apply the format to or remove from. Defaults to current selection.
     */
    toggle: Fun.curry(ToggleFormat.toggle, editor, formats),

    /**
     * Matches the current selection or specified node against the specified format name.
     *
     * @method match
     * @param {String} name Name of format to match.
     * @param {Object} vars Optional list of variables to replace before checking it.
     * @param {Node} node Optional node to check.
     * @return {boolean} true/false if the specified selection/node matches the format.
     */
    match: Fun.curry(MatchFormat.match, editor),

    /**
     * Matches the current selection against the array of formats and returns a new array with matching formats.
     *
     * @method matchAll
     * @param {Array} names Name of format to match.
     * @param {Object} vars Optional list of variables to replace before checking it.
     * @return {Array} Array with matched formats.
     */
    matchAll: Fun.curry(MatchFormat.matchAll, editor),

    /**
     * Return true/false if the specified node has the specified format.
     *
     * @method matchNode
     * @param {Node} node Node to check the format on.
     * @param {String} name Format name to check.
     * @param {Object} vars Optional list of variables to replace before checking it.
     * @param {Boolean} similar Match format that has similar properties.
     * @return {Object} Returns the format object it matches or undefined if it doesn't match.
     */
    matchNode: Fun.curry(MatchFormat.matchNode, editor),

    /**
     * Returns true/false if the specified format can be applied to the current selection or not. It
     * will currently only check the state for selector formats, it returns true on all other format types.
     *
     * @method canApply
     * @param {String} name Name of format to check.
     * @return {boolean} true/false if the specified format can be applied to the current selection/node.
     */
    canApply: Fun.curry(MatchFormat.canApply, editor),

    /**
     * Executes the specified callback when the current selection matches the formats or not.
     *
     * @method formatChanged
     * @param {String} formats Comma separated list of formats to check for.
     * @param {function} callback Callback with state and args when the format is changed/toggled on/off.
     * @param {Boolean} similar True/false state if the match should handle similar or exact formats.
     */
    formatChanged: Fun.curry(FormatChanged.formatChanged, editor, formatChangeState),

    /**
     * Returns a preview css text for the specified format.
     *
     * @method getCssText
     * @param {String/Object} format Format to generate preview css text for.
     * @return {String} Css text for the specified format.
     * @example
     * var cssText1 = editor.formatter.getCssText('bold');
     * var cssText2 = editor.formatter.getCssText({inline: 'b'});
     */
    getCssText: Fun.curry(Preview.getCssText, editor)
  };
}