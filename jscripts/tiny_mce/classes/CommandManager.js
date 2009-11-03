/**
 * TinyMCE - ContentManager class.
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	function CommandManager() {
		var execCommands = {}, queryStateCommands = {}, queryValueCommands = {};

		function add(collection, cmd, func, scope) {
			if (typeof(cmd) == 'string')
				cmd = [cmd];

			tinymce.each(cmd, function(cmd) {
				collection[cmd.toLowerCase()] = {func : func, scope : scope};
			});
		};

		tinymce.extend(this, {
			add : function(cmd, func, scope) {
				add(execCommands, cmd, func, scope);
			},

			addQueryStateHandler : function(cmd, func, scope) {
				add(queryStateCommands, cmd, func, scope);
			},

			addQueryValueHandler : function(cmd, func, scope) {
				add(queryValueCommands, cmd, func, scope);
			},

			execCommand : function(scope, cmd, ui, value, args) {
				if (cmd = execCommands[cmd.toLowerCase()]) {
					if (cmd.func.call(scope || cmd.scope, ui, value, args) !== false)
						return true;
				}
			},

			queryCommandValue : function() {
				if (cmd = queryValueCommands[cmd.toLowerCase()])
					return cmd.func.call(scope || cmd.scope, ui, value, args);
			},

			queryCommandState : function() {
				if (cmd = queryStateCommands[cmd.toLowerCase()])
					return cmd.func.call(scope || cmd.scope, ui, value, args);
			}
		});
	};

	tinymce.GlobalCommands = new CommandManager();
})(tinymce);