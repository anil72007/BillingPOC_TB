sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var EmploymentBlockJob = BlockBase.extend("com.sap.ish.pmpa.SharedBlocks.employment.EmploymentBlockJob", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.sap.ish.pmpa.SharedBlocks.employment.EmploymentBlockJobCollapsed",
					type: "XML"
				},
				Expanded: {
					viewName: "com.sap.ish.pmpa.SharedBlocks.employment.EmploymentBlockJobExpanded",
					type: "XML"
				}
			}
		}
	});

	return EmploymentBlockJob;
});
