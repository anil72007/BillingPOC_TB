sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var BlockJobInfoPart2 = BlockBase.extend("com.sap.ish.pmpa.SharedBlocks.employment.BlockJobInfoPart2", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.sap.ish.pmpa.SharedBlocks.employment.BlockJobInfoPart2",
					type: "XML"
				},
				Expanded: {
					viewName: "com.sap.ish.pmpa.SharedBlocks.employment.BlockJobInfoPart2",
					type: "XML"
				}
			}
		}
	});
	return BlockJobInfoPart2;
});
