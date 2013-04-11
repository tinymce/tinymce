/**
 * MessageBox.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @class tinymce.ui.Window
 * @extends tinymce.ui.FloatPanel
 */
define("tinymce/ui/MessageBox", [
	"tinymce/ui/Window"
], function(Window) {
	"use strict";

	var MessageBox = Window.extend({
		init: function(settings) {
			settings = {
				border: 1,
				padding: 20,
				layout: 'flex',
				pack: "center",
				align: "center",
				containerCls: 'panel',
				autoScroll: true,
				buttons: {type: "button", text: "Ok", action: "ok"},
				items: {
					type: "label",
					multiline: true,
					maxWidth: 500,
					maxHeight: 200
				}
			};

			this._super(settings);
		},

		Statics: {
			OK: 1,
			OK_CANCEL: 2,
			YES_NO: 3,
			YES_NO_CANCEL: 4,

			msgBox: function(settings) {
				var buttons, callback = settings.callback || function() {};

				switch (settings.buttons) {
					case MessageBox.OK_CANCEL:
						buttons = [
							{type: "button", text: "Ok", subtype: "primary", onClick: function(e) {
								e.control.parents()[1].close();
								callback(true);
							}},

							{type: "button", text: "Cancel", onClick: function(e) {
								e.control.parents()[1].close();
								callback(false);
							}}
						];
						break;

					case MessageBox.YES_NO:
						buttons = [
							{type: "button", text: "Ok", subtype: "primary", onClick: function(e) {
								e.control.parents()[1].close();
								callback(true);
							}}
						];
						break;

					case MessageBox.YES_NO_CANCEL:
						buttons = [
							{type: "button", text: "Ok", subtype: "primary", onClick: function(e) {
								e.control.parents()[1].close();
							}}
						];
						break;

					default:
						buttons = [
							{type: "button", text: "Ok", subtype: "primary", onClick: function(e) {
								e.control.parents()[1].close();
							}}
						];
						break;
				}

				return new Window({
					padding: 20,
					x: settings.x,
					y: settings.y,
					minWidth: 300,
					minHeight: 100,
					layout: "flex",
					pack: "center",
					align: "center",
					buttons: buttons,
					title: settings.title,
					items: {
						type: "label",
						multiline: true,
						maxWidth: 500,
						maxHeight: 200,
						text: settings.text
					},
					onClose: settings.onClose
				}).renderTo(document.body).reflow();
			},

			alert: function(settings, callback) {
				if (typeof(settings) == "string") {
					settings = {text: settings};
				}

				settings.callback = callback;
				return MessageBox.msgBox(settings);
			},

			confirm: function(settings, callback) {
				if (typeof(settings) == "string") {
					settings = {text: settings};
				}

				settings.callback = callback;
				settings.buttons = MessageBox.OK_CANCEL;

				return MessageBox.msgBox(settings);
			}
		}
	});

	return MessageBox;
});