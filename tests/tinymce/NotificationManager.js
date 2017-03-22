ModuleLoader.require([
	'tinymce/util/Tools'
], function(Tools) {
	module("tinymce.NotificationManager", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				add_unload_trigger: false,
				disable_nodechange: true,
				skin: false,
				entities: 'raw',
				indent: false,
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		},
		teardown: function() {
			var notifications = [].concat(editor.notificationManager.notifications);

			Tools.each(notifications, function(notification) {
				notification.close();
			});
		}
	});


	test('Should not add duplicate text message', function() {
		expect(4);

		var testMsg1 = {type: 'default', text: 'test default message'};
		var testMsg2 = {type: 'warning', text: 'test warning message'};
		var testMsg3 = {type: 'error', text: 'test error message'};
		var testMsg4 = {type: 'info', text: 'test info message'};
		var notifications = editor.notificationManager.notifications;

		editor.notificationManager.open(testMsg1);

		equal(notifications.length, 1, 'Should have one message after one added.');

		editor.notificationManager.open(testMsg1);

		equal(notifications.length, 1, 'Should not add message if duplicate.');

		editor.notificationManager.open(testMsg2);
		editor.notificationManager.open(testMsg3);
		editor.notificationManager.open(testMsg4);

		equal(notifications.length, 4, 'Non duplicate messages should get added.');

		editor.notificationManager.open(testMsg2);
		editor.notificationManager.open(testMsg3);
		editor.notificationManager.open(testMsg4);

		equal(notifications.length, 4, 'Should work for all text message types.');
	});

	test('Should add duplicate progressBar messages', function() {
		expect(2);
		var testMsg1 = {text: 'test progressBar message', progressBar: true};
		var notifications = editor.notificationManager.notifications;

		editor.notificationManager.open(testMsg1);

		equal(notifications.length, 1, 'Should have one message after one added.');

		editor.notificationManager.open(testMsg1);
		editor.notificationManager.open(testMsg1);
		editor.notificationManager.open(testMsg1);

		equal(notifications.length, 4, 'Duplicate should be added for progressBar message.');
	});

	asyncTest('Should add duplicate timeout messages', function() {
		expect(2);
		var checkClosed = function () {
			if (notifications.length === 0) {
				start();
			}
		};
		var testMsg1 = {text: 'test timeout message', timeout: 1};
		var notifications = editor.notificationManager.notifications;

		editor.notificationManager.open(testMsg1).on('close', checkClosed);

		equal(notifications.length, 1, 'Should have one message after one added.');

		editor.notificationManager.open(testMsg1).on('close', checkClosed);

		equal(notifications.length, 2, 'Duplicate should be added for timeout message.');
	});

	test('Should not open notifcation if editor is removed', function() {
		var testMsg1 = {type: 'default', text: 'test progressBar message'};

		editor.remove();

		try {
			editor.notificationManager.open(testMsg1);
			ok(true, 'Should execute without throwing.')
		} catch (e) {
			ok(false, 'Should never throw exception.');
		}
	});

});
