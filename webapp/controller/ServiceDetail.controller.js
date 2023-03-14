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
			// var sAppId = "App6352534280e30701c54b4b6b";

			// var oParams = {};

			// this._oRootView = this.getOwnerComponent().getAggregation("rootControl");
			// this._oRootView.getController().setMode(sap.m.SplitAppMode.HideMode);

			// if (oEvent.mParameters.data.context) {
			// 	this.sContext = oEvent.mParameters.data.context;

			// } else {
			// 	if (this.getOwnerComponent().getComponentData()) {
			// 		var patternConvert = function(oParam) {
			// 			if (Object.keys(oParam).length !== 0) {
			// 				for (var prop in oParam) {
			// 					if (prop !== "sourcePrototype" && prop.includes("Set")) {
			// 						return prop + "(" + oParam[prop][0] + ")";
			// 					}
			// 				}
			// 			}
			// 		};

			// 		this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

			// 	}
			// }

			// if (!this.sContext) {
			// 	this.sContext = "Clinical_ServiceSet('S1')";
			// }

			// var oPath;

			// if (this.sContext) {
			// 	oPath = {
			// 		path: "/" + this.sContext,
			// 		parameters: oParams
			// 	};
			// 	this.getView().bindObject(oPath);
			// }

		},
		getConditionData: function (oEvent) {
			debugger;
			var cData = this.getOwnerComponent().getCompData();
			var ItmNumber = oEvent.getParameters().arguments.ItmNumber;
			this.itemCondTab = this.getView().byId("idItemCond");
			this.listitem = this.getView().byId("idListItem");
			if (this.listitem) {
				this.oTemplate = this.listitem.clone();
			}

			this.itemCond = new sap.ui.model.json.JSONModel();
			this.itemCond.setData(cData.results[0].To_ItemCond.results.filter(item => item.ItmNumber === ItmNumber));
			this.itemCondTab.setModel(this.itemCond);
			var oBinding = this.itemCondTab.bindAggregation("items", {
				path: "/",
				template: this.oTemplate
			});
			// var that = this;
			// oBinding.attachEventOnce("updateFinished", function() {
			// 	debugger;
			// 	var inputColumn = that.itemCondTab.getColumns()[1];
			// 	var inputControl = inputColumn.getTemplate().getContent()[0];
			//   });
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
			// var cnt = parseInt(this.getView().byId("idFldVal").getCount()) + 1;
			// cnt = cnt.toString();
			// this.getView().byId("idFldVal").setCount(cnt);
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
						width: "auto"
					}),
					new sap.m.Input({
						value: "",
						width: "auto"
					}),
					new sap.m.Text({
						text: "UPD",
						visible: false
					})
				]
			});
			this.getView().byId("idItemCond").addItem(columnListItemNewLine);
		},

		oCondType: null,
		oField: null,
		getF4help: function (oEvent) {
			debugger;
			// this.oEventSrc = oEvent;
			// this.id = oEvent.getSource().getId();
			// this.name = oEvent.getSource().getName();
			// var that = this;

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
			debugger;
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
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("ConditionDetails").attachMatched(this.getConditionData, this);

			// var inputColumn = this.getView().byId("idItemCond").getColumns()[0];

			// var inputControl = inputColumn.getTemplate().getContent()[0];

			// // Attach a change event listener to the input control
			// inputControl.attachChange(function (event) {
			// 	debugger;
			// });
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
