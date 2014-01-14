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

tinymce.PluginManager.add('template', function(editor) {
	var each = tinymce.each;
	var extend = tinymce.extend;
	
	// template model
	var Template = function (name, url, content, description, params) {
		var self = this;
		var initialized = params ? false : true;
		var templateOptions = {};
		
		// setting up default template options values
		each(params, function(el, name) {
			templateOptions[name] = el.value;
		});
		
		self.show = function(mediator) {
			mediator.setCurrent(self);
			mediator.prepareParamsPopup(params);
			mediator.setDescription(description);
			
			if (url)
			{
				if (!initialized)
				{
					mediator.setTemplate('');
				}
				else
				{
					var urlParams = [];
					
					// TODO: do you have any tool for building urls from object or how you add depedency on something already exiting in node libraries?
					each(templateOptions, function(value, key) {
						urlParams.push(key + '=' + value);
					});
					
					tinymce.util.XHR.send({
						url: url + '?' + urlParams.join('&'),
						success: function(html) {
							mediator.setTemplate(html);
						}
					});
				}
			}
			else
			{
				mediator.setTemplate(content);
			}
		};
		
		self.update = function(value) {
			initialized = true;
			// setting params for request
			templateOptions = value;
			// rewriting new values to template setup form
			each(params, function(el, name) {
				el.value = templateOptions[name];
			});
		};
		
		self.isInitialized = function() {
			return initialized;
		}
		
		return {
			show: self.show,
			update: self.update,
			isInitialized: self.isInitialized
		}
	}
	
	var TemplateController = function() {
		var self = this;
		
		var pluginPopupWindow = null, // plugin popup window
			paramsPopupWindow = null, // popup for template params
			templateParamsPopupControl = null, // button for showing template settings popup
			templateSelectionControl = null, // select control with avaible templates
			templateDescriptionControl = null,
			templateHtml = '',
			current = null, // currently displayed template
			paramsPopupBody = [],
			optionsControls = [],
			templates = []; // obecnie edytowany schemat
		
		// initializing plugin and showing popup
		self.start = function() {
			var templateList = editor.settings.templates;
			
			if (!templateList)
			{
				editor.windowManager.alert('No templates defined');
				return;
			}
			else if (typeof(templateList) == "string")
			{
				tinymce.util.XHR.send({
					url: templateList,
					success: function(text) {
						self.show(tinymce.util.JSON.parse(text));
					}
				});
			}
			else
			{
				self.show(templateList);
			}
		};
		
		// building popup and selecting first template
		self.show = function(templateList) {
			pluginPopupWindow = editor.windowManager.open(self.build(templateList));
			
			templateSelectionControl.fire('select');
		};
		
		// building main popup
		self.build = function(templateList) {
			// preparing model for template select control
			
			each(templateList, function(template) {
				templates.push({
					selected: !templates.length,
					text: template.title,
					// each select option from template control points to template model instance
					value: new Template(
							template.title,
							template.url,
							template.content,
							template.description,
							template.options
						)
				});
			});
			
			// preparing main plugin popup form 
			
			templateSelectionControl = tinymce.ui.Factory.create({
				type: 'listbox',
				name: 'template',
				values: templates,
				onselect: self.onSelectTemplate
			});
			
			templateParamsPopupControl = tinymce.ui.Factory.create({
				type: 'button',
				icon: 'template',
				text: 'setup',
				onclick: self.showParamsSetup
			});
			
			templateDescriptionControl = tinymce.ui.Factory.create({
				type: 'label',
				name: 'description',
				label: 'Description',
				text: '\u00a0'
			});
			
			// returning main form template
			
			return {
				title: 'Insert template',
				layout: 'flex',
				direction: 'column',
				align: 'stretch',
				padding: 15,
				spacing: 10,
				
				body: [
					{
						type: 'container',
						label: 'Templates',
						items: [
							templateSelectionControl,
							templateParamsPopupControl
						]
					},
					{
						type: 'container',
						label: 'Description',
						items: [
							templateDescriptionControl
						]
					},
					{
						type: 'iframe',
						minHeight: 300,
						width: editor.getParam('template_popup_width', 600) - 30,
						border: 1
					}
				],
				
				onsubmit: function() {
					insertTemplate(false, templateHtml);
				},
				
				width: editor.getParam('template_popup_width', 600),
				height: editor.getParam('template_popup_height', 500)
			};
		};
		
		// updating template description on plugin popup form
		self.setDescription = function(value) {
			templateDescriptionControl.text(value);
		};
		
		// updating template view on plugin popup form
		self.setTemplate = function(html) {
			templateHtml = html;
			
			if (html.indexOf('<html>') == -1)
			{
				var contentCssLinks = '';
				
				each(editor.contentCSS, function(url) {
					contentCssLinks += '<link type="text/css" rel="stylesheet" href="' + editor.documentBaseURI.toAbsolute(url) + '">';
				});
				
				html = (
					'<!DOCTYPE html>' +
					'<html>' +
						'<head>' +
							contentCssLinks +
						'</head>' +
						'<body>' +
							html +
						'</body>' +
					'</html>'
				);
			}
			
			html = replaceTemplateValues(html, 'template_preview_replace_values');
			
			var doc = pluginPopupWindow.find('iframe')[0].getEl().contentWindow.document;
			doc.open();
			doc.write(html);
			doc.close();
		};
		
		// preparing popup for template settings
		self.prepareParamsPopup = function(options) {
			paramsPopupBody = [];
			optionsControls = {};
			
			if (typeof(options) == 'undefined')
			{
				templateParamsPopupControl.hide();
			}
			else
			{
				templateParamsPopupControl.show();
			}
			
			each(options, function(el, name) {
				var control = tinymce.ui.Factory.create(el);
				optionsControls[name] = control;
				paramsPopupBody.push({
					type: 'container',
					label: el.label,
					items: [control]
				});
			});
			
			paramsPopupWindow = editor.windowManager.open({
				title: 'Template options',
				body: paramsPopupBody,
				onsubmit: self.onParamsUpdate,
				onclose: self.onParamsClose
			});
			
			paramsPopupWindow.hide();
		};
		
		self.setCurrent = function(template) {
			current = template;
		};
		
		// called when users chooses template from template select control
		self.onSelectTemplate = function(e) {
			if (paramsPopupWindow != null)
			{
				paramsPopupWindow.hide();
			}
			
			var template = e.control.value();
			template.show(self);
			
			if (!template.isInitialized())
			{
				self.showParamsSetup();
			}
		};
		
		// show template setup popup
		self.showParamsSetup = function() {
			paramsPopupWindow.show();
		};
		
		// called when template params where submited
		self.onParamsUpdate = function() {
			var params = {};
			
			each(optionsControls, function(el, name) {
				params[name] = el.value();
			});
			
			current.update(params);
		};
		
		// called when template params where discarded
		self.onParamsClose = function() {
			current.show(self);
		};
		
		return {
			// controller interface
			start: self.start,
			// template model view mediator interface
			prepareParamsPopup: self.prepareParamsPopup,
			setDescription: self.setDescription,
			setTemplate: self.setTemplate,
			setCurrent: self.setCurrent
		};
	};

	// left for lazy initialization
	function showDialog() {
		var controller = new TemplateController();
		
		controller.start();
	}

	// rest almost not changed
	function getDateTime(fmt, date) {
		var daysShort = "Sun Mon Tue Wed Thu Fri Sat Sun".split(' ');
		var daysLong = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday Sunday".split(' ');
		var monthsShort = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(' ');
		var monthsLong = "January February March April May June July August September October November December".split(' ');

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

	function replaceVals(e) {
		var dom = editor.dom, vl = editor.getParam('template_replace_values');

		each(dom.select('*', e), function(e) {
			each(vl, function(v, k) {
				if (dom.hasClass(e, k)) {
					if (typeof(vl[k]) == 'function') {
						vl[k](e);
					}
				}
			});
		});
	}

	function replaceTemplateValues(html, templateValuesOptionName) {
		each(editor.getParam(templateValuesOptionName), function(v, k) {
			if (typeof(v) != 'function') {
				html = html.replace(new RegExp('\\{\\$' + k + '\\}', 'g'), v);
			}
		});

		return html;
	}

	function insertTemplate(ui, html) {
		var el, n, dom = editor.dom, sel = editor.selection.getContent();

		html = replaceTemplateValues(html, 'template_replace_values');
		el = dom.create('div', null, html);

		// Find template element within div
		n = dom.select('.mceTmpl', el);
		if (n && n.length > 0) {
			el = dom.create('div', null);
			el.appendChild(n[0].cloneNode(true));
		}

		function hasClass(n, c) {
			return new RegExp('\\b' + c + '\\b', 'g').test(n.className);
		}

		each(dom.select('*', el), function(n) {
			// Replace cdate
			if (hasClass(n, editor.getParam('template_cdate_classes', 'cdate').replace(/\s+/g, '|'))) {
				n.innerHTML = getDateTime(editor.getParam("template_cdate_format", editor.getLang("template.cdate_format")));
			}

			// Replace mdate
			if (hasClass(n, editor.getParam('template_mdate_classes', 'mdate').replace(/\s+/g, '|'))) {
				n.innerHTML = getDateTime(editor.getParam("template_mdate_format", editor.getLang("template.mdate_format")));
			}

			// Replace selection
			if (hasClass(n, editor.getParam('template_selected_content_classes', 'selcontent').replace(/\s+/g, '|'))) {
				n.innerHTML = sel;
			}
		});

		replaceVals(el);

		editor.execCommand('mceInsertContent', false, el.innerHTML);
		editor.addVisual();
	}

	editor.addCommand('mceInsertTemplate', insertTemplate);

	editor.addButton('template', {
		title: 'Insert template',
		onclick: showDialog
	});

	editor.addMenuItem('template', {
		text: 'Insert template',
		onclick: showDialog,
		context: 'insert'
	});

	editor.on('PreProcess', function(o) {
		var dom = editor.dom;

		each(dom.select('div', o.node), function(e) {
			if (dom.hasClass(e, 'mceTmpl')) {
				each(dom.select('*', e), function(e) {
					if (dom.hasClass(e, editor.getParam('template_mdate_classes', 'mdate').replace(/\s+/g, '|'))) {
						e.innerHTML = getDateTime(editor.getParam("template_mdate_format", editor.getLang("template.mdate_format")));
					}
				});

				replaceVals(e);
			}
		});
	});
});