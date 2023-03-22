sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var BlockEmpDetailPart3 = BlockBase.extend("com.sap.ish.pmpa.SharedBlocks.employment.BlockEmpDetailPart3", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.sap.ish.pmpa.SharedBlocks.employment.BlockEmpDetailPart3",
					type: "XML"
				},
				Expanded: {
					viewName: "com.sap.ish.pmpa.SharedBlocks.employment.BlockEmpDetailPart3",
					type: "XML"
				}
			}
		}
	});
	return BlockEmpDetailPart3;
});
