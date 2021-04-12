Changes made


src/themes/silver/main/ts/ContextToolbar.ts

* introduced two new layout types for docking.
* switched on the order of the docking layouts depending on the current class on contextbar
* had to thread contextbar through to the desktop layouts (would rather handle in alloy)
* logging
* stopping closing on focus lost for easier debugging

alloy/src/main/ts/ephox/alloy/positioning/mode/ContentAnchorCommon.ts

* stopped capRect doing any capping.

alloy/src/main/ts/ephox/alloy/positioning/mode/NodeAnchor.ts

* logging and inline comments

alloy/src/main/ts/ephox/alloy/positioning/view/Bounder.ts

* docked-override for "fitting"
* logging



Problems

- upAvailable sets maxHeight, which puts bubble/caret in wrong position while not quite capped at the edge.
- code is hacked
- all the guantlets aren't really understood.



So the current approach: drawing a context toolbar for a table.

anchor: NodeAnchor linking to node: table.
bounds: editor content area for classic mode





```
Positioning.positionWithinBounds

 - withinBounds: seems to be from src/themes/silver/main/ts/ui/context/ContextToolbarBounds.getContextToolbarBounds. It does a lot of calculations to identify the content area of the editor, based on the editor configuration (inline, fixed toolbar etc.)

This means that the context toolbar will be in the editor area when it has been capped to bounds.

This bounds calculation is passed through many layers until eventually it ends up as the parameter: `getBounds` in `SimpleLayout.simple`. It is then converted to a viewport origin and passed through to `Callouts.layout`, which passed it through to `Bounder.attempts`.

Bounder.attempts is going to try each layout in order until it finds one that fits perfectly. If it doesn't find one that fits perfectly, it will keep going, remembering the "closest fitting" layout so far. Each one is tried through `attempt`, which is passed `bounds`.

`bounds` is then `adjusted by `LayoutBounds.adjustBounds`, which *appears* to be trying to ensure that the bounds are limited by the anchorBox (which in this case is the table node). The restrictions are defined at the layout level.

Meanwhile, another capping occurs. The `placement` function defined by a `NodeAnchor` (which is what table context menu uses), would ensure that the anchor box did not go before (0, 0). This `placement` is used to get the `Anchoring` information for the SimpleLayout. So by the time it gets there, the anchorBox has been capped.

So Anchoring does this:

anchorBox (which is capped now to not be before 0, 0) - but I don't think it should be.
bubble - the bubbles for all directions
overrides
 - maxHeightFunction
 - maxWidthFunction
layouts: list of layouts. The LTR and RTL is already done by the time we make this.
placer: a custom function to replace the one in Positioning. What uses this? We may never actually use it any more.

And the thing that is responsible for that is the type of anchor.

---


