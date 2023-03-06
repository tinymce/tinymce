import * as Boxes from '../alien/Boxes';
import * as EventRoot from '../alien/EventRoot';
import * as OffsetOrigin from '../alien/OffsetOrigin';
import * as AriaVoice from '../aria/AriaVoice';
import { BehaviourState } from '../behaviour/common/BehaviourState';
import * as DockingTypes from '../behaviour/docking/DockingTypes';
import * as Fields from '../data/Fields';
import * as Debugging from '../debugging/Debugging';
import * as FunctionAnnotator from '../debugging/FunctionAnnotator';
import * as DraggingTypes from '../dragging/common/DraggingTypes';
import {
  CustomEvent, CustomSimulatedEvent, EventFormat, NativeSimulatedEvent, ReceivingEvent, SimulatedEvent
} from '../events/SimulatedEvent';
import * as TapEvent from '../events/TapEvent';
import { FocusInsideModes } from '../keying/KeyingModeTypes';
import * as AlloyLogger from '../log/AlloyLogger';
import * as AlloyParts from '../parts/AlloyParts';
import * as PartType from '../parts/PartType';
import * as Bubble from '../positioning/layout/Bubble';
import * as Layout from '../positioning/layout/Layout';
import * as LayoutInset from '../positioning/layout/LayoutInset';
import * as LayoutTypes from '../positioning/layout/LayoutTypes';
import * as MaxHeight from '../positioning/layout/MaxHeight';
import * as MaxWidth from '../positioning/layout/MaxWidth';
import {
  AnchorSpec, HotspotAnchorSpec, Layouts, MakeshiftAnchorSpec, NodeAnchorSpec, SelectionAnchorSpec, SubmenuAnchorSpec
} from '../positioning/mode/Anchoring';
import * as VerticalDir from '../positioning/mode/VerticalDir';
import * as FormTypes from '../ui/types/FormTypes';
import * as InlineViewTypes from '../ui/types/InlineViewTypes';
import * as ItemTypes from '../ui/types/ItemTypes'; // not sure if this is the right thing to expose, but we use it a lot?
import * as MenuTypes from '../ui/types/MenuTypes';
import * as SliderTypes from '../ui/types/SliderTypes';
import * as SlotContainerTypes from '../ui/types/SlotContainerTypes';
import * as TabbarTypes from '../ui/types/TabbarTypes';
import * as TieredMenuTypes from '../ui/types/TieredMenuTypes';
import * as AddEventsBehaviour from './behaviour/AddEventsBehaviour';
import { AllowBubbling } from './behaviour/AllowBubbling';
import * as Behaviour from './behaviour/Behaviour';
import { Blocking } from './behaviour/Blocking';
import { Composing } from './behaviour/Composing';
import { Coupling } from './behaviour/Coupling';
import { Disabling } from './behaviour/Disabling';
import { Docking } from './behaviour/Docking';
import { Dragging } from './behaviour/Dragging';
import { DragnDrop } from './behaviour/DragnDrop';
import { Focusing } from './behaviour/Focusing';
import { Highlighting } from './behaviour/Highlighting';
import { Invalidating } from './behaviour/Invalidating';
import { Keying, KeyingConfigSpec } from './behaviour/Keying';
import { Pinching } from './behaviour/Pinching';
import { Positioning } from './behaviour/Positioning';
import { Receiving } from './behaviour/Receiving';
import { Reflecting } from './behaviour/Reflecting';
import { Replacing } from './behaviour/Replacing';
import { Representing } from './behaviour/Representing';
import { Sandboxing } from './behaviour/Sandboxing';
import { Sliding } from './behaviour/Sliding';
import { Streaming } from './behaviour/Streaming';
import { Swapping } from './behaviour/Swapping';
import { Tabstopping } from './behaviour/Tabstopping';
import { Toggling } from './behaviour/Toggling';
import { Tooltipping } from './behaviour/Tooltipping';
import { Transitioning } from './behaviour/Transitioning';
import { Unselecting } from './behaviour/Unselecting';
import { LazySink } from './component/CommonTypes';
import * as CompBehaviours from './component/CompBehaviours';
import * as Component from './component/Component';
import * as ComponentApi from './component/ComponentApi';
import * as ComponentUtil from './component/ComponentUtil';
import * as DomFactory from './component/DomFactory';
import * as GuiFactory from './component/GuiFactory';
import * as GuiTemplate from './component/GuiTemplate';
import * as Memento from './component/Memento';
import * as SketchBehaviours from './component/SketchBehaviours';
import { AlloySpec, ComponentSpec, PremadeSpec, RawDomSchema, SimpleOrSketchSpec, SimpleSpec, SketchSpec } from './component/SpecTypes';
import * as Composite from './composite/Parts';
import * as DragCoord from './data/DragCoord';
import * as AlloyEvents from './events/AlloyEvents';
import * as AlloyTriggers from './events/AlloyTriggers';
import * as NativeEvents from './events/NativeEvents';
import * as SystemEvents from './events/SystemEvents';
import * as FocusManagers from './focus/FocusManagers';
import * as Channels from './messages/Channels';
import * as Attachment from './system/Attachment';
import * as ForeignGui from './system/ForeignGui';
import * as Gui from './system/Gui';
// Test code - should eventually move to a separate project
import * as TestHelpers from './testhelpers/TestHelpers';
import { Button } from './ui/Button';
import { Container } from './ui/Container';
import { CustomList } from './ui/CustomList';
import { DataField } from './ui/DataField';
import { Dropdown } from './ui/Dropdown';
import { ExpandableForm } from './ui/ExpandableForm';
import { FloatingToolbarButton } from './ui/FloatingToolbarButton';
import { Form } from './ui/Form';
import { FormChooser } from './ui/FormChooser';
import { FormCoupledInputs } from './ui/FormCoupledInputs';
import { FormField } from './ui/FormField';
import * as GuiTypes from './ui/GuiTypes';
import { HtmlSelect } from './ui/HtmlSelect';
import { InlineView } from './ui/InlineView';
import { Input } from './ui/Input';
import * as ItemWidget from './ui/ItemWidget';
import { Menu } from './ui/Menu';
import { ModalDialog } from './ui/ModalDialog';
import * as Sketcher from './ui/Sketcher';
import { Slider } from './ui/Slider';
import { SlotContainer } from './ui/SlotContainer';
import { SplitDropdown } from './ui/SplitDropdown';
import { SplitFloatingToolbar } from './ui/SplitFloatingToolbar';
import { SplitSlidingToolbar } from './ui/SplitSlidingToolbar';
import { Tabbar } from './ui/Tabbar';
import { TabButton } from './ui/TabButton';
import { TabSection } from './ui/TabSection';
import { Tabview } from './ui/Tabview';
import { TieredData, tieredMenu as TieredMenu } from './ui/TieredMenu';
import { Toolbar } from './ui/Toolbar';
import { ToolbarGroup } from './ui/ToolbarGroup';
import { TouchMenu } from './ui/TouchMenu';
import { Typeahead } from './ui/Typeahead';
import * as UiSketcher from './ui/UiSketcher';

type AlloyComponent = ComponentApi.AlloyComponent;
type MementoRecord = Memento.MementoRecord;
type Bounds = Boxes.Bounds;

// TODO: naughty non API's being exported
// Type Def Exports
export {
  AriaVoice,
  AddEventsBehaviour,
  Behaviour,
  AllowBubbling,
  Blocking,
  Composing,
  Coupling,
  Disabling,
  Docking,
  Dragging,
  DragnDrop,
  Focusing,
  Highlighting,
  Invalidating,
  Keying,
  KeyingConfigSpec,
  Pinching,
  Positioning,
  Receiving,
  Reflecting,
  Replacing,
  Representing,
  Sandboxing,
  Sliding,
  Streaming,
  Swapping,
  Tabstopping,
  Toggling,
  Tooltipping,
  Transitioning,
  Unselecting,
  CompBehaviours,
  Composite,
  Component,
  ComponentUtil,
  DomFactory,
  GuiFactory,
  GuiTemplate,
  Memento,
  // TODO: Make the memento type "Memento". Will require a lot of changes.
  MementoRecord,
  SketchBehaviours,
  DragCoord,
  AlloyEvents,
  AlloyTriggers,
  NativeEvents,
  SystemEvents,
  FocusManagers,
  Channels,
  Attachment,
  ForeignGui,
  Gui,
  ItemTypes,
  Button,
  Container,
  CustomList,
  DataField,
  Dropdown,
  ExpandableForm,
  Form,
  FormChooser,
  FormCoupledInputs,
  FormField,
  GuiTypes,
  HtmlSelect,
  InlineView,
  Input,
  ItemWidget,
  Menu,
  ModalDialog,
  Sketcher,
  Slider,
  SlotContainer,
  SplitDropdown,
  // Needed for better backwards compatibility
  SplitSlidingToolbar as SplitToolbar,
  SplitFloatingToolbar,
  SplitSlidingToolbar,
  Tabbar,
  TabButton,
  TabSection,
  Tabview,
  TieredMenu,
  TieredData,
  Toolbar,
  ToolbarGroup,
  FloatingToolbarButton,
  TouchMenu,
  Typeahead,
  UiSketcher,
  Fields,

  AlloyParts,
  BehaviourState,
  PartType,
  Bounds,
  Boxes,
  OffsetOrigin,
  EventRoot,
  TapEvent,
  AlloyLogger,
  Debugging,
  FunctionAnnotator,

  AlloySpec,
  AlloyComponent,
  SimpleOrSketchSpec,
  RawDomSchema,
  ComponentSpec,
  SketchSpec,
  SimpleSpec,
  PremadeSpec,
  CustomEvent,
  EventFormat,
  SimulatedEvent,
  NativeSimulatedEvent,
  CustomSimulatedEvent,
  ReceivingEvent,

  // layout
  Layout,
  LayoutInset,
  LayoutTypes,
  Bubble,
  MaxHeight,
  MaxWidth,
  LazySink,
  VerticalDir,

  // types
  TieredMenuTypes,
  MenuTypes,
  InlineViewTypes,
  SlotContainerTypes,
  SliderTypes,
  FormTypes,
  TabbarTypes,
  AnchorSpec,
  NodeAnchorSpec,
  MakeshiftAnchorSpec,
  SelectionAnchorSpec,
  HotspotAnchorSpec,
  SubmenuAnchorSpec,
  DraggingTypes,
  DockingTypes,
  Layouts,

  FocusInsideModes,

  TestHelpers
};
