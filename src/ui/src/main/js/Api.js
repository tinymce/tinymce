/**
 * Api.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.ui.Api',
  [
    'tinymce.core.ui.Factory',
    'tinymce.core.util.Tools',
    'tinymce.ui.AbsoluteLayout',
    'tinymce.ui.BrowseButton',
    'tinymce.ui.Button',
    'tinymce.ui.ButtonGroup',
    'tinymce.ui.Checkbox',
    'tinymce.ui.Collection',
    'tinymce.ui.ColorBox',
    'tinymce.ui.ColorButton',
    'tinymce.ui.ColorPicker',
    'tinymce.ui.ComboBox',
    'tinymce.ui.Container',
    'tinymce.ui.Control',
    'tinymce.ui.DragHelper',
    'tinymce.ui.DropZone',
    'tinymce.ui.ElementPath',
    'tinymce.ui.FieldSet',
    'tinymce.ui.FilePicker',
    'tinymce.ui.FitLayout',
    'tinymce.ui.FlexLayout',
    'tinymce.ui.FloatPanel',
    'tinymce.ui.FlowLayout',
    'tinymce.ui.Form',
    'tinymce.ui.FormatControls',
    'tinymce.ui.FormItem',
    'tinymce.ui.GridLayout',
    'tinymce.ui.Iframe',
    'tinymce.ui.InfoBox',
    'tinymce.ui.KeyboardNavigation',
    'tinymce.ui.Label',
    'tinymce.ui.Layout',
    'tinymce.ui.ListBox',
    'tinymce.ui.Menu',
    'tinymce.ui.MenuBar',
    'tinymce.ui.MenuButton',
    'tinymce.ui.MenuItem',
    'tinymce.ui.MessageBox',
    'tinymce.ui.Movable',
    'tinymce.ui.Notification',
    'tinymce.ui.Panel',
    'tinymce.ui.PanelButton',
    'tinymce.ui.Path',
    'tinymce.ui.Progress',
    'tinymce.ui.Radio',
    'tinymce.ui.ReflowQueue',
    'tinymce.ui.Resizable',
    'tinymce.ui.ResizeHandle',
    'tinymce.ui.Scrollable',
    'tinymce.ui.SelectBox',
    'tinymce.ui.Selector',
    'tinymce.ui.Slider',
    'tinymce.ui.Spacer',
    'tinymce.ui.SplitButton',
    'tinymce.ui.StackLayout',
    'tinymce.ui.TabPanel',
    'tinymce.ui.TextBox',
    'tinymce.ui.Throbber',
    'tinymce.ui.Toolbar',
    'tinymce.ui.Tooltip',
    'tinymce.ui.Widget',
    'tinymce.ui.Window'
  ],
  function (
    Factory, Tools, AbsoluteLayout, BrowseButton, Button, ButtonGroup, Checkbox, Collection, ColorBox, ColorButton, ColorPicker, ComboBox, Container, Control,
    DragHelper, DropZone, ElementPath, FieldSet, FilePicker, FitLayout, FlexLayout, FloatPanel, FlowLayout, Form, FormatControls, FormItem, GridLayout, Iframe,
    InfoBox, KeyboardNavigation, Label, Layout, ListBox, Menu, MenuBar, MenuButton, MenuItem, MessageBox, Movable, Notification, Panel, PanelButton, Path, Progress,
    Radio, ReflowQueue, Resizable, ResizeHandle, Scrollable, SelectBox, Selector, Slider, Spacer, SplitButton, StackLayout, TabPanel, TextBox, Throbber, Toolbar,
    Tooltip, Widget, Window
  ) {
    var getApi = function () {
      return {
        Selector: Selector,
        Collection: Collection,
        ReflowQueue: ReflowQueue,
        Control: Control,
        Factory: Factory,
        KeyboardNavigation: KeyboardNavigation,
        Container: Container,
        DragHelper: DragHelper,
        Scrollable: Scrollable,
        Panel: Panel,
        Movable: Movable,
        Resizable: Resizable,
        FloatPanel: FloatPanel,
        Window: Window,
        MessageBox: MessageBox,
        Tooltip: Tooltip,
        Widget: Widget,
        Progress: Progress,
        Notification: Notification,
        Layout: Layout,
        AbsoluteLayout: AbsoluteLayout,
        Button: Button,
        ButtonGroup: ButtonGroup,
        Checkbox: Checkbox,
        ComboBox: ComboBox,
        ColorBox: ColorBox,
        PanelButton: PanelButton,
        ColorButton: ColorButton,
        ColorPicker: ColorPicker,
        Path: Path,
        ElementPath: ElementPath,
        FormItem: FormItem,
        Form: Form,
        FieldSet: FieldSet,
        FilePicker: FilePicker,
        FitLayout: FitLayout,
        FlexLayout: FlexLayout,
        FlowLayout: FlowLayout,
        FormatControls: FormatControls,
        GridLayout: GridLayout,
        Iframe: Iframe,
        InfoBox: InfoBox,
        Label: Label,
        Toolbar: Toolbar,
        MenuBar: MenuBar,
        MenuButton: MenuButton,
        MenuItem: MenuItem,
        Throbber: Throbber,
        Menu: Menu,
        ListBox: ListBox,
        Radio: Radio,
        ResizeHandle: ResizeHandle,
        SelectBox: SelectBox,
        Slider: Slider,
        Spacer: Spacer,
        SplitButton: SplitButton,
        StackLayout: StackLayout,
        TabPanel: TabPanel,
        TextBox: TextBox,
        DropZone: DropZone,
        BrowseButton: BrowseButton
      };
    };

    var appendTo = function (target) {
      if (target.ui) {
        Tools.each(getApi(), function (ref, key) {
          target.ui[key] = ref;
        });
      } else {
        target.ui = getApi();
      }
    };

    var registerToFactory = function () {
      Tools.each(getApi(), function (ref, key) {
        Factory.add(key, ref);
      });
    };

    var Api = {
      appendTo: appendTo,
      registerToFactory: registerToFactory
    };

    return Api;
  }
);