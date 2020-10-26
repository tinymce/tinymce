/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell, Fun } from '@ephox/katamari';
import * as CaretFormat from '../fmt/CaretFormat';
import * as FormatChanged from '../fmt/FormatChanged';
import { FormatRegistry } from '../fmt/FormatRegistry';
import { Format, FormatVars } from '../fmt/FormatTypes';
import * as Preview from '../fmt/Preview';
import * as FormatShortcuts from '../keyboard/FormatShortcuts';
import * as Rtc from '../Rtc';
import { RangeLikeObject } from '../selection/RangeTypes';
import Editor from './Editor';

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

interface Formatter extends FormatRegistry {
  apply (name: string, vars?: FormatVars, node?: Node | RangeLikeObject): void;
  remove (name: string, vars?: FormatVars, node?: Node | Range, similar?: boolean): void;
  toggle (name: string, vars?: FormatVars, node?: Node): void;
  match (name: string, vars?: FormatVars, node?: Node): boolean;
  closest (names): string | null;
  matchAll (names: string[], vars?: FormatVars): string[];
  matchNode (node: Node, name: string, vars?: FormatVars, similar?: boolean): boolean;
  canApply (name: string): boolean;
  formatChanged (names: string, callback: FormatChanged.FormatChangeCallback, similar?: boolean): { unbind: () => void };
  getCssText (format: string | Format): string;
}

const Formatter = function (editor: Editor): Formatter {
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
     * Returns true or false if a format is registered for the specified name.
     *
     * @method has
     * @param {String} name Format name to check if a format exists.
     * @return {boolean} True/False if a format for the specified name exists.
     */
    has: formats.has,

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
    apply: (name, vars?, node?) => {
      Rtc.applyFormat(editor, name, vars, node);
    },

    /**
     * Removes the specified format from the current selection or specified node.
     *
     * @method remove
     * @param {String} name Name of format to remove.
     * @param {Object} vars Optional list of variables to replace within format before removing it.
     * @param {Node/Range} node Optional node or DOM range to remove the format from defaults to current selection.
     */
    remove: (name, vars?, node?, similar?) => {
      Rtc.removeFormat(editor, name, vars, node, similar);
    },

    /**
     * Toggles the specified format on/off.
     *
     * @method toggle
     * @param {String} name Name of format to apply/remove.
     * @param {Object} vars Optional list of variables to replace within format before applying/removing it.
     * @param {Node} node Optional node to apply the format to or remove from. Defaults to current selection.
     */
    toggle: (name, vars?, node?) => {
      Rtc.toggleFormat(editor, name, vars, node);
    },

    /**
     * Matches the current selection or specified node against the specified format name.
     *
     * @method match
     * @param {String} name Name of format to match.
     * @param {Object} vars Optional list of variables to replace before checking it.
     * @param {Node} node Optional node to check.
     * @return {boolean} true/false if the specified selection/node matches the format.
     */
    match: (name, vars?, node?) => Rtc.matchFormat(editor, name, vars, node),

    /**
     * Finds the closest matching format from a set of formats for the current selection.
     * <br>
     * <em>Added in TinyMCE 5.6</em>
     *
     * @method closest
     * @param {Array} names Format names to check for.
     * @return {String} The closest matching format name or null.
     */
    closest: (names) => Rtc.closestFormat(editor, names),

    /**
     * Matches the current selection against the array of formats and returns a new array with matching formats.
     *
     * @method matchAll
     * @param {Array} names Name of format to match.
     * @param {Object} vars Optional list of variables to replace before checking it.
     * @return {Array} Array with matched formats.
     */
    matchAll: (names, vars?) => Rtc.matchAllFormats(editor, names, vars),

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
    matchNode: (node, names, vars?, similar?) => Rtc.matchNodeFormat(editor, node, names, vars, similar),

    /**
     * Returns true/false if the specified format can be applied to the current selection or not. It
     * will currently only check the state for selector formats, it returns true on all other format types.
     *
     * @method canApply
     * @param {String} name Name of format to check.
     * @return {boolean} true/false if the specified format can be applied to the current selection/node.
     */
    canApply: (name) => Rtc.canApplyFormat(editor, name),

    /**
     * Executes the specified callback when the current selection matches the formats or not.
     *
     * @method formatChanged
     * @param {String} formats Comma separated list of formats to check for.
     * @param {function} callback Callback with state and args when the format is changed/toggled on/off.
     * @param {Boolean} similar True/false state if the match should handle similar or exact formats.
     */
    formatChanged: (formats: string, callback: FormatChanged.FormatChangeCallback, similar?: boolean) => Rtc.formatChanged(editor, formatChangeState, formats, callback, similar),

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
};

export default Formatter;
