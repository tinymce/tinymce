# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

# [8.0.0] - 2020-09-29

### Changed
- Changed some public APIs (eg Components, Custom Events) to no longer be thunked.

### Added
- Added new `isOpen` API to the `SplitFloatingToolbar` and `SplitSlidingToolbar` components.

### Fixed
- Fixed `AriaOwner` not able to find the owner component when rendered within a ShadowRoot.
- Fixed `AriaFocus` not preserving focus when the component is rendered within a ShadowRoot.

# [7.0.2] - 2020-05-25

### Fixed
- Fixed `Tooltipping` behaviour failing to run due to not being listed in the default `alloy.receive` events.

# [7.0.0] - 2020-05-21

### Added
- Added new `isExtraPart` property to `InlineView`. This allows the component to declare an external component as part of itself for dismissal events.
- Added new `getModes` and `setModes` API to the docking behaviour.
- Exposed the `AriaVoice` voice module in the API.

### Changed
- The `AriaOwner` module, `Boxes` module, `Pinching` behaviour and `SnapConfig`/`SnapOutput` specs no longer use thunked functions and instead use the variable directly.
- All uses of `Struct.immutableBag` and `Struct.immutable` have been replaced with readonly interfaces.
- Changed the `Disabling` behaviour to use a lazy `disabled` configuration to determine if the component should be disabled on initial load.

# [6.1.0] - 2020-03-16

### Added

- Added new `isExtraPart` property to `InlineView`. This allows the component to declare an external component as part of itself for dismissal events.

# [6.0.1] - 2020-03-02

### Fixed

- Fixed `Bounder` incorrectly calculating the bottom/right limits, due to not taking into account the element size.
- Fixed `LayoutInside` incorrectly placing items in the opposite direction.

# [6.0.0] - 2020-02-13

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

# [5.1.0] - 2019-12-17

### Added
- Added new `mouseOrTouch` mode to dragging to support dragging for both mouse and touch events.

### Changed
- Changed touch/mouse event handling to work with hybrid devices that accept both mouse and touch events.
- Changed `AlloyEvents.runActionExtra()` to pass the simulated event to the callback.

### Fixed
- Fixed the `Slider` component not working in some cases on touch devices.

# [5.0.7] - 2019-12-02

### Fixed
- Improved `Docking` scroll performance by only calculating the offset origin as required.

# [5.0.2] - 2019-11-11

### Fixed
- Fixed `TouchDragging` behaviour triggering drag on any document touchmove event.
- Fixed dragging updating start state on window scroll, when dragging hadn't started.
- Fixed menu item execute not killing the original mouse or touch event.
- Fixed touchstart events bubbling up from buttons.

# [5.0.1] - 2019-10-25

### Fixed
- Fixed clicking on the modal dialog blocker component focusing the document body.

# [5.0.0] - 2019-10-17

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

# [4.15.25] - 2019-09-18

### Fixed

- Fixed dragging being blocked when scrolled and not at the bottom of the viewport.

# [4.15.2] - 2019-07-31

### Added
- Added `useNative` option to Disabling to allow for buttons, textareas, inputs and select to be "fake-disabled" instead of using the native disabled attribute.

# [4.15.1] - 2019-07-30

### Changed
- Changed tabbing behaviour to not try to tab to disabled elements by default.

# [4.15.0] - 2019-07-23

### Added
- Added `getBounds` property to the dragging behaviour to prevent dragging outside the specified bounds.

### Changed
- Changed dragging behaviour to prevent dragging outside the window by default.

# [4.14.0] - 2019-07-11

### Added
- Added `onDisabled` and `onEnabled` callbacks to the disabling behaviour.
- Added new `positionWithinBounds` positioning API to allow positioning with a custom bounding box.
- Exposed `Boxes` module and `Bounds` type in api main entry point.

### Fixed
- Fixed disabling `select` elements not using the `disabled` attribute.
- Fixed `LayoutInside` bubbling inverting where the bubble should be placed.

# [4.13.0] - 2019-06-06

### Added
- Added new Custom List ui component.

# [4.12.1] - 2019-05-17

### Added
- Exposed the DragnDrop behaviour in the api main entry point.

# [4.12.0] - 2019-04-30

### Changed
- Broke the `SplitToolbar` component into separate self contained components, so it now has a separate component for floating (`SplitFloatingToolbar`) and sliding (`SplitSlidingToolbar`).

### Fixed
- Improved the `SplitToolbar` component accessibility for floating toolbars.

# [4.11.18] - 2019-04-30
### Added
- Added `AnchorOverrides` to all remaining Anchors and AnchorSpecs, as well as dropdowns

# [4.11.15] - 2019-04-26
### Fixed
- Fixed aria attributes for typeahead text fields

### Added
- Added `AnchorOverrides` to the SubmenuAnchor and SubmenuAnchorSpec

# [4.11.11] - 2019-04-16
### Added
- Added new AllowBubbling behaviour

# [4.11.9] - 2019-04-15
### Added
- Added `Disabling.set(comp, disabled)` function to handle setting the disabled state based on a boolean value

# [4.11.7] - 2019-04-12
### Added
- Tests for native DragnDrop behaviour

### Changed
- Draggable items without a provided setData function will no longer mutate dataTransfer

# [4.11.1] - 2019-04-10
### Changed
- Made footers an optional part in modal dialogs

# [4.11.0] - 2019-04-04
### Added
- Added new DragnDrop behaviour for support of browser native drag/drop

# [4.10.7] - 2019-03-15
### Added
- Keyboard navigation for sliding split toolbars

# [4.10.4] - 2019-03-04
### Fixed
- Input components defaulted to using an invalid type attribute

# [4.10.0] - 2019-02-26
### Added
- Floating mode for SplitToolbars

# [4.9.15] - 2019-02-19
### Added
- Aria-describedby to be set as content id on modal dialogs

# [4.9.11] - 2019-02-12
### Added
- Toggling behaviour to SplitToolbar's overflow button

# [4.9.4] - 2019-02-07
### Added
- Refresh method to Sliding behaviour

# [4.9.1] - 2019-01-31
### Added
- Exported additional types used in TinyMCE 5
- GuiSetup and TestStore are now available under a "TestHelpers" export, very useful for testing projects that use Alloy UI

# [4.8.5] - 2019-01-31
### Changed
- All fetch callbacks now return a Future Option

# [4.8.3] - 2019-01-29
### Added
- Added the windowResize system event

# [4.8.0] - 2019-01-18
### Added
- New events for highlight and dehighlight

### Changed
- Tooltips can now follow highlights by setting the mode to 'follow-highlight'

### Fixed
- Listed additional events in the event ordering
- Ensured that a highlighted item will not be first dehighlighted

# [4.7.3] - 2019-01-24
### Added
 - Added bubble support for hotspot anchors

# [4.7.0] - 2019-01-18
### Added
 - Added more flexible tooltip behaviour.

# [4.6.11] - 2019-01-10
### Added
 - Added `postPaste` event to SystemEvents.

# [4.6.8] - 2019-01-10
### Changed
 - Dropdowns now default the type attribute to "button" when the dom tag is a button

# [4.6.2] - 2018-12-12
### Fixed
 - SplitButtons now use span elements for their buttons for accessibility

# [4.6.0] - 2018-12-11
### Added
 - New configuration parameter for Keying configs which controls when to focus inside: "focusInside"

### Changed
 - Handling of focusIn for keying configs

# [4.5.1] - 2018-12-06
### Fixed
 - ModalDialog now correctly sets the "aria-modal" attribute

# [4.5.0] - 2018-12-05
### Added
 - Tiered menus handle toggling aria-expanded as submenus are opened and closed

### Changed
 - Updated the toggling behaviour to make the toggleClass optional
 - Reworked SplitDropdown so that it's treated as a single button from keyboard navigation and aria perspectives

# [4.4.3] - 2018-11-26
### Changed
 - alloy UIDs are random (again) to prevent issues with nested motherships loaded with different scripts

### Fixed
 - Sliding shrinking and growing classes were not being removed when toggling mid-animation

# [4.4.1] - 2018-11-22
### Changed
 - Bounder will now attempt to corral the element within the provided bounds

# [4.4.0] - 2018-11-21
### Changed
 - Dropdowns no longer set the aria-pressed attribute on the button

# [4.3.0] - 2018-11-05
### Added
 - Exposed a new LazySink type

### Changed
 - The lazySink function now takes a component as an argument
 - A new getApis() method for running individual APIs on components

# [4.2.0] - 2018-11-02
### Added
 - Exposed NodeAnchorSpec type

# [4.1.0] - 2018-11-01
### Added
 - Typeahead specification now may have an onSetValue handler

# [4.0.0] - 2018-10-30
### Changed
 - All sketcher configs are no longer wrapped in functions
 - Only non-button HTML tags get a role of button
 - TieredMenu submenus are built on-demand and then cached

# [3.52.0] - 2018-10-25
### Added
 - Label part for sliders

# [3.51.0] - 2018-10-25
### Changed
 - Window scroll events are not automatically detected by the mothership

## [3.50.0] - 2018-10-22
### Added
 - NodeAnchor positioning mode

## [3.49.0] - 2018-10-18
### Fixed
 - Backspace keys are no longer swallowed in content-editable sections

## [3.48.0] - 2018-10-17
### Added
 - positionWithin API to Positioning behaviour and showWithin API to InlineView sketcher, allowing positioning within bounds without prior configuration

## [3.47.0] - 2018-10-10
### Added
 - layouts property to dropdown, split dropdown and type ahead specs, to modify the position of the resulting menu of these components.

## [3.46.0] - 2018-09-28
### Added
 - useMinWidth property to dropdown and split dropdown specs, to modify matchWidth's behaviour. When true, matchWidth sets min-width, when false it sets width.

## [3.45.6] - 2018-09-28
### Remove
 - Hard-coded background color of blocker

## [3.45.4] - 2018-09-25
### Fixed
 - Origins are calculated after preprocessing both the positioning container and the component to be placed

## [3.45.2] - 2018-09-25
### Fixed
 - East and West layouts now have a top value

## [3.45.0] - 2018-09-24
### Changed
 - When previewing in a typeahead, pressing *enter* fires an execute

## [3.44.0] - 2018-09-21
### Fixed
 - Keyboard navigating through the toolbar now skips disabled buttons.

## [3.43.0] - 2018-09-21
### Added
 - ModalDialog blocker part now can take components to put *before* dialog

### Changed
 - Group Part types now use a factory if present

## [3.42.0] - 2018-09-20
### Added
 - Alloy listens to the keyup event

### Changed
 - Keying behaviours that handle space cancel space on keyup. Helps to prevent a firefox issue with buttons

## [3.41.0] - 2018-09-20
### Added
 - Exposed Layout and Bubble through Main
 - Additional Layout options: east and west
 - Configuration classes for different bubbles positions

### Changed
 - Layout names in the private API have changed
 - Bubble data structure format

## [3.40.0] - 2018-09-20
### Changed
 - Positioning logic refactor.

## [3.39.3] - 2018-09-19
### Fixed
 - Correct argument is passed through for `item` in itemExecute in Typeahead
 - Internal event Typeahead itemExecute is handled when dismissOnBlur is false

## [3.39.0] - 2018-09-17
### Removed
 - Shorthands `type` and `placeholder` from Input

## [3.38.0] - 2018-09-17
### Added
 - Function `onItemExecute` to Typeahead

## [3.37.0] - 2018-09-17
### Added
 - Event `focusout` to NativeEvents

## [3.36.0] - 2018-09-14
### Added
 - InlineView has new API method: setContent

## [3.35.0] - 2018-09-14
### Changed
 - Typeahead now lets `onEscape` and `onEnter` events bubble when sandbox is closed

## [3.34.0] - 2018-09-13
### Added
 - Function `attachSystemAfter` to Attachment so a `GuiSystem` can be attached as a sibling

## [3.33.0] - 2018-09-12
### Added
 - Group parts have a `preprocess` configuration

### Fixed
 - Sliding listens to transition events from itself, not the animation root

### Changed
 - Modal Dialog busy container is now inside the Modal Dialog container
 - ModalDialog callback in `setBusy` API is no longer passed the existing dialog styles

### Removed
 - Menu movement configuration options for laying out item components. Use group `preprocess` instead


## [3.32.0] - 2018-09-11
### Fixed
 - Sliding behaviour now handles rapidly switching between expanding and shrinking

## [3.31.0] - 2018-09-11
### Changed
 - `text` property is now in `meta` for Items

## [3.30.0] - 2018-09-10
### Added
 - Created a Dropdown API with isOpen, close, expand, open
 - New event `focusShifted` that is fired by the FocusManager in Keying
 - Representing config to the Dropdown sandbox to store the triggering Dropdown

### Changed
 - Hover behaviour on menus now shows the expanded menu, but doesn't focus it
 - Renamed unused config `openImmediately` to `highlightImmediately` and made TieredMenus always open

## [3.29.0] - 2018-09-07
### Added
 - Docking.refresh() to recalculate the component's position and visibility

## [3.28.0] - 2018-09-06
### Added
- Expanded the SlotContainer API to add:
  - getSlotNames
  - isShowing
  - hideAllSlots
### Fixed
 - Sandbox cloaking no longer enforces position when no position attributes are applied.

## [3.27.0] - 2018-09-06
### Fixed
 - Fixed Sliding behaviour responding to transitionend on nested elements
 - Fixed types on Sliding behavior API

## [3.26.0] - 2018-09-05
### Added
 - data alloy identifiers to the DOM nodes themselves. They are no longer in the
 visible HTML

## [3.25.0] - 2018-09-05
### Added
 - dynamic configuration of debugging modes

## [3.24.0] - 2018-09-04
### Added
 - InlineView.showMenuAt() to special-case positioning for inline menus
 - Sandboxing.openWhileCloaked() convenience method

## [3.23.0] - 2018-08-31
### Added
 - eventOrder for Dropdowns
 - extra debugging information

## [3.22.0] - 2018-08-29
### Added
 - dragging behaviour flag for repositionTarget (defaults to true)
 - dragging behaviour handler (onDrag)

## [3.21.0] - 2018-08-29
### Added
 - onChoose event to Sliders

## [3.20.0] - 2018-08-28
### Added
 - Replacing.replaceAt and Replacing.replaceBy

## [3.19.0] - 2018-08-23
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

## [3.18.0] - 2018-08-20
### Added
 - selectClasses and selectAttributes to HtmlSelect sketcher

## [3.17.0] - 2018-08-10
### Added
 - Configuration for InlineView: fireDismissalEventInstead
 - SystemEvents.dismissRequested()

## [3.16.0] - 2018-08-08
### Added
- Reflecting behaviour
- ModalDialog getFooter API
- Exported AlloyComponent and renamed MomentoRecord to MementoRecord

## [3.15.0] - 2018-08-03
### Added
- Typeahead, SplitDropdown: getHotspot option

## [3.14.0] - 2018-08-01
### Added
- SlotContainer: new sketcher

## [3.13.0] - 2018-08-01
### Added
- ModalDialog setIdle and setBusy API

## [3.12.0] - 2018-08-01
### Added
- Alloy listens to paste event

## [3.11.0] - 2018-07-31
### Added
- Highlighting.getCandidates API
- TabSection showTab API

## [3.10.0] - 2018-07-31
### Added
- Changelog.
- The capability to set dropdown anchor points to something other than the drop button.
