/**
 * Init.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.init.Init',
  [
    'global!document',
    'global!window',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.Env',
    'tinymce.core.init.InitContentBody',
    'tinymce.core.PluginManager',
    'tinymce.core.ThemeManager',
    'tinymce.core.util.Tools',
    'tinymce.core.util.Uuid'
  ],
  function (document, window, DOMUtils, Env, InitContentBody, PluginManager, ThemeManager, Tools, Uuid) {
    var DOM = DOMUtils.DOM;

    var initPlugin = function (editor, initializedPlugins, plugin) {
      var Plugin = PluginManager.get(plugin), pluginUrl, pluginInstance;

      pluginUrl = PluginManager.urls[plugin] || editor.documentBaseUrl.replace(/\/$/, '');
      plugin = Tools.trim(plugin);
      if (Plugin && Tools.inArray(initializedPlugins, plugin) === -1) {
        Tools.each(PluginManager.dependencies(plugin), function (dep) {
          initPlugin(editor, initializedPlugins, dep);
        });

        if (editor.plugins[plugin]) {
          return;
        }

        pluginInstance = new Plugin(editor, pluginUrl, editor.$);

        editor.plugins[plugin] = pluginInstance;

        if (pluginInstance.init) {
          pluginInstance.init(editor, pluginUrl);
          initializedPlugins.push(plugin);
        }
      }
    };

    var initPlugins = function (editor) {
      var initializedPlugins = [];

      Tools.each(editor.settings.plugins.replace(/\-/g, '').split(/[ ,]/), function (name) {
        initPlugin(editor, initializedPlugins, name);
      });
    };

    var initTheme = function (editor) {
      var Theme, settings = editor.settings;

      if (settings.theme) {
        if (typeof settings.theme != "function") {
          settings.theme = settings.theme.replace(/-/, '');
          Theme = ThemeManager.get(settings.theme);
          editor.theme = new Theme(editor, ThemeManager.urls[settings.theme]);

          if (editor.theme.init) {
            editor.theme.init(editor, ThemeManager.urls[settings.theme] || editor.documentBaseUrl.replace(/\/$/, ''), editor.$);
          }
        } else {
          editor.theme = settings.theme;
        }
      }
    };

    var measueBox = function (editor) {
      var w, h, minHeight, re, o, settings = editor.settings, elm = editor.getElement();

      // Measure box
      if (settings.render_ui && editor.theme) {
        editor.orgDisplay = elm.style.display;

        if (typeof settings.theme != "function") {
          w = settings.width || DOM.getStyle(elm, 'width') || '100%';
          h = settings.height || DOM.getStyle(elm, 'height') || elm.offsetHeight;
          minHeight = settings.min_height || 100;
          re = /^[0-9\.]+(|px)$/i;

          if (re.test('' + w)) {
            w = Math.max(parseInt(w, 10), 100);
          }

          if (re.test('' + h)) {
            h = Math.max(parseInt(h, 10), minHeight);
          }

          // Render UI
          o = editor.theme.renderUI({
            targetNode: elm,
            width: w,
            height: h,
            deltaWidth: settings.delta_width,
            deltaHeight: settings.delta_height
          });

          // Resize editor
          if (!settings.content_editable) {
            h = (o.iframeHeight || h) + (typeof h === 'number' ? (o.deltaHeight || 0) : '');
            if (h < minHeight) {
              h = minHeight;
            }
          }
        } else {
          o = settings.theme(editor, elm);

          if (o.editorContainer.nodeType) {
            o.editorContainer.id = o.editorContainer.id || editor.id + "_parent";
          }

          if (o.iframeContainer.nodeType) {
            o.iframeContainer.id = o.iframeContainer.id || editor.id + "_iframecontainer";
          }

          // Use specified iframe height or the targets offsetHeight
          h = o.iframeHeight || elm.offsetHeight;
        }

        editor.editorContainer = o.editorContainer;
        o.height = h;
      }

      return o;
    };

    var relaxDomain = function (editor, ifr) {
      // Domain relaxing is required since the user has messed around with document.domain
      // This only applies to IE 11 other browsers including Edge seems to handle document.domain
      if (document.domain !== window.location.hostname && Env.ie && Env.ie < 12) {
        var bodyUuid = Uuid.uuid('mce');

        editor[bodyUuid] = function () {
          InitContentBody.initContentBody(editor);
        };

        /*eslint no-script-url:0 */
        var domainRelaxUrl = 'javascript:(function(){' +
          'document.open();document.domain="' + document.domain + '";' +
          'var ed = window.parent.tinymce.get("' + editor.id + '");document.write(ed.iframeHTML);' +
          'document.close();ed.' + bodyUuid + '(true);})()';

        DOM.setAttrib(ifr, 'src', domainRelaxUrl);
        return true;
      }

      return false;
    };

    var createIframe = function (editor, o) {
      var settings = editor.settings, bodyId, bodyClass;

      editor.iframeHTML = settings.doctype + '<html><head>';

      // We only need to override paths if we have to
      // IE has a bug where it remove site absolute urls to relative ones if this is specified
      if (settings.document_base_url != editor.documentBaseUrl) {
        editor.iframeHTML += '<base href="' + editor.documentBaseURI.getURI() + '" />';
      }

      // IE8 doesn't support carets behind images setting ie7_compat would force IE8+ to run in IE7 compat mode.
      if (!Env.caretAfter && settings.ie7_compat) {
        editor.iframeHTML += '<meta http-equiv="X-UA-Compatible" content="IE=7" />';
      }

      editor.iframeHTML += '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';

      bodyId = settings.body_id || 'tinymce';
      if (bodyId.indexOf('=') != -1) {
        bodyId = editor.getParam('body_id', '', 'hash');
        bodyId = bodyId[editor.id] || bodyId;
      }

      bodyClass = settings.body_class || '';
      if (bodyClass.indexOf('=') != -1) {
        bodyClass = editor.getParam('body_class', '', 'hash');
        bodyClass = bodyClass[editor.id] || '';
      }

      if (settings.content_security_policy) {
        editor.iframeHTML += '<meta http-equiv="Content-Security-Policy" content="' + settings.content_security_policy + '" />';
      }

      editor.iframeHTML += '</head><body id="' + bodyId +
        '" class="mce-content-body ' + bodyClass +
        '" data-id="' + editor.id + '"><br></body></html>';

      // Create iframe
      // TODO: ACC add the appropriate description on this.
      var ifr = DOM.create('iframe', {
        id: editor.id + "_ifr",
        frameBorder: '0',
        allowTransparency: "true",
        title: editor.editorManager.translate(
          "Rich Text Area. Press ALT-F9 for menu. " +
          "Press ALT-F10 for toolbar. Press ALT-0 for help"
        ),
        style: {
          width: '100%',
          height: o.height,
          display: 'block' // Important for Gecko to render the iframe correctly
        }
      });

      ifr.onload = function () {
        ifr.onload = null;
        editor.fire("load");
      };

      var isDomainRelaxed = relaxDomain(editor, ifr);

      editor.contentAreaContainer = o.iframeContainer;
      editor.iframeElement = ifr;

      DOM.add(o.iframeContainer, ifr);

      return isDomainRelaxed;
    };

    var init = function (editor) {
      var settings = editor.settings, elm = editor.getElement(), boxInfo;

      editor.rtl = settings.rtl_ui || editor.editorManager.i18n.rtl;
      editor.editorManager.i18n.setCode(settings.language);
      settings.aria_label = settings.aria_label || DOM.getAttrib(elm, 'aria-label', editor.getLang('aria.rich_text_area'));

      editor.fire('ScriptsLoaded');

      initTheme(editor);
      initPlugins(editor);
      boxInfo = measueBox(editor);

      // Load specified content CSS last
      if (settings.content_css) {
        Tools.each(Tools.explode(settings.content_css), function (u) {
          editor.contentCSS.push(editor.documentBaseURI.toAbsolute(u));
        });
      }

      // Load specified content CSS last
      if (settings.content_style) {
        editor.contentStyles.push(settings.content_style);
      }

      // Content editable mode ends here
      if (settings.content_editable) {
        return InitContentBody.initContentBody(editor);
      }

      var isDomainRelaxed = createIframe(editor, boxInfo);

      if (boxInfo.editorContainer) {
        DOM.get(boxInfo.editorContainer).style.display = editor.orgDisplay;
        editor.hidden = DOM.isHidden(boxInfo.editorContainer);
      }

      editor.getElement().style.display = 'none';
      DOM.setAttrib(editor.id, 'aria-hidden', true);

      if (!isDomainRelaxed) {
        InitContentBody.initContentBody(editor);
      }
    };

    return {
      init: init
    };
  }
);
