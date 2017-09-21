define(
  'tinymce.plugins.template.core.Templates',

  [
    'tinymce.core.util.Tools',
    'tinymce.core.util.XHR',
    'tinymce.plugins.template.core.DateTimeHelper'
  ],

  function (Tools, XHR, DateTimeHelper) {
    var createTemplateList = function (editorSettings, callback) {
      return function () {
        var templateList = editorSettings.templates;

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
    };

    var replaceTemplateValues = function (editor, html, templateValuesOptionName) {
      Tools.each(editor.getParam(templateValuesOptionName), function (v, k) {
        if (typeof v === 'function') {
          v = v(k);
        }

        html = html.replace(new RegExp('\\{\\$' + k + '\\}', 'g'), v);
      });

      return html;
    };

    var replaceVals = function (editor, e) {
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
    };

    var hasClass = function (n, c) {
      return new RegExp('\\b' + c + '\\b', 'g').test(n.className);
    };

    var insertTemplate = function (editor, ui, html) {
      var el, n, dom = editor.dom, sel = editor.selection.getContent();

      html = replaceTemplateValues(editor, html, 'template_replace_values');
      el = dom.create('div', null, html);

        // Find template element within div
      n = dom.select('.mceTmpl', el);
      if (n && n.length > 0) {
        el = dom.create('div', null);
        el.appendChild(n[0].cloneNode(true));
      }

      Tools.each(dom.select('*', el), function (n) {
          // Replace cdate
        if (hasClass(n, editor.getParam('template_cdate_classes', 'cdate').replace(/\s+/g, '|'))) {
          n.innerHTML = DateTimeHelper.getDateTime(editor, editor.getParam("template_cdate_format", editor.getLang("template.cdate_format")));
        }

          // Replace mdate
        if (hasClass(n, editor.getParam('template_mdate_classes', 'mdate').replace(/\s+/g, '|'))) {
          n.innerHTML = DateTimeHelper.getDateTime(editor, editor.getParam("template_mdate_format", editor.getLang("template.mdate_format")));
        }

          // Replace selection
        if (hasClass(n, editor.getParam('template_selected_content_classes', 'selcontent').replace(/\s+/g, '|'))) {
          n.innerHTML = sel;
        }
      });

      replaceVals(editor, el);

      editor.execCommand('mceInsertContent', false, el.innerHTML);
      editor.addVisual();
    };

    return {
      createTemplateList: createTemplateList,
      replaceTemplateValues: replaceTemplateValues,
      replaceVals: replaceVals,
      insertTemplate: insertTemplate
    };
  }
);
