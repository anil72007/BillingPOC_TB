sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var BlockEmpDetailPart2 = BlockBase.extend("com.sap.ish.pmpa.SharedBlocks.employment.BlockEmpDetailPart2", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.sap.ish.pmpa.SharedBlocks.employment.BlockEmpDetailPart2",
					type: "XML"
				},
				Expanded: {
					viewName: "com.sap.ish.pmpa.SharedBlocks.employment.BlockEmpDetailPart2",
					type: "XML"
				}
			}
		}
	});

	return BlockEmpDetailPart2;
});
