# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

## 14.0.1 - 2023-11-29

### Fixed
- Slider could not be dragged as expected. TINY-10383

## 14.0.0 - 2023-11-22

### Changed
- Updated agar to latest major. #TINY-10275

### Fixed
- Incorrect typing on `DropdownSpec`, `getAnchorOverrides`. Function returns an object, not another function. #TINY-9978
- Going back from a view to the editor in mobile caused an error. #TINY-10003
- Going back from a view to the editor in mobile visualization on browser caused an error. #TINY-10165

## 13.0.0 - 2023-07-12

### Added
- Added new `isBlocked` API to the `Blocking` behaviour.

### Changed
- `ModalDialogApis.getFooter` now returns an `Optional<AlloyComponent>` instead of `AlloyComponent`. #TINY-9996

### Fixed
- Tab navigation did not forward focus over pseudo tab stops. #TINY-9815

## 12.2.0 - 2023-06-12

### Fixed
- Select would in some situations when it was reused or otherwise reset not have an initial selected value when expected to. #TINY-9679
- In dialogs, the `aria-describedby` element would be the body of the dialog. #TINY-9816

### Improved
- `SelectionAnchor` now uses the bounds of table cell selection, if the selection contains more than one table cell. #TINY-8297

### Changed
- Changed `SelectionAnchorSpec.getSelection` to support the selection of both `SimRange` and `SelectionTableCellRange`.

## 12.1.0 - 2023-03-15

### Added
- Added `firstTabstop` optional property to `ModalDialogDetail`, to specify the index of elements to focus on when dialog shows. #TINY-9520
- Exposed `OffsetOrigin` module and `DockingType` type in api main entry point. #TINY-9414

### Changed
-  `aria-activedescendant` attribute for `Typeahead` input component is updated to the menu item that is highlighted. #TINY-9280

### Removed
- Removed `positionWithin` from `Positioning` behaviour's APIs. #TINY-9226
- Removed `showWithin` from `InlineView` sketcher's APIs. #TINY-9226
- Removed unused custom `placer` from `Anchorage`. #TINY-9226

## 12.0.0 - 2022-11-23

### Added
- Added `previousSelector` optional property to `MenuMatrixMovementSpec`, to start with the selected item in focus. #TINY-9283
- Added the `onToggled` callback for the `FloatingToolbarButton` component. #TINY-9271
- Added the `onOpened` and `onClosed` callbacks for the `SplitFloatingToolbar` component. #TINY-9271

### Removed
- Moved `TestStore` to Agar. #TINY-9157

## 11.0.0 - 2022-09-08

### Added
- Added new `retargetAndDispatchWith` API to `AlloyTriggers` to allow for redispatching of events to different targets. #TINY-8952
- Added new `refetch` API to `Dropdown` that triggers a fetch and redraw for the dropdown menu. #TINY-8952
- Added new `onHighlightItem` and `onDehighlightItem` settings to `TieredMenu`. #TINY-8952
- Added new `getExistingCoupled` API to `Coupling` that gets an existing coupled component, but does not create it if it doesn't already exist. #TINY-8952

### Improved
- The `GuiSetup` BDD test helpers now provide a way to create a custom `GuiSystem`.

### Changed
- The `highlightImmediately` setting for `TieredMenu` was replaced with the more granular `highlightOnOpen`. #TINY-8952

### Fixed
- The `lazyViewport` property incorrectly marked the passed component as optional for the `Docking` behaviour.
- The `TypeaheadSpec` type did not correctly extend `InputSpec`.
- The `TypeaheadSpec` type had a typo in the `populateFromBrowse` property.
- The `Highlighting.highlight` API was not properly skipping the target when dehighlighting existing highlighted items. #TINY-8952
- The various models in `Typeahead` were not functioning correctly. #TINY-8952
- The `Typeahead` did not work correctly when its menu was in another mothership. #TINY-8952

### Removed
- The `onHighlight` setting in `TieredMenu` was removed in favour of `onHighlightItem`. #TINY-8952

## 10.1.0 - 2022-06-29

### Added
- Added new `immediateGrow` API to the `Sliding` behaviour #TINY-8710
- Added new `onToggled` callback property to the `Toggling` behaviour configuration #TINY-8602

### Improved
- Toggleable menu items can now be configured as `exclusive` and alloy will ensure only 1 exclusive item is toggled in the menu #TINY-8602

### Changed
- Changed tabbing behavior escape key handling to run from `keydown` to `keyup` to prevent unwanted key event propagation #TINY-7005

### Fixed
- The `fakeFocus` property for `InlineView` menus was not respected.
- The value of togglable elements was not reset if its config was not specified in the definition #TINY-8763

## 10.0.0 - 2022-03-03

### Added
- Added a new `buildOrPatch` function to the `SystemApi` to allow reusing the passed obsoleted dom element.

### Improved
- The `Replacing` and `Reflecting` behaviours will now attempt to reuse existing DOM elements when replacing components. The `reuseDom` config can be used to disable this behaviour for specific components.
- The `GuiSetup` test helper will now keep the elements in the DOM on test failures.

### Changed
- Upgraded to Katamari 9.0, which includes breaking changes to the `Optional` API used in this module.
- Dropdowns now use an "aria-controls" attribute rather than an "aria-owns" attribute when activated.
- Firefox will now use the native `focusin` and `focusout` events instead of capturing the `focus` and `blur` events.
- Horizontal and Vertical slider data is now just a number, instead of objects with single `x` or `y` properties #TINY-8304

### Fixed
- Slider components did not respond to `Representing.setValue` #TINY-8304

### Removed
- Removed support for Microsoft Internet Explorer and legacy Microsoft Edge.

## 9.0.2 - 2021-10-11

### Fixed
- Fixed sketcher behaviours augmenting in the wrong order, which prevented behaviours being revoked.
- Fixed debugging throwing errors.
- `Docking` state could end up incorrect internally, which caused `Docking.refresh()` to not work.

## 9.0.0 - 2021-08-26

### Added
- Added new `focus` property to the `Blocking` behaviour config.
- Added a new `preserve` option to `LayoutInset` which will preserve the previous placement inside the component.
- Added a new `flip` option to `LayoutInset` which will swap the previous placement to the opposite direction inside the component.
- Added the `alwaysFit` layout property which allows for the layout to specify if it should always claim to fit, no matter what.
- `Bubble` can include an optional `inset` class to be added when using an inset layout.
- The `Positioning` behaviour now supports transitioning when changing the position of a component.
- Added a new `reset` API to the `Positioning` behaviour to reset the component back to it's original position.
- The `transitioncancel` event can now be listened to by the alloy event system.

### Improved
- Improved the performance of constructing event handlers and components.
- Improved the performance of split toolbars when there were no groups to render.

### Changed
- All components now expose their `uid`.
- Changed disconnected components to log a warning instead of throwing an error when triggering or broadcasting events.
- Renamed `LayoutInside` to `LayoutInset` to better reflect what it does.
- Changed `LayoutInset` rendering behaviour, as it was inconsistent with other layouts. It will now mirror the `Layout` logic for each direction.
- Renamed the `anchor` property in anchor specs to `type`.
- Changed the `Positioning` behaviour APIs to require a `PlacementSpec` instead of an `AnchorSpec`.
- Changed the `Positioning` behaviour to store the last placement state of each placee component. This is used for determining how a component should transition.
- Upgraded to Katamari 8.0, which includes breaking changes to the `Optional` API used in this module.

### Fixed
- Fixed a number of positioning bugs when using an "inset" layout, especially any that renders at the bottom.
- `LayoutInset` bubble classes were applied incorrectly, causing the bubble arrows to show on the opposite side.
- `MakeshiftAnchorSpec` did not extend `HasLayoutAnchorSpec` which meant layouts couldn't be used for makeshift anchors.
- `TieredMenu` child menus were incorrectly opened when the parent menu item was disabled.
- Fixed selection box creation in `SelectionAnchor` to avoid context menu covering text when multiple lines are selected.

## 8.2.0 - 2021-05-06

### Added
- Added a new `setValue` method to the `SliderUi`. This allows the slider value to be modified without firing a change event.

## 8.1.0 - 2020-11-18

### Added
- Added a `Blocking` behaviour for elements that can enter a busy state

## 8.0.0 - 2020-09-29

### Changed
- Changed some public APIs (eg Components, Custom Events) to no longer be thunked.

### Added
- Added new `isOpen` API to the `SplitFloatingToolbar` and `SplitSlidingToolbar` components.

### Fixed
- Fixed `AriaOwner` not able to find the owner component when rendered within a ShadowRoot.
- Fixed `AriaFocus` not preserving focus when the component is rendered within a ShadowRoot.

## 7.0.2 - 2020-05-25

### Fixed
- Fixed `Tooltipping` behaviour failing to run due to not being listed in the default `alloy.receive` events.

## 7.0.0 - 2020-05-21

### Added
- Added new `isExtraPart` property to `InlineView`. This allows the component to declare an external component as part of itself for dismissal events.
- Added new `getModes` and `setModes` API to the docking behaviour.
- Exposed the `AriaVoice` voice module in the API.

### Changed
- The `AriaOwner` module, `Boxes` module, `Pinching` behaviour and `SnapConfig`/`SnapOutput` specs no longer use thunked functions and instead use the variable directly.
- All uses of `Struct.immutableBag` and `Struct.immutable` have been replaced with readonly interfaces.
- Changed the `Disabling` behaviour to use a lazy `disabled` configuration to determine if the component should be disabled on initial load.

## 6.1.0 - 2020-03-16

### Added

- Added new `isExtraPart` property to `InlineView`. This allows the component to declare an external component as part of itself for dismissal events.

## 6.0.1 - 2020-03-02

### Fixed

- Fixed `Bounder` incorrectly calculating the bottom/right limits, due to not taking into account the element size.
- Fixed `LayoutInside` incorrectly placing items in the opposite direction.

## 6.0.0 - 2020-02-13

### Removed
- Removed `getMoreButton` and `getOverflow` methods from the `SplitSlidingToolbar` component.
- Removed `getMoreButton` method from the `SplitFloatingToolbar` component.
- Removed `getAnchor` configuration from the `SplitFloatingToolbar` component.
- Removed `SugarEvent` from exports list.
- Removed `leftAttr`, `topAttr` and `positionAttr` options from the `Docking` behavior.

### Added
- Added new `FloatingToolbar` component.
- Added new vertical directionality for layouts
- Added `setGroups` and `toggle` methods and `getBounds` configuration to the `FloatingToolbarButton` component.

### Changed
- Moved modules from "alien" folder into Sugar, Katamari and other folders in Alloy.
- Changed `Docking` to use `bottom` instead of `top` when docking to the bottom of the viewport.
- Changed `Docking` to restore the position when undocking using styles which it was previously positioned with.

## 5.1.0 - 2019-12-17

### Added
- Added new `mouseOrTouch` mode to dragging to support dragging for both mouse and touch events.

### Changed
- Changed touch/mouse event handling to work with hybrid devices that accept both mouse and touch events.
- Changed `AlloyEvents.runActionExtra()` to pass the simulated event to the callback.

### Fixed
- Fixed the `Slider` component not working in some cases on touch devices.

## 5.0.7 - 2019-12-02

### Fixed
- Improved `Docking` scroll performance by only calculating the offset origin as required.

## 5.0.2 - 2019-11-11

### Fixed
- Fixed `TouchDragging` behaviour triggering drag on any document touchmove event.
- Fixed dragging updating start state on window scroll, when dragging hadn't started.
- Fixed menu item execute not killing the original mouse or touch event.
- Fixed touchstart events bubbling up from buttons.

## 5.0.1 - 2019-10-25

### Fixed
- Fixed clicking on the modal dialog blocker component focusing the document body.

## 5.0.0 - 2019-10-17

### Added
- Added `mustSnap` configuration to `Dragging` to force draggables to snapping points.
- Added the ability to calculate a max width to `Bounder` though defaulted it to a no-op.
- Added `MaxWidth` export for use in anchor overrides.
- Added `onDocked`, `onUndocked`, `onShow`, `onShown`, `onHide` and `onHidden` configuration callbacks for the `Docking` behaviour.
- Added `modes` configuration to `Docking` to control where the component should be docked. eg: `top` or `bottom` of the viewport.
- Added `isDocked` and `reset` APIs to `Docking` to check if a component is docked and to reset the stored original position and state.
- Added reposition APIs for `TieredMenu`, `Dropdown`, `InlineView`, `SplitDropdown` and `SplitFloatingToolbar` components.
- Added new reposition channel to notify sandboxed components that they should reposition.
- Added `onOpened` and `onClosed` configuration callbacks for the `SplitSlidingToolbar` component.
- Added `getOverflowBounds` configuration to the `SplitFloatingToolbar` component.

### Changed
- Reworked the `Docking` behaviour to support both absolute and static positioning.
- Changed the `Docking` behaviours `lazyContext` configuration to require a `Bounds` be returned instead of an `Element`.
- Changed the `Positioning` behaviours `useFixed` configuration to require a `Function` instead of a `boolean`.
- Changed `Boxes.win` to use the visual viewport API where available to determine the window bounds.

### Fixed
- Fixed `Docking` not undocking to the correct position when a parent was using `position: relative`.
- Fixed `Docking` not undocking to the correct position when the window has been resized.
- Fixed replacing and reflecting losing component state when replacing with the same components.
- Fixed `MakeshiftAnchor` incorrectly calculating the anchor coordinates in fixed position mode.
- Fixed custom position bounds being ignored in fixed position mode.
- Fixed incorrect right/bottom positioning in fixed mode when a scrollbar is visible.
- Fixed `Positioning` placing the element off the page or out of view when the anchor point is out of bounds.

## 4.15.25 - 2019-09-18

### Fixed

- Fixed dragging being blocked when scrolled and not at the bottom of the viewport.

## 4.15.2 - 2019-07-31

### Added
- Added `useNative` option to Disabling to allow for buttons, textareas, inputs and select to be "fake-disabled" instead of using the native disabled attribute.

## 4.15.1 - 2019-07-30

### Changed
- Changed tabbing behaviour to not try to tab to disabled elements by default.

## 4.15.0 - 2019-07-23

### Added
- Added `getBounds` property to the dragging behaviour to prevent dragging outside the specified bounds.

### Changed
- Changed dragging behaviour to prevent dragging outside the window by default.

## 4.14.0 - 2019-07-11

### Added
- Added `onDisabled` and `onEnabled` callbacks to the disabling behaviour.
- Added new `positionWithinBounds` positioning API to allow positioning with a custom bounding box.
- Exposed `Boxes` module and `Bounds` type in api main entry point.

### Fixed
- Fixed disabling `select` elements not using the `disabled` attribute.
- Fixed `LayoutInside` bubbling inverting where the bubble should be placed.

## 4.13.0 - 2019-06-06

### Added
- Added new Custom List ui component.

## 4.12.1 - 2019-05-17

### Added
- Exposed the DragnDrop behaviour in the api main entry point.

## 4.12.0 - 2019-04-30

### Changed
- Broke the `SplitToolbar` component into separate self contained components, so it now has a separate component for floating (`SplitFloatingToolbar`) and sliding (`SplitSlidingToolbar`).

### Fixed
- Improved the `SplitToolbar` component accessibility for floating toolbars.

## 4.11.18 - 2019-04-30
### Added
- Added `AnchorOverrides` to all remaining Anchors and AnchorSpecs, as well as dropdowns

## 4.11.15 - 2019-04-26
### Fixed
- Fixed aria attributes for typeahead text fields

### Added
- Added `AnchorOverrides` to the SubmenuAnchor and SubmenuAnchorSpec

## 4.11.11 - 2019-04-16
### Added
- Added new AllowBubbling behaviour

## 4.11.9 - 2019-04-15
### Added
- Added `Disabling.set(comp, disabled)` function to handle setting the disabled state based on a boolean value

## 4.11.7 - 2019-04-12
### Added
- Tests for native DragnDrop behaviour

### Changed
- Draggable items without a provided setData function will no longer mutate dataTransfer

## 4.11.1 - 2019-04-10
### Changed
- Made footers an optional part in modal dialogs

## 4.11.0 - 2019-04-04
### Added
- Added new DragnDrop behaviour for support of browser native drag/drop

## 4.10.7 - 2019-03-15
### Added
- Keyboard navigation for sliding split toolbars

## 4.10.4 - 2019-03-04
### Fixed
- Input components defaulted to using an invalid type attribute

## 4.10.0 - 2019-02-26
### Added
- Floating mode for SplitToolbars

## 4.9.15 - 2019-02-19
### Added
- Aria-describedby to be set as content id on modal dialogs

## 4.9.11 - 2019-02-12
### Added
- Toggling behaviour to SplitToolbar's overflow button

## 4.9.4 - 2019-02-07
### Added
- Refresh method to Sliding behaviour

## 4.9.1 - 2019-01-31
### Added
- Exported additional types used in TinyMCE 5
- GuiSetup and TestStore are now available under a "TestHelpers" export, very useful for testing projects that use Alloy UI

## 4.8.5 - 2019-01-31
### Changed
- All fetch callbacks now return a Future Option

## 4.8.3 - 2019-01-29
### Added
- Added the windowResize system event

## 4.8.0 - 2019-01-18
### Added
- New events for highlight and dehighlight

### Changed
- Tooltips can now follow highlights by setting the mode to 'follow-highlight'

### Fixed
- Listed additional events in the event ordering
- Ensured that a highlighted item will not be first dehighlighted

## 4.7.3 - 2019-01-24
### Added
 - Added bubble support for hotspot anchors

## 4.7.0 - 2019-01-18
### Added
 - Added more flexible tooltip behaviour.

## 4.6.11 - 2019-01-10
### Added
 - Added `postPaste` event to SystemEvents.

## 4.6.8 - 2019-01-10
### Changed
 - Dropdowns now default the type attribute to "button" when the dom tag is a button

## 4.6.2 - 2018-12-12
### Fixed
 - SplitButtons now use span elements for their buttons for accessibility

## 4.6.0 - 2018-12-11
### Added
 - New configuration parameter for Keying configs which controls when to focus inside: "focusInside"

### Changed
 - Handling of focusIn for keying configs

## 4.5.1 - 2018-12-06
### Fixed
 - ModalDialog now correctly sets the "aria-modal" attribute

## 4.5.0 - 2018-12-05
### Added
 - Tiered menus handle toggling aria-expanded as submenus are opened and closed

### Changed
 - Updated the toggling behaviour to make the toggleClass optional
 - Reworked SplitDropdown so that it's treated as a single button from keyboard navigation and aria perspectives

## 4.4.3 - 2018-11-26
### Changed
 - alloy UIDs are random (again) to prevent issues with nested motherships loaded with different scripts

### Fixed
 - Sliding shrinking and growing classes were not being removed when toggling mid-animation

## 4.4.1 - 2018-11-22
### Changed
 - Bounder will now attempt to corral the element within the provided bounds

## 4.4.0 - 2018-11-21
### Changed
 - Dropdowns no longer set the aria-pressed attribute on the button

## 4.3.0 - 2018-11-05
### Added
 - Exposed a new LazySink type

### Changed
 - The lazySink function now takes a component as an argument
 - A new getApis() method for running individual APIs on components

## 4.2.0 - 2018-11-02
### Added
 - Exposed NodeAnchorSpec type

## 4.1.0 - 2018-11-01
### Added
 - Typeahead specification now may have an onSetValue handler

## 4.0.0 - 2018-10-30
### Changed
 - All sketcher configs are no longer wrapped in functions
 - Only non-button HTML tags get a role of button
 - TieredMenu submenus are built on-demand and then cached

## 3.52.0 - 2018-10-25
### Added
 - Label part for sliders

## 3.51.0 - 2018-10-25
### Changed
 - Window scroll events are not automatically detected by the mothership

## 3.50.0 - 2018-10-22
### Added
 - NodeAnchor positioning mode

## 3.49.0 - 2018-10-18
### Fixed
 - Backspace keys are no longer swallowed in content-editable sections

## 3.48.0 - 2018-10-17
### Added
 - positionWithin API to Positioning behaviour and showWithin API to InlineView sketcher, allowing positioning within bounds without prior configuration

## 3.47.0 - 2018-10-10
### Added
 - layouts property to dropdown, split dropdown and type ahead specs, to modify the position of the resulting menu of these components.

## 3.46.0 - 2018-09-28
### Added
 - useMinWidth property to dropdown and split dropdown specs, to modify matchWidth's behaviour. When true, matchWidth sets min-width, when false it sets width.

## 3.45.6 - 2018-09-28
### Remove
 - Hard-coded background color of blocker

## 3.45.4 - 2018-09-25
### Fixed
 - Origins are calculated after preprocessing both the positioning container and the component to be placed

## 3.45.2 - 2018-09-25
### Fixed
 - East and West layouts now have a top value

## 3.45.0 - 2018-09-24
### Changed
 - When previewing in a typeahead, pressing *enter* fires an execute

## 3.44.0 - 2018-09-21
### Fixed
 - Keyboard navigating through the toolbar now skips disabled buttons.

## 3.43.0 - 2018-09-21
### Added
 - ModalDialog blocker part now can take components to put *before* dialog

### Changed
 - Group Part types now use a factory if present

## 3.42.0 - 2018-09-20
### Added
 - Alloy listens to the keyup event

### Changed
 - Keying behaviours that handle space cancel space on keyup. Helps to prevent a firefox issue with buttons

## 3.41.0 - 2018-09-20
### Added
 - Exposed Layout and Bubble through Main
 - Additional Layout options: east and west
 - Configuration classes for different bubbles positions

### Changed
 - Layout names in the private API have changed
 - Bubble data structure format

## 3.40.0 - 2018-09-20
### Changed
 - Positioning logic refactor.

## 3.39.3 - 2018-09-19
### Fixed
 - Correct argument is passed through for `item` in itemExecute in Typeahead
 - Internal event Typeahead itemExecute is handled when dismissOnBlur is false

## 3.39.0 - 2018-09-17
### Removed
 - Shorthands `type` and `placeholder` from Input

## 3.38.0 - 2018-09-17
### Added
 - Function `onItemExecute` to Typeahead

## 3.37.0 - 2018-09-17
### Added
 - Event `focusout` to NativeEvents

## 3.36.0 - 2018-09-14
### Added
 - InlineView has new API method: setContent

## 3.35.0 - 2018-09-14
### Changed
 - Typeahead now lets `onEscape` and `onEnter` events bubble when sandbox is closed

## 3.34.0 - 2018-09-13
### Added
 - Function `attachSystemAfter` to Attachment so a `GuiSystem` can be attached as a sibling

## 3.33.0 - 2018-09-12
### Added
 - Group parts have a `preprocess` configuration

### Fixed
 - Sliding listens to transition events from itself, not the animation root

### Changed
 - Modal Dialog busy container is now inside the Modal Dialog container
 - ModalDialog callback in `setBusy` API is no longer passed the existing dialog styles

### Removed
 - Menu movement configuration options for laying out item components. Use group `preprocess` instead


## 3.32.0 - 2018-09-11
### Fixed
 - Sliding behaviour now handles rapidly switching between expanding and shrinking

## 3.31.0 - 2018-09-11
### Changed
 - `text` property is now in `meta` for Items

## 3.30.0 - 2018-09-10
### Added
 - Created a Dropdown API with isOpen, close, expand, open
 - New event `focusShifted` that is fired by the FocusManager in Keying
 - Representing config to the Dropdown sandbox to store the triggering Dropdown

### Changed
 - Hover behaviour on menus now shows the expanded menu, but doesn't focus it
 - Renamed unused config `openImmediately` to `highlightImmediately` and made TieredMenus always open

## 3.29.0 - 2018-09-07
### Added
 - Docking.refresh() to recalculate the component's position and visibility

## 3.28.0 - 2018-09-06
### Added
- Expanded the SlotContainer API to add:
  - getSlotNames
  - isShowing
  - hideAllSlots
### Fixed
 - Sandbox cloaking no longer enforces position when no position attributes are applied.

## 3.27.0 - 2018-09-06
### Fixed
 - Fixed Sliding behaviour responding to transitionend on nested elements
 - Fixed types on Sliding behavior API

## 3.26.0 - 2018-09-05
### Added
 - data alloy identifiers to the DOM nodes themselves. They are no longer in the
 visible HTML

## 3.25.0 - 2018-09-05
### Added
 - dynamic configuration of debugging modes

## 3.24.0 - 2018-09-04
### Added
 - InlineView.showMenuAt() to special-case positioning for inline menus
 - Sandboxing.openWhileCloaked() convenience method

## 3.23.0 - 2018-08-31
### Added
 - eventOrder for Dropdowns
 - extra debugging information

## 3.22.0 - 2018-08-29
### Added
 - dragging behaviour flag for repositionTarget (defaults to true)
 - dragging behaviour handler (onDrag)

## 3.21.0 - 2018-08-29
### Added
 - onChoose event to Sliders

## 3.20.0 - 2018-08-28
### Added
 - Replacing.replaceAt and Replacing.replaceBy

## 3.19.0 - 2018-08-23
### Added
 - Tooltipping API access to hideAllExclusive, and tooltipComponents in config
 - DomFactory.simple and DomFactory.dom for quick generation of basic AlloySpec objects
 - InlineView API: getContent
 - Readable state for Flatgrid Keying types
 - Support for matrix-style menus
 - Consistent definitions for itemBehaviours and widgetBehaviours
 - IgnoreFocus capability for item widgets
 - Exposing onChangeTab and onDismissTab through TabSectionTypes
 - Chain methods for TestStore

## 3.18.0 - 2018-08-20
### Added
 - selectClasses and selectAttributes to HtmlSelect sketcher

## 3.17.0 - 2018-08-10
### Added
 - Configuration for InlineView: fireDismissalEventInstead
 - SystemEvents.dismissRequested()

## 3.16.0 - 2018-08-08
### Added
- Reflecting behaviour
- ModalDialog getFooter API
- Exported AlloyComponent and renamed MomentoRecord to MementoRecord

## 3.15.0 - 2018-08-03
### Added
- Typeahead, SplitDropdown: getHotspot option

## 3.14.0 - 2018-08-01
### Added
- SlotContainer: new sketcher

## 3.13.0 - 2018-08-01
### Added
- ModalDialog setIdle and setBusy API

## 3.12.0 - 2018-08-01
### Added
- Alloy listens to paste event

## 3.11.0 - 2018-07-31
### Added
- Highlighting.getCandidates API
- TabSection showTab API

## 3.10.0 - 2018-07-31
### Added
- Changelog.
- The capability to set dropdown anchor points to something other than the drop button.
