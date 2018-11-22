/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DomSerializer from '../../dom/DomSerializer';
import Schema from '../html/Schema';

/**
 * This class is used to serialize DOM trees into a string. Consult the TinyMCE Wiki API for
 * more details and examples on how to use this class.
 *
 * @class tinymce.dom.Serializer
 */

export default function (settings, editor?) {
  const domSerializer = DomSerializer(settings, editor);

  // Return public methods
  return {
    /**
     * Schema instance that was used to when the Serializer was constructed.
     *
     * @field {tinymce.html.Schema} schema
     */
    schema: domSerializer.schema as Schema,

    /**
     * Adds a node filter function to the parser used by the serializer, the parser will collect the specified nodes by name
     * and then execute the callback ones it has finished parsing the document.
     *
     * @example
     * parser.addNodeFilter('p,h1', function(nodes, name) {
     *  for (var i = 0; i < nodes.length; i++) {
     *   console.log(nodes[i].name);
     *  }
     * });
     * @method addNodeFilter
     * @method {String} name Comma separated list of nodes to collect.
     * @param {function} callback Callback function to execute once it has collected nodes.
     */
    addNodeFilter: domSerializer.addNodeFilter,

    /**
     * Adds a attribute filter function to the parser used by the serializer, the parser will
     * collect nodes that has the specified attributes
     * and then execute the callback ones it has finished parsing the document.
     *
     * @example
     * parser.addAttributeFilter('src,href', function(nodes, name) {
     *  for (var i = 0; i < nodes.length; i++) {
     *   console.log(nodes[i].name);
     *  }
     * });
     * @method addAttributeFilter
     * @method {String} name Comma separated list of nodes to collect.
     * @param {function} callback Callback function to execute once it has collected nodes.
     */
    addAttributeFilter: domSerializer.addAttributeFilter,

    /**
     * Serializes the specified browser DOM node into a HTML string.
     *
     * @method serialize
     * @param {DOMNode} node DOM node to serialize.
     * @param {Object} args Arguments option that gets passed to event handlers.
     */
    serialize: domSerializer.serialize,

    /**
     * Adds valid elements rules to the serializers schema instance this enables you to specify things
     * like what elements should be outputted and what attributes specific elements might have.
     * Consult the Wiki for more details on this format.
     *
     * @method addRules
     * @param {String} rules Valid elements rules string to add to schema.
     */
    addRules: domSerializer.addRules,

    /**
     * Sets the valid elements rules to the serializers schema instance this enables you to specify things
     * like what elements should be outputted and what attributes specific elements might have.
     * Consult the Wiki for more details on this format.
     *
     * @method setRules
     * @param {String} rules Valid elements rules string.
     */
    setRules: domSerializer.setRules,

    /**
     * Adds a temporary internal attribute these attributes will get removed on undo and
     * when getting contents out of the editor.
     *
     * @method addTempAttr
     * @param {String} name string
     */
    addTempAttr: domSerializer.addTempAttr,

    /**
     * Returns an array of all added temp attrs names.
     *
     * @method getTempAttrs
     * @return {String[]} Array with attribute names.
     */
    getTempAttrs: domSerializer.getTempAttrs
  };
}