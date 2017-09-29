define(
  'tinymce.themes.mobile.ui.AndroidRealm',

  [
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Swapping',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Singleton',
    'tinymce.themes.mobile.api.AndroidWebapp',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.toolbar.ScrollingToolbar',
    'tinymce.themes.mobile.ui.CommonRealm',
    'tinymce.themes.mobile.ui.Dropup',
    'tinymce.themes.mobile.ui.OuterContainer'
  ],


  function (Replacing, Swapping, Fun, Singleton, AndroidWebapp, Styles, ScrollingToolbar, CommonRealm, Dropup, OuterContainer) {
    return function (scrollIntoView) {
      var alloy = OuterContainer({
        classes: [ Styles.resolve('android-container') ]
      });

      var toolbar = ScrollingToolbar();

      var webapp = Singleton.api();

      var switchToEdit = CommonRealm.makeEditSwitch(webapp);

      var socket = CommonRealm.makeSocket();

      var dropup = Dropup.build(Fun.noop, scrollIntoView);

      alloy.add(toolbar.wrapper());
      alloy.add(socket);
      alloy.add(dropup.component());

      var setToolbarGroups = function (rawGroups) {
        var groups = toolbar.createGroups(rawGroups);
        toolbar.setGroups(groups);
      };

      var setContextToolbar = function (rawGroups) {
        var groups = toolbar.createGroups(rawGroups);
        toolbar.setContextToolbar(groups);
      };

      // You do not always want to do this.
      var focusToolbar = function () {
        toolbar.focus();
      };

      var restoreToolbar = function () {
        toolbar.restoreToolbar();
      };

      var init = function (spec) {
        webapp.set(
          AndroidWebapp.produce(spec)
        );
      };

      var exit = function () {
        webapp.run(function (w) {
          w.exit();
          Replacing.remove(socket, switchToEdit);
        });
      };

      var updateMode = function (readOnly) {
        CommonRealm.updateMode(socket, switchToEdit, readOnly, alloy.root());
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
