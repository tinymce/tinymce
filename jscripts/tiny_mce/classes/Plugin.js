/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

/**#@+
 * @class Plugin base class, all plugins should extend this class.
 * @member tinymce.Plugin
 */
tinymce.create('tinymce.Plugin', {
	/**
	 * Constructor for the plugin.
	 *
	 * @constructor
	 * @param {tinymce.Editor} e Editor instance that created the plugin instance.
	 * @param {String} u Absolute URL where the plugin is located.
	 */
	Plugin : function(e, u) {
	}

	/**#@-*/
});
