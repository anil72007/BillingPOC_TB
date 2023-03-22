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
            
			this.oRouter = this.getOwnerComponent().getRouter();
			this.getView().setModel(this.getOwnerComponent().getModel());
			
			this._smartFilterBar = this.getView().byId("smartFilterBar");
        },
		
		onBeforeRebindTable: function (oEvent) {
			
			var mBindingParams = oEvent.getParameter("bindingParams");

			var idCaseStatus = this.getView().byId("idCaseStatus");
			var aCountKeys = idCaseStatus.getSelectedKeys();
			for (var i = 0; i < aCountKeys.length; i++) {
				var newFilter = new Filter("CaseStatus", FilterOperator.EQ, aCountKeys[i]);
				if (aCountKeys.length > 0) {
					mBindingParams.filters.push(newFilter);
				}
			}


			var idMovement = this.getView().byId("idMovement");
			var aCountKeys = idMovement.getSelectedKeys();
			for (var i = 0; i < aCountKeys.length; i++) {
				var newFilter = new Filter("CaseOrder", FilterOperator.EQ, aCountKeys[i]);
				if (aCountKeys.length > 0) {
					mBindingParams.filters.push(newFilter);
				}
			}

			if(this.getView().byId("DP1").getDateValue()){
				mBindingParams.filters.push(new Filter("ValidFrom", FilterOperator.EQ, this.getView().byId("DP1").getDateValue()));
			}
			if(this.getView().byId("DP2").getDateValue()){
				mBindingParams.filters.push(new Filter("ValidTo", FilterOperator.EQ, this.getView().byId("DP2").getDateValue()));
			}

			mBindingParams.filters.push(new Filter("Mode", FilterOperator.EQ, 'GET'));
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
			

			var sPath = oEvent.getParameter("listItem").getBindingContextPath();
			var myId = sPath.split("/")[sPath.split("/").length - 1];
			

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