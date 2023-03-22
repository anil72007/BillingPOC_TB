sap.ui.define(["sap/ui/core/library", 'sap/uxap/BlockBase'], function (coreLibrary, BlockBase) {
	"use strict";

	var ViewType = coreLibrary.mvc.ViewType;

	var GoalsBlock = BlockBase.extend("com.sap.build.standard.pocPatientServiceAndInvoice.SharedBlocks.goals.GoalsBlock", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.sap.build.standard.pocPatientServiceAndInvoice.SharedBlocks.goals.GoalsBlock",
					type: ViewType.XML
				},
				Expanded: {
					viewName: "com.sap.build.standard.pocPatientServiceAndInvoice.SharedBlocks.goals.GoalsBlock",
					type: ViewType.XML
				}
			}
		}
	});
	return GoalsBlock;
});
