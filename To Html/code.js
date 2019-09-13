// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
    if (msg.type === "generate-html") {
        const selection = figma.currentPage.selection[0];
        if (!selection) {
            return;
        }
        if (selection.type !== "FRAME") {
            return;
        }
        let parent = getElementInfo(selection.name);
        let parentHtml = `<${parent.element} id="${parent.id}" class="${parent.cl}">`;
        for (const child of selection.children) {
            if (child.type === "TEXT") {
                let text = getText(child);
                let element = getElementInfo(child.name);
                let childHtml = `<${element.element} id="${element.id}" class="${element.cl}">`;
                childHtml += text;
                childHtml += `</${element.element}>`;
                parentHtml += childHtml;
            }
            else if (child.type === "FRAME") {
                let element = getElementInfo(child.name);
                let childHtml = `<${element.element} id="${element.id}" class="${element.cl}">`;
                if (child.children.length > 0) {
                    for (const innerChild of child.children) {
                        if (innerChild.type === "TEXT") {
                            let text = getText(innerChild);
                            let element = getElementInfo(innerChild.name);
                            let innerChildHtml = `<${element.element} id="${element.id}" class="${element.cl}">`;
                            innerChildHtml += text;
                            innerChildHtml += `</${element.element}>`;
                            childHtml += innerChildHtml;
                        }
                    }
                }
                childHtml += `</${element.element}>`;
                parentHtml += childHtml;
            }
        }
        parentHtml += `</${parent.element}>`;
        console.log(parentHtml);
        figma.ui.postMessage(parentHtml);
    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    // figma.closePlugin();
};
function getText(textNode) {
    return textNode.characters;
}
function getElementInfo(input) {
    var result = {
        element: "",
        id: "",
        cl: ""
    };
    let dotRegex = /[.]+/gm;
    let hashRegex = /[#]+/gm;
    let filteredInput = input
        .replace(dotRegex, ",.")
        .replace(hashRegex, ",#")
        .split(",");
    for (let x = 0; x < filteredInput.length; x++) {
        if (x == 0) {
            console.log("First String: " + filteredInput[x]);
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
