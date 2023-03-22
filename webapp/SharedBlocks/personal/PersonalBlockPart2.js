sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var PersonalBlockPart2 = BlockBase.extend("com.sap.ish.pmpa.SharedBlocks.personal.PersonalBlockPart2", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.sap.ish.pmpa.SharedBlocks.personal.PersonalBlockPart2",
					type: "XML"
				},
				Expanded: {
					viewName: "com.sap.ish.pmpa.SharedBlocks.personal.PersonalBlockPart2",
					type: "XML"
				}
			}
		}
	});

	return PersonalBlockPart2;
});
