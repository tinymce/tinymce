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
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.PluginManager',
    'tinymce.core.util.JSON',
    'tinymce.core.util.Tools',
    'tinymce.core.util.XHR'
  ],
  function (DOMUtils, PluginManager, JSON, Tools, XHR) {
    PluginManager.add('template', function (editor) {
      function createTemplateList(callback) {
        return function () {
          var templateList = editor.settings.templates;

          if (typeof templateList == "function") {
            templateList(callback);
            return;
          }

          if (typeof templateList == "string") {
            XHR.send({
              url: templateList,
              success: function (text) {
                callback(JSON.parse(text));
              }
            });
          } else {
            callback(templateList);
          }
        };
      }

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

        function onSelectTemplate(e) {
          var value = e.control.value();

          function insertIframeHtml(html) {
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

            html = replaceTemplateValues(html, 'template_preview_replace_values');

            var doc = win.find('iframe')[0].getEl().contentWindow.document;
            doc.open();
            doc.write(html);
            doc.close();
          }

          if (value.url) {
            XHR.send({
              url: value.url,
              success: function (html) {
                templateHtml = html;
                insertIframeHtml(templateHtml);
              }
            });
          } else {
            templateHtml = value.content;
            insertIframeHtml(templateHtml);
          }

          win.find('#description')[0].text(e.control.value().description);
        }

        win = editor.windowManager.open({
          title: 'Insert template',
          layout: 'flex',
          direction: 'column',
          align: 'stretch',
          padding: 15,
          spacing: 10,

          items: [
            {
              type: 'form', flex: 0, padding: 0, items: [
                {
                  type: 'container', label: 'Templates', items: {
                    type: 'listbox', label: 'Templates', name: 'template', values: values, onselect: onSelectTemplate
                  }
                }
              ]
            },
            { type: 'label', name: 'description', label: 'Description', text: '\u00a0' },
            { type: 'iframe', flex: 1, border: 1 }
          ],

          onsubmit: function () {
            insertTemplate(false, templateHtml);
          },

          minWidth: Math.min(DOMUtils.DOM.getViewPort().w, editor.getParam('template_popup_width', 600)),
          minHeight: Math.min(DOMUtils.DOM.getViewPort().h, editor.getParam('template_popup_height', 500))
        });

        win.find('listbox')[0].fire('select');
      }

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

        Tools.each(dom.select('*', e), function (e) {
          Tools.each(vl, function (v, k) {
            if (dom.hasClass(e, k)) {
              if (typeof vl[k] == 'function') {
                vl[k](e);
              }
            }
          });
        });
      }

      function replaceTemplateValues(html, templateValuesOptionName) {
        Tools.each(editor.getParam(templateValuesOptionName), function (v, k) {
          if (typeof v == 'function') {
            v = v(k);
          }

          html = html.replace(new RegExp('\\{\\$' + k + '\\}', 'g'), v);
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

        Tools.each(dom.select('*', el), function (n) {
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
        onclick: createTemplateList(showDialog)
      });

      editor.addMenuItem('template', {
        text: 'Template',
        onclick: createTemplateList(showDialog),
        context: 'insert'
      });

      editor.on('PreProcess', function (o) {
        var dom = editor.dom;

        Tools.each(dom.select('div', o.node), function (e) {
          if (dom.hasClass(e, 'mceTmpl')) {
            Tools.each(dom.select('*', e), function (e) {
              if (dom.hasClass(e, editor.getParam('template_mdate_classes', 'mdate').replace(/\s+/g, '|'))) {
                e.innerHTML = getDateTime(editor.getParam("template_mdate_format", editor.getLang("template.mdate_format")));
              }
            });

            replaceVals(e);
          }
        });
      });
    });


    return function () { };
  }
);