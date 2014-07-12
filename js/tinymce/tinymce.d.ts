declare module tinymce {
    export var PluginManager: AddOnManager;

    export function each(object: Object, callback: (item: any) => void, scope?: Object): void;

    export interface AddOnManager {
        constructor(): AddOnManager;
        get(name: string): Plugin;
        dependencies(name: string): any;
        requireLangPack(name: string, languages?: string): void;
        add(id: string, addOn: Plugin, dependencies?: any): Plugin;
        addComponents(pluginName: string, scripts: string[]): void;
        load(name: string, addOnUrl: string, callback?: () => void, scope?: Object): void;
        // Todo: createUrl()
    }

    export interface Theme {
        renderUI(obj: Object): Object; // Todo: Param + return-type may be specified more detailled
    }

    export interface Plugin {
        // Todo: Docs say this is a pseudo-class ..
    }

    /*
    export interface Event {
        type: string;
        isDefaultPrevented(): boolean;
        isImmediatePropagationStopped(): boolean;
        isPropagationStopped(): boolean;
        preventDefault(): void;
        stopImmediatePropagation(): void;
        stopPropagation():  void;
    }

    export interface ContentEvent extends Event {
        content: string;
        element: DOMElement;
        format: string;
        get: boolean;
        load: boolean;
        save: boolean;
        set: boolean;
    }

    export interface CommandEvent extends Event {
        command: string;
        ui: boolean;
        value: any; // Todo: Correct? Docs say "Object"
    }

    export interface ProgressStateEvent extends Event {
        state: boolean;
        time: number;
    }

    export interface FocusEvent extends Event {
        blurredEditor: Editor;
        focusedEditor: Editor;
    }

    export interface ResizeEvent extends Event {
        height: Number;
        target: DOMElement;
        width: Number;
    }
    */

    export interface Editor {
        // $: dom.DomQuery;
        baseURI: util.URI;
        contentCSS: string[];
        contentStyles: string[];
        documentBaseURI: util.URI;
        dom: dom.DOMUtils;
        formatter: Formatter;
        id: string;
        initialized: boolean;
        isNotDirty: boolean;
        parser: html.DomParser;
        plugins: Object;
        schema: html.Schema;
        selection: dom.Selection;
        serializer: dom.Serializer;
        settings: Object;
        theme: Theme;
        undoManager: UndoManager;
        windowManager: WindowManager;

        // Todo: Events

        constructor(id: string, settings: Object, editorManager: EditorManager);
        addButton(name: string, settings: Object): void; // Todo: Specify settings structure
        addCommand(name: string, callback: () => void, scope?: Object): void; // Todo: Callback type
        addMenuItem(name: string, settings: Object): void; // Todo: Specify settings structre
        addQueryStateHandler(name: string, callback: () => void, scope?: Object): void; // Todo: Callback type
        addQueryValueHandler(name: string, callback: () => void, scope?: Object): void; // Todo: Callback type
        addShortcut(pattern: string, desc: string, cmdFunc: string, sc?: Object): void;
        addShortcut(pattern: string, desc: string, cmdFunc: () => void, sc?: Object): void; // Todo: Callback parameters?
        addVisual(elm?: Element): void;
        convertURL(url: string, name: string, elm: string): string;
        convertURL(url: string, name: string, elm: HTMLElement): string;
        destroy(automatic?: boolean): void;
        execCallback(name: string): any;
        execCommand(cmd: string, ui?: boolean, value?: any, a?: Object): void;
        fire(); // Todo: No docs ...
        focus(skip_focus: boolean): void;
        getBody(): Element;
        getContainer(): Element;
        getContent(args?: Object): string; // Todo: Specify args structure
        getContentAreaContainer(): Element;
        getDoc(): Document;
        getElement(): Element;
        getLang(name: string, defaultVal?: string): void; // Todo: Return type must be wrong
        getParam(name: string, defaultVal?: string, type?: string): string;
        getWin(): Window;
        hasEventListeners(); // Todo: no docs ...
        hide(): void;
        init(): void;
        insertContent(content: string, args?: Object): void;
        isDirty(): boolean;
        isHidden(): boolean;
        load(args?: any): string; // Todo: Any correct or Object?
        nodeChanged(args?: any): void; // Todo: Any correct or Object?
        off(name: string, callback: () => void): Object; // Todo: Callback param correct?
        on(name: string, callback: () => void): Object;
        on(name: string, callback: () => void, first: boolean): Object;
        once(name: string, callback: () => void): Object; // Todo: Callback param correct?
        queryCommandState(cmd: string): boolean;
        queryCommandValue(cmd: string): any; // Todo: Return type correct?
        remove(): void;
        render(): void;
        save(args: any): string; // Todo: Any correct?
        setContent(content: string, args?: any): string;
        setProgressState(state: boolean, time?: number): boolean;
        show(): void;
        translate(text: string): string;
    }

    export interface EditorCommands {
        addCommands(command_list: Object, type?: string): void;
        addCommands(command_list: string, type?: string): void;
        execCommand(command: string, ui?: boolean, value?: Object): boolean;
        queryCommandState(command: string): any; // Todo: Returns Boolean/Number
        queryCommandValue(command: string): any; // Todo: Returns Object/False
    }

    export interface EditorManager { } // Todo: Static stuff

    export interface Env { } // Todo: Static stuff

    export interface FocusManager {
        constructor(editorManager: EditorManager);
        isEditorUIElement(elm: Element): boolean;
    }

    export interface Formatter {
        constructor(ed: Editor);
        apply(name: string, vars?: Object, node?: Node): void;
        canApply(name: string): boolean;
        formatChanged(formats: string, callback: (state: any, args: Object) => void): void;
        formatChanged(formats: string, callback: (state: any, args: Object) => void, similar: boolean): void;
        get(name: string): any;
        getCssText(name: string): string;
        getCssText(format: Object): string;
        match(name: string, vars?: Object, node?: Node): boolean;
        matchAll(names: string[], vars?: Object): Object[];
        matchNode(node: Node, name: string, vars?: Object, similar?: boolean): Object;
        register(name: string, format: Object): void; // Todo: Correct?
        register(name: string, format: Object[]): void; // Todo: Correct?
        register(format: Object): void;
        remove(name: string, vars?: Object, node?: Node): void; // Todo: Correct?
        remove(name: string, vars?: Object, node?: Range): void; // Todo: Correct?
        toggle(name: string, vars?: Object, node?: Node): void;
    }

    export interface UndoManager {
        add(level?: Object, event?: Event); // Todo: Should be DOMEvent according to docs.
        beforeChange(): void;
        clear(): void;
        hasRedo(): boolean;
        hasUndo(): boolean;
        redo(): Object;
        transact(callback: () => void): void; // Todo: Params for callback?
        undo(): Object;
    }

    export interface WindowManager {
        alert(message: string, callback?: () => void, scope?: Object);
        close(): void;
        confirm(messageText: string, callback: (s: boolean) => void, scope?: Object): void;
        getParams(): Object;
        getWindows(): void; // Todo: Return-type
        open(args: Object): void; // Todo: Option type?
    }

    export module dom {
        export interface BookmarkManager {
            constructor(selection: Selection);
            getBookmark(type?: number, normalized?: boolean): Object; // Todo: Specify bookmark object?
            isBookmarkNode(); // Todo: No docs ...
            moveToBookmark(bookmark: Object): boolean; // Todo: Specify bookmark object?
        }

        export interface ControlSelection {} // Todo: No docs ...

        export interface DomQuery {
            context: any; // Todo: No docs ...
            length: any; // Todo: No docs ...
            selector: any; // Todo: No docs ...

            // Todo: Static stuff

            add(items: Node[]): DomQuery;
            add(items: DomQuery): DomQuery;
            addClass(className: string): DomQuery;
            after(content: string): DomQuery;
            after(content: Element): DomQuery;
            after(content: Node[]): DomQuery;
            after(content: DomQuery): DomQuery;
            append(content: string): DomQuery;
            append(content: Element): DomQuery;
            append(content: Node[]): DomQuery;
            append(content: DomQuery): DomQuery;
            appendTo(val: string): DomQuery;
            appendTo(val: Element): DomQuery;
            appendTo(val: Node[]): DomQuery;
            appendTo(val: DomQuery): DomQuery;
            attr(name: string): string;
            attr(name: Object): string;
            attr(name: string, value: string): DomQuery;
            attr(name: Object, value: string): DomQuery;

            // Todo: more jQuery-like stuff ...
        }

        export interface DOMUtils {}

        export interface EventUtils {
            bind(target: Object, names: string, callback: () => void, scope: Object): () => void; // Todo: Specify callback signature
            clean(target: Object): EventUtils;
            fire(target: Object, name: string, args?: any): EventUtils;
            unbind(target: Object, names?: string, callback?: () => void): EventUtils;
        }

        export interface ScriptLoader {
            add(url: string, callback?: () => void, scope?: Object): void;
            isDone(url: string): boolean;
            load(url: string, callback?: () => void, scope?: Object): void;
            loadQueue(callback?: () => void, scope?: Object): void;
            loadScripts(scripts: any[], callback?: () => void, scope?: Object): void; // Todo: First paramter type?
            markDone(u: string): void;
        }

        export interface Selection {}

        export interface Serializer {
            constructor(settings: Object, editor: Editor);
            addAttributeFilter(callback: () => void): void;
            addNodeFilter(callback: () => void): void;
            addRules(rules: string): void;
            serialize(node: Node, args: any): void;
            setRules(rules: string): void;
        }

        export interface TreeWalker {
            current(): Node;
            next(): Node;
            prev(): Node;
        }

        export interface TridentSelection {} // Todo: No docs ...
    }

    export module html {
        export interface DomParser {
            constructor(settings: Object, schema: Schema);
            addAttributeFilter(callback: () => void): void;
            addNodeFilter(callback: () => void): void;
            filterNode(Node: Node): Node;
            parse(html: string, args?: any): Node;
        }

        export interface Entities {} // Todo: static stuff

        export interface Node {
            constructor(name: string, type: number): Node;
            append(node: Node): Node;
            attr(name: string, value: string): any;
            clone(): Node;
            empty(): Node;
            getAll(name: string): Node[];
            insert(node: Node, ref_node: Node, before?: boolean): Node;
            isEmpty(elements: Object): boolean;
            remove(): Node;
            replace(node: Node): Node;
            unwrap(): void;
            walk(prev?: boolean): Node;
            wrap(): void;

            // Todo: Static stuff
        }

        export interface SaxParser {
            constructor(settings: Object, schema: Schema): SaxParser;
            parse(html: string): void;
        }

        export interface Schema {
            constructor(settings: Object): Schema;
            addCustomElements(custom_elements: string): void;
            addValidChildren(valid_children: string): void;
            addValidElements(valid_elements: string): void;
            getBlockElements(): Object;
            getBoolAttrs(): Object;
            getCustomElements(): Object;
            getElementRule(name: string): Object;
            getInvalidStyles(): Object;
            getNonEmptyElements(): Object;
            getSelfClosingElements(): Object;
            getShortEndedElements(): Object;
            getSpecialElements(): Object;
            getTextBlockElements(): Object;
            getTextInlineElements(): Object;
            getValidClasses(): Object;
            getValidStyles(): Object;
            getWhiteSpaceElements(): Object;
            isValid(name: string, attr?: string): boolean;
            isValidChild(name: string, child: string): boolean;
            setValidElements(valid_elements: string): void;
        }

        export interface Serializer {
            constructor(settings: Object, schema: Schema): Schema;
            serialize(node: Node): string;
        }

        export interface Styles {
            // Todo: Constructor?
            parse(css: string): Object;
            serialize(styles: Object, elementName?: string): string;
            toHex(color: string): string;
        }

        export interface Writer {
            constructor(settings: Object): Writer;
            addShortcut(pattern: string, desc: string, cmdFunc: string, sc?: Object): boolean;
            addShortcut(pattern: string, desc: string, cmdFunc: () => void, sc?: Object): boolean;
            cdata(text: string): void;
            doctype(text: string): void;
            end(name: string): void;
            getContent(): string;
            pi(name: string, text: string): void;
            reset(): void;
            start(name: string, attrs?: Object, empty?: boolean): void; // Todo: Is Object for "attrs" correct, docs say Array?
            text(text: string, raw?: boolean): void;
        }
    }

    export module ui {
        export interface AbsoluteLayout extends Layout {
            settings: AbsoluteLayoutSettings;

            constructor(settings: AbsoluteLayoutSettings): AbsoluteLayout;
        }
        export interface AbsoluteLayoutSettings extends LayoutSettings {}

        export interface Button extends Widget {
            settings: ButtonSettings;

            constructor(settings: Object): Button;
            icon(): string;
            icon(icon: string): Button;
            renderHtml(): string;
        }
        export interface ButtonSettings extends WidgetSettings {
            icon?: string;
            image?: string;
            size?: string;
        }

        export interface ButtonGroup extends Container {
            settings: ButtonGroupSettings;

            constructor(settings: ButtonGroupSettings): ButtonGroup;
        }
        export interface ButtonGroupSettings extends ContainerSettings {}

        export interface Checkbox extends Widget {
            settings: CheckboxSettings;

            constructor(settings: CheckboxSettings): Checkbox;
            checked(): boolean;
            checked(state: boolean): Checkbox;
            value(): boolean;
            value(state: boolean): Checkbox;
        }
        export interface CheckboxSettings extends WidgetSettings {
            checked?: boolean;
        }

        export interface Collection {}

        export interface ColorBox extends ComboBox {
            settings: ColorBoxSettings;

            constructor(settings: ColorBoxSettings): ColorBox;
        }
        export interface ColorBoxSettings extends ComboBoxSettings {}

        export interface ColorButton extends PanelButton {
            settings: ColorButtonSettings;

            constructor(settings: ColorButtonSettings): ColorButton;
            color(): string;
            color(color: string): ColorButton;
        }
        export interface ColorButtonSettings extends PanelButtonSettings {}

        export interface ColorPicker extends Widget {
            settings: ColorPickerSettings;

            constructor(settings: ColorPickerSettings): ColorPicker;
        }
        export interface ColorPickerSettings extends WidgetSettings {
            color?: string;
        }

        export interface ComboBox extends Widget {
            settings: ComboBoxSettings;

            constructor(settings: ComboBoxSettings): ComboBox;
            postRender(): ComboBox;
            value(): string;
            value(value: string): ComboBox;
        }
        export interface ComboBoxSettings extends WidgetSettings {
            placeholder?: string;
        }

        export interface Container extends Control {
            settings: ContainerSettings;

            constructor(settings: ContainerSettings): Container;
            add(items: Control): Collection;
            add(items: Object): Collection;
            add(items: any[]): Collection;
            append(items: any[]): Container;
            append(items: Collection): Container;
            create(items: any[]): Control[];
            find(selector: string): Collection;
            focus(): Container;
            focus(keyboard: boolean): Container;
            fromJSON(data: Object): Container;
            insert(items: any[], index: number, before: boolean): void;
            insert(items: Collection, index: number, before: boolean): void;
            items(): Collection;
            postRender(): Container;
            prepend(items: any[]): Container;
            prepend(items: Collection): Container;
            reflow(): Container;
            recalc(): void;
            renderHtml(): string;
            replace(oldItem: Control, newItem: Control): void;
            toJSON(): Object;
        }
        export interface ContainerSettings extends ControlSettings {
            defaults?: Object;
            items?: any;
            layout?: string;
        }

        export interface Control {
            settings: ControlSettings;

            constructor(settings: ControlSettings): Control;
            active(state: boolean): any;
            addClass(cls: string, group: string): Control;
            after(items: any[]): Control;
            after(items: Collection): Control;
            aria(name: string, value: string): Control;
            before(items: any[]): Control;
            before(items: Collection): Control;
            blur(): Control;
            classes(group: string): string;
            disabled(): boolean;
            disabled(state: boolean): Control;
            encode(text: string, translate: boolean): string;
            encode(text: Object, translate: boolean): string;
            encode(text: string[], translate: boolean): string;
            findCommonAncestor(ctrl1: Control, ctrl2: Control): Control;
            fire(name: string, args: Object): Object;
            fire(name: string, args: Object, bubble: boolean): Object;
            focus(): Control;
            getContainerElm(): Element;
            getEl(suffix: string, dropCache: boolean): Element;
            getParentCtrl(elm: Element): Control;
            hasClass(cls: string, group: string): boolean;
            hasEventListeners(name: string): boolean;
            height(): number;
            height(value: number): Control;
            hide(): Control;
            initLayoutRect(): Object;
            innerHtml(html: string): Control;
            layoutRect(newRect?: Object): Object;
            name(): string;
            name(value: string): Control;
            next(): Control;
            off(name: string, callback: () => void): Control;
            on(name: string, callback: () => void): Control;
            parent(): Control;
            parent(parent: Container): Control;
            parents(selector?: string): Collection;
            parentsAndSelf(selector?: string): Collection;
            prev(): Control;
            reflow(): Control;
            postRender(): Control;
            remove(): Control;
            removeClass(cls: string, group: string): Control;
            renderBefore(elm: Element): Control;
            repaint(): void;
            scrollIntoView(align: string): Control;
            show(): Control;
            text(): string;
            text(value: string): Control;
            title(): string;
            title(value: string): Control;
            toggleClass(cls: string, state: boolean, group: string): Control;
            translate(text: string): string;
            visible(): boolean;
            visible(state: boolean): Control;
            width(): number;
            width(value: number): Control;
        }
        export interface ControlSettings {
            border?: string;
            classes?: string;
            disabled?: boolean;
            hidden?: boolean;
            margin?: string;
            minHeight?: number;
            minWidth?: number;
            name?: string;
            padding?: string;
            role?: string;
            style?: string;
        }

        export interface DragHelper {}
        export interface ElementPath {}
        export interface Factory {}

        export interface FieldSet extends Form {
            settings: FieldSetSettings;

            constructor(settings: FieldSetSettings): FieldSet;
        }
        export interface FieldSetSettings extends FormSettings {}

        export interface FilePicker extends ComboBox {
            settings: FilePickerSettings;

            constructor(settings: FilePickerSettings): FilePicker;
        }
        export interface FilePickerSettings extends ComboBoxSettings {}

        export interface FitLayout extends AbsoluteLayout {
            settings: FitLayoutSettings;

            constructor(settings: FitLayoutSettings): FitLayout;
        }
        export interface FitLayoutSettings extends AbsoluteLayoutSettings {}

        export interface FlexLayout extends AbsoluteLayout {
            constructor(settings: Object): FlexLayout;
        }
        export interface FlexLayoutSettings extends AbsoluteLayoutSettings {
            align?: string;
            direction?: string;
            flex?: number;
            pack?: string;
        }

        export interface FloatPanel extends Panel, Movable<FloatPanel>, Resizable<FloatPanel> {
            settings: FloatPanelSettings;

            constructor(settings: FloatPanelSettings): FloatPanel;
            close(): void;
            hide(): FloatPanel;
            hideAll(): void;
            // remove(): void;
            show(): FloatPanel;
            // Todo: Static methods
        }
        export interface FloatPanelSettings extends PanelSettings {
            autohide?: boolean;
        }

        export interface FlowLayout extends Layout {
            settings: FlowLayoutSettings;

            constructor(settings: FlowLayoutSettings): FlowLayout;
        }
        export interface FlowLayoutSettings extends LayoutSettings {}

        export interface Form extends Container {
            settings: FormSettings;

            constructor(settings: FormSettings): Form;
            postRender(): Form;
            preRender(): void;
            submit(): Object;
        }
        export interface FormSettings extends ContainerSettings {}

        // Internal class
        // export interface FormatControls {}

        export interface FormItem extends Container {
            settings: FormItemSettings;

            constructor(settings: FormItemSettings): FormItem;
        }
        export interface FormItemSettings extends ContainerSettings {
            label?: string;
        }

        export interface GridLayout extends AbsoluteLayout {
            settings: GridLayoutSettings;

            constructor(settings: GridLayoutSettings): GridLayout;
        }
        export interface GridLayoutSettings extends AbsoluteLayoutSettings {
            alignH?: any;
            alignV?: any;
            columns?: number;
            pack?: string;
            spacing?: number;
            spacingH?: number;
            spacingV?: number;
        }

        export interface Iframe extends Widget {
            settings: IframeSettings;

            constructor(settings: IframeSettings): Iframe;
            html(html: string, callback?: () => void): Iframe;
            src(src: string): void;
        }
        export interface IframeSettings extends WidgetSettings {
            url?: string;
        }

        export interface KeyboardNavigation {
            constructor(): KeyboardNavigation;
        }

        export interface Label extends Widget {
            settings: LabelSettings;

            constructor(settings: LabelSettings): Label;
            renderHtml(): string;
        }
        export interface LabelSettings extends WidgetSettings {}

        export interface Layout {
            settings: LayoutSettings;

            constructor(settings: LayoutSettings): Layout;
            postRender(container: Container): void;
            preRender(container: Container): void;
            recalc(container: Container): void;
            renderHtml(container: Container): void;
        }
        export interface LayoutSettings {}

        export interface ListBox extends MenuButton {
            settings: ListBoxSettings;

            constructor(settings: ListBoxSettings): ListBox;
        }
        export interface ListBoxSettings extends MenuButtonSettings {
            values?: string[];
        }

        export interface Menu extends FloatPanel {
            settings: MenuSettings;

            constructor(settings: MenuSettings): Menu;
            cancel(): void;
            preRender(): void;
        }
        export interface MenuSettings extends FloatPanelSettings {}

        export interface MenuBar extends Toolbar {
            settings: MenuBarSettings;

            constructor(settings: MenuBarSettings): MenuBar;
        }
        export interface MenuBarSettings extends ToolbarSettings {}

        export interface MenuButton extends Button {
            settings: MenuButtonSettings;

            constructor(settings: MenuButtonSettings): MenuButton;
            hideMenu(): void;
            showMenu(): void;
        }
        export interface MenuButtonSettings extends ButtonSettings {
            menu: any;
        }

        export interface MenuItem extends Widget {
            settings: MenuItemSettings;

            constructor(settings: MenuItemSettings): MenuItem;
            hasMenus(): boolean;
            hideMenu(): void;
            showMenu(): void;
        }
        export interface MenuItemSettings extends WidgetSettings {
            menu?: Object[];
            selectable?: boolean;
            shortcut?: string;
        }

        export interface MessageBox extends Window {
            settings: MessageBoxSettings;

            constructor(settings: MessageBoxSettings): MessageBox;
            alert(settings: Object, callback: () => void): void;
            confirm(settings: Object, callback: () => void): void;
            // Todo: Static stuff
        }
        export interface MessageBoxSettings extends WindowSettings {}

        export interface Panel extends Container, Scrollable<Panel> {
            settings: PanelSettings;

            constructor(settings: PanelSettings): Panel;
            // Todo: Mixes
        }
        export interface PanelSettings extends ContainerSettings {}

        export interface PanelButton extends Button {
            settings: PanelButtonSettings;

            constructor(settings: PanelButtonSettings): PanelButton;
            hidePanel(): void;
            showPanel(): void;
        }
        export interface PanelButtonSettings extends ButtonSettings {}

        export interface Path extends Widget {
            settings: PathSettings;

            constructor(settings: PathSettings): Path;
            data(): string[];
            data(data: string[]): Path;
        }
        export interface PathSettings extends WidgetSettings {
            delimiter?: string;
        }

        export interface Radio extends Checkbox {
            settings: RadioSettings;

            constructor(settings: RadioSettings): Radio;
        }
        export interface RadioSettings extends CheckboxSettings {}

        export interface ResizeHandle extends Widget {
            settings: ResizeHandleSettings;

            constructor(settings: ResizeHandleSettings): ResizeHandle;
        }
        export interface ResizeHandleSettings extends WidgetSettings {}

        export interface Selector {
            constructor(selector: string): Selector;
            find(container: Control): Collection;
            match(control: Control, selectors: Selector[]): boolean;
        }

        export interface Spacer extends Widget {
            settings: SpacerSettings;

            constructor(settings: SpacerSettings): Spacer;
        }
        export interface SpacerSettings extends WidgetSettings {}

        export interface SplitButton extends MenuButton {
            settings: SplitButtonSettings;

            constructor(settings: SplitButtonSettings): SplitButton;
        }
        export interface SplitButtonSettings extends MenuButtonSettings {}

        export interface StackLayout extends FlowLayout {
            settings: StackLayoutSettings;

            constructor(settings: StackLayoutSettings): StackLayout;
        }
        export interface StackLayoutSettings extends FlowLayoutSettings {}

        export interface TabPanel extends Panel {
            settings: TabPanelSettings;

            constructor(settings: TabPanelSettings): TabPanel;
            activateTab(idx: number): void;
        }
        export interface TabPanelSettings extends PanelSettings {
            activeTab?: number;
        }

        export interface TextBox extends Widget {
            settings: TextBoxSettings;

            constructor(settings: TextBoxSettings): TextBox;
            value(): string;
            value(value: string): TextBox;
        }
        export interface TextBoxSettings extends WidgetSettings {
            maxLength?: number;
            multiline?: boolean;
            size?: number;
        }

        export interface Throbber {
            constructor(elm: Element, inline?: boolean): Throbber;
            hide(): Throbber;
            show(time: number): Throbber;
        }

        export interface Toolbar extends Container {
            settings: ToolbarSettings;

            constructor(settings: ToolbarSettings): Toolbar;
        }
        export interface ToolbarSettings extends ContainerSettings {}

        export interface ToolTip extends Control, Movable<ToolTip> {
            settings: ToolTipSettings;

            constructor(settings: ToolTipSettings): ToolTip;
        }
        export interface ToolTipSettings extends ControlSettings {}

        export interface Widget extends Control {
            settings: WidgetSettings;

            constructor(settings: WidgetSettings): Widget;
            active(): boolean;
            active(state: boolean): Widget;
            remove(): Control;
            tooltip(): ToolTip;
        }
        export interface WidgetSettings extends ControlSettings {
            autofocus?: boolean;
            border?: string;
            classes?: string;
            disabled?: boolean;
            hidden?: boolean;
            margin?: string;
            minHeight?: number;
            minWidth?: number;
            name?: string;
            padding?: string;
            role?: string;
            style?: string;
            text?: string;
            tooltip?: string;
        }

        export interface Window extends FloatPanel {
            settings: WindowSettings;

            constructor(settings: WindowSettings): Window;
            fullscreen(): boolean;
            fullscreen(state: boolean): Window;
            getContentWindow(): Window;
            submit(): Object;
        }
        export interface WindowSettings extends FloatPanelSettings {}

        export interface Movable<T> {
            moveBy(dx: number, dy: number): T;
            moveRel(elm: Element, rel: string): T;
            moveTo(x: number, y: number): T;
            testMoveRel(elm: Element, rels: any[]): T;
        }

        export interface Resizable<T> {
            resizeBy(dw: number, dh: number): T;
            resizeTo(w: number, h: number): T;
            resizeToContent(): void;
        }

        export interface Scrollable<T> {}
    }

    export module util {
        export interface Color {
            constructor(value: string): Color;
            parse(value: Object): Color;
            parse(value: string): Color;
            toHex(): string;
            toHsv(): Object; // Todo: Return-type specification
            toRgb(): Object; // Todo: Return-type specification
        }

        interface EventDispatcher {
            //constructor(): EventDispatcher;
            fire(name: string, args?: Object): Object;
            has(name: string): boolean;
            off(): Object;
            off(name: string): Object;
            off(name: string, callback: () => void): Object;
            on(name: string, callback: () => void, first?: boolean): Object;
            once(name: string, callback: () => void, first?: boolean): Object;
        }
        interface EventDispatcher_Static {
            new (): EventDispatcher;
            isNative(): boolean;
        }
        export var EventDispatcher: EventDispatcher_Static;

        export interface I18n {
            rtl: boolean;

            constructor(): I18n;
            add(code: string, items: Object): void;
            translate(text: string): string;
            translate(text: Object): string;
            translate(text: any[]): string;
        }

        export interface JSONRequest {
            constructor(settings: Object): JSONRequest;
            send(args: Object): void;
        }

        export interface URI {
            constructor(url: string, settings: Object): URI;
            getURI(): string;
            getURI(noProtoHost: boolean): string;
            isSameOrigin(uri: URI): boolean;
            setPath(path: string): void;
            toAbsPath(base: string, path: string): void;
            toAbsolute(uri: string): string;
            toAbsolute(uri: string, noHost: boolean): string;
            toRelPath(base: string, path: string): void;
            toRelative(uri: string): string;
        }

        interface XHR_Static {
            send(settings: Object): void;
        }
        export var XHR: XHR_Static;

        interface JSON_Static {
            parse(value: string): Object;
            serialize(value: Object): string;
        }
        export var JSON: JSON_Static;
    }
}