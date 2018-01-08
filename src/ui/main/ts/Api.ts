/**
 * Api.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Factory from 'tinymce/core/ui/Factory';
import Tools from 'tinymce/core/util/Tools';
import AbsoluteLayout from './AbsoluteLayout';
import BrowseButton from './BrowseButton';
import Button from './Button';
import ButtonGroup from './ButtonGroup';
import Checkbox from './Checkbox';
import Collection from './Collection';
import ColorBox from './ColorBox';
import ColorButton from './ColorButton';
import ColorPicker from './ColorPicker';
import ComboBox from './ComboBox';
import Container from './Container';
import Control from './Control';
import DragHelper from './DragHelper';
import DropZone from './DropZone';
import ElementPath from './ElementPath';
import FieldSet from './FieldSet';
import FilePicker from './FilePicker';
import FitLayout from './FitLayout';
import FlexLayout from './FlexLayout';
import FloatPanel from './FloatPanel';
import FlowLayout from './FlowLayout';
import Form from './Form';
import FormatControls from './FormatControls';
import FormItem from './FormItem';
import GridLayout from './GridLayout';
import Iframe from './Iframe';
import InfoBox from './InfoBox';
import KeyboardNavigation from './KeyboardNavigation';
import Label from './Label';
import Layout from './Layout';
import ListBox from './ListBox';
import Menu from './Menu';
import MenuBar from './MenuBar';
import MenuButton from './MenuButton';
import MenuItem from './MenuItem';
import MessageBox from './MessageBox';
import Movable from './Movable';
import Notification from './Notification';
import Panel from './Panel';
import PanelButton from './PanelButton';
import Path from './Path';
import Progress from './Progress';
import Radio from './Radio';
import ReflowQueue from './ReflowQueue';
import Resizable from './Resizable';
import ResizeHandle from './ResizeHandle';
import Scrollable from './Scrollable';
import SelectBox from './SelectBox';
import Selector from './Selector';
import Slider from './Slider';
import Spacer from './Spacer';
import SplitButton from './SplitButton';
import StackLayout from './StackLayout';
import TabPanel from './TabPanel';
import TextBox from './TextBox';
import Throbber from './Throbber';
import Toolbar from './Toolbar';
import Tooltip from './Tooltip';
import Widget from './Widget';
import Window from './Window';

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

export default <any> Api;