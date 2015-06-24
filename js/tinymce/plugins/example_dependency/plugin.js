/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*jshint unused:false */
/*global tinymce:true */

/**
 * Register the plugin, specifying the list of the plugins that this plugin depends on.  They are specified in a list,
 * with the list loaded in order. plugins in this list will be initialised when this plugin is initialized. (before the
 * init method is called). plugins in a depends list should typically be specified using the short name). If necessary
 * this can be done with an object which has the url to the plugin and the shortname.
 */
tinymce.PluginManager.add('example_dependency', function() {
	// Example logic here
}, ['example']);
