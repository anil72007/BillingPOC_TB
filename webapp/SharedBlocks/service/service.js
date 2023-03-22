sap.ui.define(["sap/ui/core/library", 'sap/uxap/BlockBase'], function (coreLibrary, BlockBase) {
	"use strict";

	var ViewType = coreLibrary.mvc.ViewType;

	var service = BlockBase.extend("com.sap.ish.pmpa.SharedBlocks.service.service", {
		metadata: {}
	});
	return service;
});
