sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var BlockEmpDetailPart1 = BlockBase.extend("com.sap.ish.pmpa.SharedBlocks.employment.BlockEmpDetailPart1", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.sap.ish.pmpa.SharedBlocks.employment.BlockEmpDetailPart1",
					type: "XML"
				},
				Expanded: {
					viewName: "com.sap.ish.pmpa.SharedBlocks.employment.BlockEmpDetailPart1",
					type: "XML"
				}
			}
		}
	});
	return BlockEmpDetailPart1;
});
