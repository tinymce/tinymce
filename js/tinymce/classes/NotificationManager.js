/**
 * NotificationManager.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles the creation of TinyMCE's notifications.
 *
 * @class tinymce.notificationManager
 * @example
 * // Opens a new notification of type "error" with text "An error occurred."
 * tinymce.activeEditor.notificationManager.open({
 *    text: 'An error occurred.',
 *    type: 'error'
 * });
 */
define("tinymce/NotificationManager", [
	"tinymce/ui/Notification",
	"tinymce/util/Delay",
	"tinymce/util/Tools"
], function(Notification, Delay, Tools) {
	return function(editor) {
		var self = this, notifications = [];

		function getLastNotification() {
			if (notifications.length) {
				return notifications[notifications.length - 1];
			}
		}

		self.notifications = notifications;

		function resizeWindowEvent() {
			Delay.requestAnimationFrame(function() {
				prePositionNotifications();
				positionNotifications();
			});
		}

		// Since the viewport will change based on the present notifications, we need to move them all to the
		// top left of the viewport to give an accurate size measurement so we can position them later.
		function prePositionNotifications() {
			for (var i = 0; i < notifications.length; i++) {
				notifications[i].moveTo(0, 0);
			}
		}

		function positionNotifications() {
			if (notifications.length > 0) {
				var firstItem = notifications.slice(0, 1)[0];
				var container = editor.inline ? editor.getElement() : editor.getContentAreaContainer();
				firstItem.moveRel(container, 'tc-tc');
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

		editor.on('ResizeEditor', positionNotifications);
		editor.on('ResizeWindow', resizeWindowEvent);

		/**
		 * Opens a new notification.
		 *
		 * @method open
		 * @param {Object} args Optional name/value settings collection contains things like timeout/color/message etc.
		 */
		self.open = function(args) {
			// Never open notification if editor has been removed.
			if (editor.removed) {
				return;
			}

			var notif;

			editor.editorManager.setActive(editor);

			var duplicate = findDuplicateMessage(notifications, args);

			if (duplicate === null) {
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

				notif.renderTo();

				positionNotifications();
			} else {
				notif = duplicate;
			}

			return notif;
		};

		/**
		 * Closes the top most notification.
		 *
		 * @method close
		 */
		self.close = function() {
			if (getLastNotification()) {
				getLastNotification().close();
			}
		};

		/**
		 * Returns the currently opened notification objects.
		 *
		 * @method getNotifications
		 * @return {Array} Array of the currently opened notifications.
		 */
		self.getNotifications = function() {
			return notifications;
		};

		editor.on('SkinLoaded', function() {
			var serviceMessage = editor.settings.service_message;

			if (serviceMessage) {
				editor.notificationManager.open({
					text: serviceMessage,
					type: 'warning',
					timeout: 0,
					icon: ''
				});
			}
		});

		/**
		 * Finds any existing notification with the same properties as the new one.
		 * Returns either the found notification or null.
		 *
		 * @param {Notification[]} notificationArray - Array of current notifications
		 * @param {type: string, } newNotification - New notification object
		 * @returns {?Notification}
		 */
		function findDuplicateMessage(notificationArray, newNotification) {
			if (!isPlainTextNotification(newNotification)) {
				return null;
			}

			var filteredNotifications = Tools.grep(notificationArray, function (notification) {
				return isSameNotification(newNotification, notification);
			});

			return filteredNotifications.length === 0 ? null : filteredNotifications[0];
		}

		/**
		 * Checks if the passed in args object has the same
		 * type and text properties as the sent in notification.
		 *
		 * @param {type: string, text: string} a - New notification args object
		 * @param {Notification} b - Old notification
		 * @returns {boolean}
		 */
		function isSameNotification(a, b) {
			return a.type === b.settings.type && a.text === b.settings.text;
		}

		/**
		 * Checks that the notification does not have a progressBar
		 * or timeour property.
		 *
		 * @param {Notification} notification - Notification to check
		 * @returns {boolean}
		 */
		function isPlainTextNotification(notification) {
			return !notification.progressBar && !notification.timeout;
		}

		//self.positionNotifications = positionNotifications;
	};
});
