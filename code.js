"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
figma.showUI(__html__);
const loadFont = (node) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("font load function start");
    yield figma.loadFontAsync(node.fontName);
    console.log("font load function done");
});
const orderPages = (instances) => {
    var _a;
    const buckets = [];
    // adding to buckets 
    for (const instance of instances) {
        if (((_a = instance.parent) === null || _a === void 0 ? void 0 : _a.type) === "FRAME") {
            const parentFrame = instance.parent;
            const bucketStartRange = parentFrame.y - 50;
            const bucketEndRange = parentFrame.y + 50;
            let bucketFound = false;
            for (const bucket of buckets) {
                const bucketItem = bucket[0].parent;
                if ((bucketItem === null || bucketItem === void 0 ? void 0 : bucketItem.type) === "FRAME") {
                    if (bucketItem.y > bucketStartRange && bucketItem.y < bucketEndRange) {
                        bucket.push(instance);
                        bucketFound = true;
                        break;
                    }
                }
            }
            if (!bucketFound) {
                buckets.push([instance]);
            }
        }
    }
    //sorting buckets externally
    buckets.sort((a, b) => a[0].parent.y - b[0].parent.y);
    //sorting internally 
    for (const bucket of buckets) {
        bucket.sort((a, b) => a.parent.x - b.parent.x);
    }
    // creating one sorted list
    let result = [];
    buckets.forEach(bucket => result = result.concat(bucket));
    return result;
};
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => {
    console.log("message", msg);
    (() => __awaiter(void 0, void 0, void 0, function* () {
        if (msg.type === "generate-page") {
            const selectedNode = figma.currentPage.selection[0];
            const startNumber = msg.startNumber;
            var pageNumber = startNumber;
            if (selectedNode.type === "COMPONENT") {
                const componentText = selectedNode.findChild(n => n.type === "TEXT");
                //load font
                if ((componentText === null || componentText === void 0 ? void 0 : componentText.type) === "TEXT") {
                    yield loadFont(componentText);
                }
                //loop through instances and changing text number
                const instances = yield selectedNode.getInstancesAsync();
                const sortedInstances = orderPages(instances);
                for (const instance of sortedInstances) {
                    const textNode = instance.findChild(n => n.type === "TEXT");
                    if ((textNode === null || textNode === void 0 ? void 0 : textNode.type) === "TEXT") {
                        textNode.deleteCharacters(0, textNode.characters.length);
                        textNode.insertCharacters(0, String(pageNumber), "AFTER");
                        pageNumber++;
                    }
                }
            }
        }
        else if (msg.type === "cancel") {
            figma.closePlugin();
        }
    }))();
};
