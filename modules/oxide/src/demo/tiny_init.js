const skin = localStorage.getItem("skin") || "default";
const contentcss = localStorage.getItem("contentcss") || "default";
const toolbarItems = [
  "reset",
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "|",
  "fontsizeselect",
  "forecolor",
  "|",
  "blockquote",
  "|",
  "bullist",
  "|",
  "align",
  "|",
  "image",
  "link",
  "emoticons",
  "|",
  "removeformat",
  "|",
  "code",
].join(" ");

const inlineFormattingItems =
  "bold italic underline strikethrough | fontsizeselect forecolor | blockquote";
const blockFormattingItems = "align bullist";

tinymce.init({
  selector: "textarea",
  plugins: "link image code emoticons lists",
  toolbar_location: "bottom",
  toolbar: toolbarItems,
  toolbar_mode: "floating",
  skin: "torn",
  toolbar_sticky: true,
  height: 300,
  skin_url: "/skins/ui/" + skin,
  content_css: "/skins/content/" + contentcss + "/content.css",
  menubar: false,
  statusbar: false,
  templates: [
    {
      title: "Some title",
      description: "Some description",
      content: "Some content",
    },
  ],
  mobile: {
    toolbar_mode: "floating",
    toolbar: "reset inlineFormatting blockFormatting",
    toolbar_groups: {
      inlineFormatting: {
        icon: "format",
        tooltip: "Formatting",
        items: inlineFormattingItems,
      },
      blockFormatting: {
        icon: "align-left",
        tooltip: "Block Formatting",
        items: blockFormattingItems,
      },
    },
  },
  setup: (editor) => {
    editor.ui.registry.addButton("SubmitButton", {
      text: "POST",
      onAction: () => {
        editor.insertContent("&nbsp;<strong>It's my button!</strong>&nbsp;");
      },
    });
    editor.ui.registry.addButton("reset", {
      icon: "undo",
      onAction: () => {
        editor.setContent("");
        editor.focus();
      },
    });
  },
});

function addOptionTo(select) {
  return function (_skin) {
    const option = document.createElement("option");
    const text = document.createTextNode(_skin);
    option.value = _skin;
    option.appendChild(text);
    select.appendChild(option);
  };
}

function selectOption(select, optionValueToSelect) {
  for (let i = 0; i < select.options.length; i++) {
    if (select.options[i].value === optionValueToSelect) {
      select.selectedIndex = select.options[i].index;
      break;
    }
  }
}

uiSelect.addEventListener("change", function (e) {
  localStorage.setItem("skin", e.target.value);
  location.reload();
});

contentSelect.addEventListener("change", function (e) {
  localStorage.setItem("contentcss", e.target.value);
  location.reload();
});
