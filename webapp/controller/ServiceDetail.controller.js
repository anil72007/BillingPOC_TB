sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./PaymentDistribution",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/core/Fragment",
	"com/sap/build/standard/pocPatientServiceAndInvoice/controller/BaseController"
], function (BaseController, MessageBox, PaymentDistribution, Utilities, History, Fragment, BaseController1) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.pocPatientServiceAndInvoice.controller.ServiceDetail", {
		
		handleRouteMatched: function (oEvent) {
			

		},
		onRowChange: function (oEvent) {
			
			var rowContext = oEvent.getSource().getBindingContext();
			var cData = this.getOwnerComponent().getCompData();

			var tData = cData.results[0].To_Items.results.filter(item => item.ItemCateg === 'ZADH' && item.ItmNumber === oEvent.getSource().getModel().getProperty(oEvent.getSource().getBindingContext().sPath).ItmNumber );
			if(tData[0].Mode === ''){
				tData[0].Mode = 'UPD';
				oEvent.getSource().getModel().getProperty(oEvent.getSource().getBindingContext().sPath).Mode = 'UPD';
			}else{
				oEvent.getSource().getModel().getProperty(oEvent.getSource().getBindingContext().sPath).Mode = tData[0].Mode;
			}
			

		},
		
		onCancel: function(oEvent){
			this.getOwnerComponent().setItem("");
			var cData = JSON.parse(JSON.stringify(this.mData));
			this.getOwnerComponent().setCompData(cData);
			this._onButtonPress();
		},
		getConditionData: function (oEvent) {
			
			var cData = this.getOwnerComponent().getCompData();

			this.mData = JSON.parse(JSON.stringify(cData));
			var ItmNumber = oEvent.getParameters().arguments.ItmNumber;
			this.itemCondTab = this.getView().byId("idItemCond");
			this.listitem = this.getView().byId("idListItem");
			if (this.listitem) {
				this.oTemplate = this.listitem.clone();
			}
			this.getOwnerComponent().setItem(ItmNumber);
			this.itemCond = new sap.ui.model.json.JSONModel();
			this.itemCond.setData(cData.results[0].To_ItemCond.results.filter(item => item.ItmNumber === ItmNumber));
			this.itemCondTab.setModel(this.itemCond);
			var oBinding = this.itemCondTab.bindAggregation("items", {
				path: "/",
				template: this.oTemplate
			});

			this.movement = new sap.ui.model.json.JSONModel();
			this.movTab = this.getView().byId("idMovement");
			this.listMovement = this.getView().byId("idListMovement");
			if (this.listMovement) {
				this.oTempMovement = this.listMovement.clone();
			}
			this.movement.setData(cData.results[0].To_Movement.results);
			this.movTab.setModel(this.movement);
			this.movTab.bindAggregation("items", {
				path: "/",
				template: this.oTempMovement
			});


		},
		onAdd: function (oEvent) {
			var that = this;

			var columnListItemNewLine = new sap.m.ColumnListItem({
				cells: [

					new sap.m.Input({
						value: "",
						showValueHelp: true,
						valueHelpRequest: function (oEvent) {
							that.getF4help(oEvent);
						},
						name: "",
						visible: true,
						width: "auto"
					}),
					new sap.m.Input({
						value: "",
						width: "auto",
						change: function (oEvent) {
							// that.onRowChange(oEvent);
						},
					}),
					new sap.m.Input({
						value: "",
						width: "auto"
					}),
					new sap.m.Text({
						text: "INS_N",
						visible: false
					})
				]
			});
			this.getView().byId("idItemCond").addItem(columnListItemNewLine);
			
		},

		oCondType: null,
		oField: null,
		getF4help: function (oEvent) {
			
			this.oField = oEvent.getSource();
			//Because we cannot access this variable as controller object
			//inside callbacks/ promises, so we creeate a copy
			var that = this;
			if (!this.oCondType) {
				Fragment.load({
					name: 'com.sap.build.standard.pocPatientServiceAndInvoice.view.popup',
					id: 'LineItemCond',
					controller: this
				}).then(function (oFragment) {
					//inside promise and call back functions, we cannot access this pointer
					//controller object, so we need to create a local variable for controller object
					//outside promise/callback var that = this;
					that.oCondType = oFragment;
					that.oCondType.setTitle("Condition Type");
					//Grant the access to the fragment from the view to the model
					that.getView().addDependent(that.oCondType);
					that.oCondType.setMultiSelect(false);
					//4th binding syntax agg binding
					that.oCondType.bindAggregation("items", {
						path: '/GetConditionTypeSet',
						template: new sap.m.ObjectListItem({
							title: '{KSCHL}',
							intro: '{VTEXT}'
						})
					});
					//check sdk functios for select dialog
					that.oCondType.open();
				});
			} else {
				this.oCondType.open();
			}

		},
		onConfirmPopup: function (oEvent) {
			
			var sId = oEvent.getSource().getId();
			//Get the selected item object from event confirm
			var oSelectedItemObject = oEvent.getParameter("selectedItem");
			//Extract the data from the item
			var sText = oSelectedItemObject.getTitle();
			//Set to the input field
			this.oField.setValue(sText);
			this.oField.setDescription(oSelectedItemObject.getIntro());

		},
		_onButtonPress: function () {
			var oTable = this.getView().byId("idItemCond");
			for(var i=0;i<oTable.getItems().length;i++){
				if(oTable.getItems()[i].getCells()[3].getText() === 'INS_N'){
					var cond = {
						"CondType" : oTable.getItems()[i].getCells()[0].getValue(),
						"CondTypeDesc" : oTable.getItems()[i].getCells()[0].getDescription(),
						"CondValue" :oTable.getItems()[i].getCells()[1].getValue(),
						"ItmNumber" : this.getOwnerComponent().getItem(),
						"Mode" : "UPD",
						"SdDoc" : this.itemCond.getData()[0].SdDoc
					}
					this.itemCond.getData().push(cond);
					this.getOwnerComponent().getCompData().results[0].To_ItemCond.results.push(cond);
				}
			}
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oQueryParams = this.getQueryParameters(window.location);

			if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("default", true);
			}

		},
		getQueryParameters: function (oLocation) {
			var oQuery = {};
			var aParams = oLocation.search.substring(1).split("&");
			for (var i = 0; i < aParams.length; i++) {
				var aPair = aParams[i].split("=");
				oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
			}
			return oQuery;

		},
		_onButtonPress1: function (oEvent) {

			var sDialogName = "PaymentDistribution";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];
			if (!oDialog) {
				oDialog = new PaymentDistribution(this.getView());
				this.mDialogs[sDialogName] = oDialog;

				// For navigation.
				oDialog.setRouter(this.oRouter);
			}

			var context = oEvent.getSource().getBindingContext();
			oDialog._oControl.setBindingContext(context);

			oDialog.open();

		},
		onInit: function () {
			this.mData;
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("ConditionDetails").attachMatched(this.getConditionData, this);

		},
		onExit: function () {

			// to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
			var aControls = [{
				"controlId": "sap_uxap_ObjectPageLayout_0-sections-sap_uxap_ObjectPageSection-1-subSections-sap_uxap_ObjectPageSubSection-1-blocks-build_simple_Table-1666932571303",
				"groups": ["items"]
			}];
			for (var i = 0; i < aControls.length; i++) {
				var oControl = this.getView().byId(aControls[i].controlId);
				if (oControl) {
					for (var j = 0; j < aControls[i].groups.length; j++) {
						var sAggregationName = aControls[i].groups[j];
						var oBindingInfo = oControl.getBindingInfo(sAggregationName);
						if (oBindingInfo) {
							var oTemplate = oBindingInfo.template;
							oTemplate.destroy();
						}
					}
				}
			}

		}
	});
}, /* bExport= */ true);
