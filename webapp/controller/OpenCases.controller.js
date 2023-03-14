sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, Utilities, Filter,FilterOperator, History) {
    'use strict';
    return BaseController.extend("com.sap.build.standard.pocPatientServiceAndInvoice.controller.OpenCases",{

		_smartFilterBar: null,
		_oModel: null,

        onInit: function(){
            // this._oModel = new ODataModel("LineItemsSet", true);
			this.oRouter = this.getOwnerComponent().getRouter();
			this.getView().setModel(this.getOwnerComponent().getModel());
			
			this._smartFilterBar = this.getView().byId("smartFilterBar");
        },
		
		onBeforeRebindTable: function (oEvent) {
			debugger;
			var mBindingParams = oEvent.getParameter("bindingParams");
			// var oMultiComboBox = this.getView().byId("multiComboBox");
			// var aCountKeys = oMultiComboBox.getSelectedKeys();
			// for (var i = 0; i < aCountKeys.length; i++) {
			// 	var newFilter = new Filter("CaseType", FilterOperator.EQ, aCountKeys[i]);
			// 	if (aCountKeys.length > 0) {
			// 		mBindingParams.filters.push(newFilter);
			// 	}
			// }

			var idMovement = this.getView().byId("idMovement");
			var aCountKeys = idMovement.getSelectedKeys();
			for (var i = 0; i < aCountKeys.length; i++) {
				var newFilter = new Filter("CaseOrder", FilterOperator.EQ, aCountKeys[i]);
				if (aCountKeys.length > 0) {
					mBindingParams.filters.push(newFilter);
				}
			}
		},
		toggleUpdateMode: function() {
			var oButton = this.getView().byId("toggleUpdateMode");

			if (!this._smartFilterBar || !oButton) {
				return;
			}

			var bLiveMode = this._smartFilterBar.getLiveMode();
			if (bLiveMode) {
				oButton.setText("Change to 'LiveMode'");
			} else {
				oButton.setText("Change to 'ManualMode'");
			}

			this._smartFilterBar.setLiveMode(!bLiveMode);
		},
		onItemPressSupp: function(oEvent){
			debugger;

			var sPath = oEvent.getParameter("listItem").getBindingContextPath();
			var myId = sPath.split("/")[sPath.split("/").length - 1];
			// var myId = oEvent.getParameter("listItem").getBindingContext().getModel().oData[oEvent.getParameter("listItem").getBindingContext().getPath().substring(1)].CaseOrder;

			this.oRouter.navTo("ServiceList1",{
				OrdNumber : myId
			});
		},
		_setButtonText: function() {
			var oButton = this.getView().byId("toggleUpdateMode");

			if (!this._smartFilterBar || !oButton) {
				return;
			}

			var bLiveMode = this._smartFilterBar.getLiveMode();
			if (bLiveMode) {
				oButton.setText("Change to 'LiveMode'");
			} else {
				oButton.setText("Change to 'ManualMode'");
			}
		},

		onExit: function () {
			if (this._oModel) {
				this._oModel.destroy();
				this._oModel = null;
			}
		}        

    });
});