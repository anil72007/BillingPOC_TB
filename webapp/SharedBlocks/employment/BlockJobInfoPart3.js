sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var BlockJobInfoPart3 = BlockBase.extend("com.sap.ish.pmpa.SharedBlocks.employment.BlockJobInfoPart3", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.sap.ish.pmpa.SharedBlocks.employment.BlockJobInfoPart3",
					type: "XML"
				},
				Expanded: {
					viewName: "com.sap.ish.pmpa.SharedBlocks.employment.BlockJobInfoPart3",
					type: "XML"
				}
			}
		}
	});

	return BlockJobInfoPart3;

});
