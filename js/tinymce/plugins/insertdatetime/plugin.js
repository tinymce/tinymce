/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('insertdatetime', function(editor) {
	var daysShort = "Sun Mon Tue Wed Thu Fri Sat Sun".split(' ');
	var daysLong = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday Sunday".split(' ');
	var monthsShort = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(' ');
	var monthsLong = "January February March April May June July August September October November December".split(' ');
	var menuItems = [], lastFormat;

	function getDateTime(fmt, date) {
		function addZeros(value, len) {
			value = "" + value;

			if (value.length < len) {
				for (var i = 0; i < (len - value.length); i++) {
					value = "0" + value;
				}
			}

			return value;
		}

		date = date || new Date();

		fmt = fmt.replace("%D", "%m/%d/%Y");
		fmt = fmt.replace("%r", "%I:%M:%S %p");
		fmt = fmt.replace("%Y", "" + date.getFullYear());
		fmt = fmt.replace("%y", "" + date.getYear());
		fmt = fmt.replace("%m", addZeros(date.getMonth() + 1, 2));
		fmt = fmt.replace("%d", addZeros(date.getDate(), 2));
		fmt = fmt.replace("%H", "" + addZeros(date.getHours(), 2));
		fmt = fmt.replace("%M", "" + addZeros(date.getMinutes(), 2));
		fmt = fmt.replace("%S", "" + addZeros(date.getSeconds(), 2));
		fmt = fmt.replace("%I", "" + ((date.getHours() + 11) % 12 + 1));
		fmt = fmt.replace("%p", "" + (date.getHours() < 12 ? "AM" : "PM"));
		fmt = fmt.replace("%B", "" + editor.translate(monthsLong[date.getMonth()]));
		fmt = fmt.replace("%b", "" + editor.translate(monthsShort[date.getMonth()]));
		fmt = fmt.replace("%A", "" + editor.translate(daysLong[date.getDay()]));
		fmt = fmt.replace("%a", "" + editor.translate(daysShort[date.getDay()]));
		fmt = fmt.replace("%%", "%");

		return fmt;
	}

	editor.addCommand('mceInsertDate', function() {
		var str = getDateTime(editor.getParam("plugin_insertdate_dateFormat", editor.translate("%Y-%m-%d")));

		editor.execCommand('mceInsertContent', false, str);
	});

	editor.addCommand('mceInsertTime', function() {
		var str = getDateTime(editor.getParam("plugin_insertdate_timeFormat", editor.translate('%H:%M:%S')));

		editor.execCommand('mceInsertContent', false, str);
	});

	editor.addButton('inserttime', {
		type: 'splitbutton',
		title: 'Insert time',
		onclick: function() {
			editor.insertContent(getDateTime(lastFormat || "%H:%M:%S"));
		},
		menu: menuItems
	});

	// TODO: Add config option here
	tinymce.each([
		"%H:%M:%S",
		"%Y-%m-%d",
		"%I:%M:%S %p",
		"%D"
	], function(fmt) {
		menuItems.push({
			text: getDateTime(fmt),
			onclick: function() {
				lastFormat = fmt;
				editor.insertContent(getDateTime(fmt));
			}
		});
	});

	editor.addMenuItem('insertdatetime', {
		icon: 'date',
		text: 'Insert date/time',
		menu: menuItems,
		context: 'insert'
	});
});
