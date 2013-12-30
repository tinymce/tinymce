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
	var menuItems = [], lastFormat, defaultButtonTimeFormat;

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

	function insertDateTime(format) {
		var html = getDateTime(format);

		if (editor.settings.insertdatetime_element) {
			var computerTime;

			if (/%[HMSIp]/.test(format)) {
				computerTime = getDateTime("%Y-%m-%dT%H:%M");
			} else {
				computerTime = getDateTime("%Y-%m-%d");
			}

			html = '<time datetime="' + computerTime + '">' + html + '</time>';

			var timeElm = editor.dom.getParent(editor.selection.getStart(), 'time');
			if (timeElm) {
				editor.dom.setOuterHTML(timeElm, html);
				return;
			}
		}

		editor.insertContent(html);
	}

	editor.addCommand('mceInsertDate', function() {
		insertDateTime(editor.getParam("insertdatetime_dateformat", editor.translate("%Y-%m-%d")));
	});

	editor.addCommand('mceInsertTime', function() {
		insertDateTime(editor.getParam("insertdatetime_timeformat", editor.translate('%H:%M:%S')));
	});

	editor.addButton('inserttime', {
		type: 'splitbutton',
		title: 'Insert time',
		onclick: function() {
			insertDateTime(lastFormat || defaultButtonTimeFormat);
		},
		menu: menuItems
	});

	tinymce.each(editor.settings.insertdatetime_formats || [
		"%H:%M:%S",
		"%Y-%m-%d",
		"%I:%M:%S %p",
		"%D"
	], function(fmt) {
		if (!defaultButtonTimeFormat) {
			defaultButtonTimeFormat = fmt;
		}

		menuItems.push({
			text: getDateTime(fmt),
			onclick: function() {
				lastFormat = fmt;
				insertDateTime(fmt);
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
