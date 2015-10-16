/**
 * WindowManager.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles the creation of native windows and dialogs. This class can be extended to provide for example inline dialogs.
 *
 * @class tinymce.WindowManager
 * @example
 * // Opens a new dialog with the file.htm file and the size 320x240
 * // It also adds a custom parameter this can be retrieved by using tinyMCEPopup.getWindowArg inside the dialog.
 * tinymce.activeEditor.windowManager.open({
 *    url: 'file.htm',
 *    width: 320,
 *    height: 240
 * }, {
 *    custom_param: 1
 * });
 *
 * // Displays an alert box using the active editors window manager instance
 * tinymce.activeEditor.windowManager.alert('Hello world!');
 *
 * // Displays an confirm box and an alert message will be displayed depending on what you choose in the confirm
 * tinymce.activeEditor.windowManager.confirm("Do you want to do something", function(s) {
 *    if (s)
 *       tinymce.activeEditor.windowManager.alert("Ok");
 *    else
 *       tinymce.activeEditor.windowManager.alert("Cancel");
 * });
 */
define("tinymce/NotificationManager", [
	"tinymce/ui/Notification"
], function(Notification) {
	return function(editor) {
		var self = this, notifications = [];

		function getLastNotification() {
			if (notifications.length) {
				return notifications[notifications.length - 1];
			}
		}

		self.notifications = notifications;

		function positionNotifications() {
			if (notifications.length > 0) {
				var firstItem = notifications.slice(0, 1)[0];
				firstItem.moveRel(editor.getContentAreaContainer(), 'tc-tc');
				if (notifications.length > 1) {
					for (var i = 1; i < notifications.length; i++) {
						notifications[i].moveRel(notifications[i - 1].getEl(), 'bc-tc');
					}
				}
			}
		}

		editor.on('remove', function() {
			var i = notifications.length;

			while (i--) {
				notifications[i].close();
			}
		});

		editor.on('ResizeEditor ResizeWindow', positionNotifications);

		/**
		 * Opens a new notification.
		 *
		 * @method open
		 * @param {Object} args Optional name/value settings collection contains things like width/height/url etc.
		 */
		self.open = function(args, params) {
			var notif;

			editor.editorManager.setActive(editor);

			notif = new Notification(args);
			notifications.push(notif);

			//If we have a timeout value
			if (args.timeout > 0) {
				notif.timer = setTimeout(function() {
					notif.close();
				}, args.timeout);
			}

			notif.on('close', function() {
				var i = notifications.length;

				if (notif.timer) {
					editor.getWin().clearTimeout(notif.timer);
				}

				while (i--) {
					if (notifications[i] === notif) {
						notifications.splice(i, 1);
					}
				}

				positionNotifications();
			});

			// store args and parameters
			notif.features = args || {};
			notif.params = params || {};

			notif.renderTo();

			positionNotifications();

			return notif;
		};



		/**
		 * Closes the top most window.
		 *
		 * @method close
		 */
		self.close = function() {
			if (getLastNotification()) {
				getLastNotification().close();
			}
		};

		/**
		 * Returns the currently opened window objects.
		 *
		 * @method getWindows
		 * @return {Array} Array of the currently opened windows.
		 */
		self.getNotifications = function() {
			return notifications;
		};
	};
});
