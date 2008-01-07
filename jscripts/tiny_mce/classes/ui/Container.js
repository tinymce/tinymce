/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

/**#@+
 * @class This class is the base class for all container controls like toolbars. This class should not
 * be instantiated directly other container controls should inherit from this one.
 * @member tinymce.ui.Container
 * @base tinymce.ui.Control
 */
tinymce.create('tinymce.ui.Container:tinymce.ui.Control', {
	/**
	 * Base contrustor a new container control instance.
	 *
	 * @param {String} id Control id to use for the container.
	 * @param {Object} s Optional name/value settings object.
	 */
	Container : function(id, s) {
		this.parent(id, s);
		this.controls = [];
		this.lookup = {};
	},

	/**#@+
	 * @method
	 */

	/**
	 * Adds a control to the collection of controls for the container.
	 *
	 * @param {tinymce.ui.Control} c Control instance to add to the container.
	 * @return {tinymce.ui.Control} Same control instance that got passed in.
	 */
	add : function(c) {
		this.lookup[c.id] = c;
		this.controls.push(c);

		return c;
	},

	/**
	 * Returns a control by id from the containers collection.
	 *
	 * @param {String} n Id for the control to retrive.
	 * @return {tinymce.ui.Control} Control instance by the specified name or undefined if it wasn't found.
	 */
	get : function(n) {
		return this.lookup[n];
	}

	/**#@-*/
});

