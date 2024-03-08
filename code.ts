figma.showUI(__html__);

const loadFont = async (node: TextNode) => {
	console.log("font load function start")

	await figma.loadFontAsync(node.fontName as FontName);
	console.log("font load function done")
}

const orderPages = (instances: InstanceNode[]) => {
	const buckets: InstanceNode[][] = [];

	// adding to buckets 
	for (const instance of instances) {
		if (instance.parent?.type === "FRAME") {
			const parentFrame = instance.parent;
			const bucketStartRange = parentFrame.y - 50;
			const bucketEndRange = parentFrame.y + 50;

			let bucketFound = false;
			for (const bucket of buckets) {
				const bucketItem = bucket[0].parent;
				if (bucketItem?.type === "FRAME") {
					if (bucketItem.y > bucketStartRange && bucketItem.y < bucketEndRange) {
						bucket.push(instance);
						bucketFound = true;
						break;
					}
				}
			}

			if (!bucketFound) {
				buckets.push([instance])
			}
		}
	}

	//sorting buckets externally
	buckets.sort((a, b) => (a[0].parent! as FrameNode).y - (b[0].parent! as FrameNode).y);

	//sorting internally 
	for (const bucket of buckets) {
		bucket.sort((a, b) => (a.parent! as FrameNode).x - (b.parent as FrameNode).x);
	}

	// creating one sorted list
	let result: InstanceNode[] = [];
	buckets.forEach(bucket => result = result.concat(bucket));

	return result
}
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => {
	console.log("message", msg);

	(async () => {
		if (msg.type === "generate-page") {
			const selectedNode = figma.currentPage.selection[0];
			const startNumber = msg.startNumber;

			var pageNumber = startNumber;
			if (selectedNode.type === "COMPONENT") {
				const componentText = selectedNode.findChild(n => n.type === "TEXT");

				//load font
				if (componentText?.type === "TEXT") {
					await loadFont(componentText);
				}


				//loop through instances and changing text number
				const instances = await selectedNode.getInstancesAsync();
				const sortedInstances = orderPages(instances);
				for (const instance of sortedInstances) {
					const textNode = instance.findChild(n => n.type === "TEXT")
					if (textNode?.type === "TEXT") {
						textNode.deleteCharacters(0, textNode.characters.length);
						textNode.insertCharacters(0, String(pageNumber), "AFTER")
						pageNumber++
					}
				}
			}
		} else if (msg.type === "cancel"){
			figma.closePlugin()
		}

	})()

};
