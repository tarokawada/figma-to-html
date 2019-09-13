// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).

interface ElementInfo {
  element: string;
  id: string;
  cl: string;
}

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  if (msg.type === "generate-html") {
    const selection: SceneNode = figma.currentPage.selection[0];
    if (!selection) {
      return;
    }
    if (selection.type !== "FRAME") {
      return;
    }

    let parent = getElementInfo(selection.name);
    let parentHtml = `<${parent.element} id="${parent.id}" class="${parent.cl}">`;
    for (let index = selection.children.length - 1; index >= 0; index--) {
      const child: any = selection.children[index];
      if (child.type === "TEXT") {
        const childHtml = createTextBasedHtml(child);
        parentHtml += childHtml;
      } else if (child.type === "FRAME") {
        const childHtml = createFrameBasedHtml(child);
        parentHtml += childHtml;
      } else if (child.type === "RECTANGLE") {
        const ifImage = checkIfImage(child);
        if (ifImage) {
          const childHtml = createImageBasedHtml(child);
          parentHtml += childHtml;
        }
      }
    }

    parentHtml += `</${parent.element}>`;
    figma.ui.postMessage(parentHtml);
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  // figma.closePlugin();
};

function getText(textNode: TextNode) {
  return textNode.characters;
}

function getElementInfo(input: string) {
  var result: ElementInfo = {
    element: "",
    id: "",
    cl: ""
  };
  let dotRegex = /[.]+/gm;
  let hashRegex = /[#]+/gm;
  let filteredInput: string[] = input
    .replace(dotRegex, ",.")
    .replace(hashRegex, ",#")
    .split(",");
  for (let x = 0; x < filteredInput.length; x++) {
    if (x == 0) {
      result["element"] = filteredInput[x];
      continue;
    }
    if (filteredInput[x].charAt(0) == ".") {
      result["cl"] = result["cl"] + filteredInput[x].substr(1) + " ";
    }
    if (filteredInput[x].charAt(0) == "#") {
      result["id"] = result["id"] + filteredInput[x].substr(1) + " ";
    }
  }
  return result;
}

function createTextBasedHtml(node: TextNode) {
  let text = getText(node);
  let element = getElementInfo(node.name);
  let childHtml = `<${element.element} id="${element.id}" class="${element.cl}">`;
  childHtml += text;
  childHtml += `</${element.element}>`;
  return childHtml;
}

function createFrameBasedHtml(node: FrameNode) {
  let element = getElementInfo(node.name);
  let containerHtml = `<${element.element} id="${element.id}" class="${element.cl}">`;

  // Do check for children
  if (node.children.length > 0) {
    for (const innerChild of node.children) {
      if (innerChild.type === "TEXT") {
        let text = createTextBasedHtml(innerChild);
        containerHtml += text;
      } else if (innerChild.type === "FRAME") {
        let container = createFrameBasedHtml(innerChild);
        containerHtml += container;
      }
    }
  }

  containerHtml += `</${element.element}>`;
  return containerHtml;
}

function createImageBasedHtml(node: RectangleNode) {
  return `<img src="" />`;
}

function checkIfImage(node: RectangleNode) {
  return node.fills[0].type === "IMAGE" ? true : false;
}
