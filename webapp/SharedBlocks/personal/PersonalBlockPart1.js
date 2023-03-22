sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var PersonalBlockPart1 = BlockBase.extend("com.sap.ish.pmpa.SharedBlocks.personal.PersonalBlockPart1", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.sap.ish.pmpa.SharedBlocks.personal.PersonalBlockPart1",
					type: "XML"
				},
				Expanded: {
					viewName: "com.sap.ish.pmpa.SharedBlocks.personal.PersonalBlockPart1",
					type: "XML"
				}
			}
		}
	});

	return PersonalBlockPart1;
});
