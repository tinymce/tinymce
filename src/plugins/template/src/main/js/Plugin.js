/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains all core logic for the code plugin.
 *
 * @class tinymce.template.Plugin
 * @private
 */
define(
  'tinymce.plugins.template.Plugin',
  [
    'ephox.katamari.api.Fun',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.PluginManager',
    'tinymce.core.util.JSON',
    'tinymce.core.util.Tools',
    'tinymce.core.util.XHR',
    'tinymce.plugins.template.core.DateTimeHelper',
    'tinymce.plugins.template.core.Templates'
  ],
  function (Fun, DOMUtils, PluginManager, JSON, Tools, XHR, DateTimeHelper, Templates) {

    var insertIframeHtml = function (editor, win, html) {
      if (html.indexOf('<html>') == -1) {
        var contentCssLinks = '';

        Tools.each(editor.contentCSS, function (url) {
          contentCssLinks += '<link type="text/css" rel="stylesheet" href="' +
                  editor.documentBaseURI.toAbsolute(url) +
                  '">';
        });

        var bodyClass = editor.settings.body_class || '';
        if (bodyClass.indexOf('=') != -1) {
          bodyClass = editor.getParam('body_class', '', 'hash');
          bodyClass = bodyClass[editor.id] || '';
        }

        html = (
                '<!DOCTYPE html>' +
                '<html>' +
                '<head>' +
                contentCssLinks +
                '</head>' +
                '<body class="' + bodyClass + '">' +
                html +
                '</body>' +
                '</html>'
              );
      }

      html = Templates.replaceTemplateValues(editor, html, 'template_preview_replace_values');

      var doc = win.find('iframe')[0].getEl().contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();
    };

    PluginManager.add('template', function (editor) {
      function showDialog(templateList) {
        var win, values = [], templateHtml;

        if (!templateList || templateList.length === 0) {
          var message = editor.translate('No templates defined.');
          editor.notificationManager.open({ text: message, type: 'info' });
          return;
        }

        Tools.each(templateList, function (template) {
          values.push({
            selected: !values.length,
            text: template.title,
            value: {
              url: template.url,
              content: template.content,
              description: template.description
            }
          });
        });

        var onSelectTemplate = function (e) {
          var value = e.control.value();

          if (value.url) {
            XHR.send({
              url: value.url,
              success: function (html) {
                templateHtml = html;
                insertIframeHtml(editor, win, templateHtml);
              }
            });
          } else {
            templateHtml = value.content;
            insertIframeHtml(editor, win, templateHtml);
          }

          win.find('#description')[0].text(e.control.value().description);
        };

        win = editor.windowManager.open({
          title: 'Insert template',
          layout: 'flex',
          direction: 'column',
          align: 'stretch',
          padding: 15,
          spacing: 10,
          items: [
            {
              type: 'form',
              flex: 0,
              padding: 0,
              items: [
                {
                  type: 'container',
                  label: 'Templates',
                  items: {
                    type: 'listbox',
                    label: 'Templates',
                    name: 'template',
                    values: values,
                    onselect: onSelectTemplate
                  }
                }
              ]
            },
            {
              type: 'label',
              name: 'description',
              label: 'Description',
              text: '\u00a0'
            },
            {
              type: 'iframe',
              flex: 1,
              border: 1
            }
          ],

          onsubmit: function () {
            Templates.insertTemplate(editor, false, templateHtml);
          },

          minWidth: Math.min(DOMUtils.DOM.getViewPort().w, editor.getParam('template_popup_width', 600)),
          minHeight: Math.min(DOMUtils.DOM.getViewPort().h, editor.getParam('template_popup_height', 500))
        });

        win.find('listbox')[0].fire('select');
      }

      editor.addCommand('mceInsertTemplate', Fun.curry(Templates.insertTemplate, editor));

      editor.addButton('template', {
        title: 'Insert template',
        onclick: Templates.createTemplateList(editor.settings, showDialog)
      });

      editor.addMenuItem('template', {
        text: 'Template',
        onclick: Templates.createTemplateList(editor.settings, showDialog),
        context: 'insert'
      });

      editor.on('PreProcess', function (o) {
        var dom = editor.dom;

        Tools.each(dom.select('div', o.node), function (e) {
          if (dom.hasClass(e, 'mceTmpl')) {
            Tools.each(dom.select('*', e), function (e) {
              if (dom.hasClass(e, editor.getParam('template_mdate_classes', 'mdate').replace(/\s+/g, '|'))) {
                e.innerHTML = DateTimeHelper.getDateTime(editor, editor.getParam("template_mdate_format", editor.getLang("template.mdate_format")));
              }
            });

            Templates.replaceVals(editor, e);
          }
        });
      });
    });


    return function () { };
  }
);