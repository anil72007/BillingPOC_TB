sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var BlockJobInfoPart1 = BlockBase.extend("com.sap.ish.pmpa.SharedBlocks.employment.BlockJobInfoPart1", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.sap.ish.pmpa.SharedBlocks.employment.BlockJobInfoPart1",
					type: "XML"
				},
				Expanded: {
					viewName: "com.sap.ish.pmpa.SharedBlocks.employment.BlockJobInfoPart1",
					type: "XML"
				}
			}
		}
	});

	return BlockJobInfoPart1;
});
