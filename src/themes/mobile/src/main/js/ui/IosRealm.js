define(
  'tinymce.themes.mobile.ui.IosRealm',

  [
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Singleton',
    'tinymce.themes.mobile.api.IosWebapp',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.toolbar.ScrollingToolbar',
    'tinymce.themes.mobile.ui.CommonRealm',
    'tinymce.themes.mobile.ui.OuterContainer'
  ],

  function (Replacing, GuiFactory, Container, Fun, Singleton, IosWebapp, Styles, ScrollingToolbar, CommonRealm, OuterContainer) {
    return function () {
      var alloy = OuterContainer({
        classes: [ Styles.resolve('ios-container') ]
      });

      var toolbar = ScrollingToolbar();

      var webapp = Singleton.api();

      var switchToEdit = CommonRealm.makeEditSwitch(webapp);

      var socket = CommonRealm.makeSocket();


      var dropup = GuiFactory.build(
        Container.sketch({
          dom: {
            tag: 'div',
            innerHtml: 'Dropup',
            styles: {
              background: 'blue',
              display: 'flex',
              'flex-grow': '1'
            }
          }
        })
      );

      alloy.add(toolbar.wrapper());
      alloy.add(socket);
      alloy.add(dropup);

      var setToolbarGroups = function (rawGroups) {
        var groups = toolbar.createGroups(rawGroups);
        toolbar.setGroups(groups);
      };

      var setContextToolbar = function (rawGroups) {
        var groups = toolbar.createGroups(rawGroups);
        toolbar.setContextToolbar(groups);
      };

      var focusToolbar = function () {
        toolbar.focus();
      };

      var restoreToolbar = function () {
        toolbar.restoreToolbar();
      };

      var init = function (spec) {
        webapp.set(
          IosWebapp.produce(spec)
        );
      };

      var exit = function () {
        webapp.run(function (w) {
          Replacing.remove(socket, switchToEdit);
          w.exit();
        });
      };

      var updateMode = function (readOnly) {
        CommonRealm.updateMode(socket, switchToEdit, readOnly);
      };

      return {
        system: Fun.constant(alloy),
        element: alloy.element,
        init: init,
        exit: exit,
        setToolbarGroups: setToolbarGroups,
        setContextToolbar: setContextToolbar,
        focusToolbar: focusToolbar,
        restoreToolbar: restoreToolbar,
        updateMode: updateMode,
        socket: Fun.constant(socket),
        dropup: Fun.constant(dropup)
      };
    };
  }
);
