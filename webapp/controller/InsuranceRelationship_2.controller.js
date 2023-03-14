sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./InsuranceRelationshipRemark", "./Dialog5",
	"./utilities",
	"sap/ui/core/routing/History", 'sap/ui/core/Fragment',
	"sap/m/Dialog",
	"com/sap/build/standard/pocPatientServiceAndInvoice/utils/format"
], function (BaseController, MessageBox, InsuranceRelationshipRemark, Dialog5, Utilities, History, Fragment, Dialog,format) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.pocPatientServiceAndInvoice.controller.InsuranceRelationship_2", {
		formatter: format,
		handleRouteMatched: function (oEvent) {
			debugger;
			var sAppId = "App6352534280e30701c54b4b6b";

			var oParams = {};

			this._oRootView = this.getOwnerComponent().getAggregation("rootControl");
			this._oRootView.getController().setMode(sap.m.SplitAppMode.HideMode);

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function (oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype" && prop.includes("Set")) {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}
					};

					this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

				}
			}
			if (this.sContext) {
				const aufnrRegex = /Aufnr='(\d+)'/;
				const vbelnRegex = /Vbeln='(\d+)'/;

				const aufnrMatch = this.sContext.match(aufnrRegex);
				const vbelnMatch = this.sContext.match(vbelnRegex);

				if (aufnrMatch && aufnrMatch.length >= 2) {
					this.aufnr = aufnrMatch[1];
				}

				if (vbelnMatch && vbelnMatch.length >= 2) {
					this.vbeln = vbelnMatch[1];
				}
				if (this.vbeln) {
					var url = "/sap/opu/odata/sap/ZGW_BILLING_APP_SRV/";
					var oModel = new sap.ui.model.odata.ODataModel(url, true);
					var efilter = "$filter=Aufnr eq '" + this.aufnr + "' and Vbeln eq '" + this.vbeln + "'";

					var url = "InsContCondSet?" + "&&" + efilter;
					var that = this;

					oModel.read(url, null, null, null,
						function onSuccess(oData, oResponse) {
							debugger;
							that.getView().byId("insno").setEnabled(false);
							that.getView().byId("insno").setValue(oData.results[0].Payer);
							that.getView().byId("insno").setDescription(oData.results[0].Name);
							// that.getView().byId("DP1").setProperty("value", new Date(oData.results[0].ValidFrom))
							var tMod = new sap.ui.model.json.JSONModel();
							tMod.setData(oData.results)
							that.getView().byId("DP1").setModel(tMod);
							that.getView().byId("DP1").setEnabled(false);
							that.getView().byId("DP1").bindProperty("value", {
								path: "/0/ValidFrom",
								type: new sap.ui.model.type.Date()
							});
							that.getView().byId("DP2").setModel(tMod);
							that.getView().byId("DP2").setEnabled(false);
							that.getView().byId("DP2").bindProperty("value", {
								path: "/0/ValidTo",
								type: new sap.ui.model.type.Date()
							});
							that.getView().byId("DP2").setEnabled(false);
							that.getView().byId("idContType").setVisible(false);
							for (var i = 0; i < oData.results.length; i++) {
								if (oData.results[i].CondType === 'ZCO%') {
									that.getView().byId("idTabCovPer").setValue(oData.results[i].CondValue);
								} else if (oData.results[i].CondType === 'ZCOF') {
									that.getView().byId("idTabCovAmt").setValue(oData.results[i].CondValue);
								} else if (oData.results[i].CondType === 'ZDC%') {
									that.getView().byId("idTabDisPer").setValue(oData.results[i].CondValue);
								} else if (oData.results[i].CondType === 'ZDCF') {
									that.getView().byId("idTabDisAmt").setValue(oData.results[i].CondValue);
								}
							}

							const exCond = ['ZCO%', 'ZCOF', 'ZDC%', 'ZDCF'];
							const exCondArr = tMod.getData().filter(item => !exCond.includes(item.CondType));
							that.getView().getModel("addlServ").setData(exCondArr);
						},
						function _onError(oError) {
							// that.oGloablDiaglogBox.close();
						}

					);
				}
			}

			if(!this.aufnr){
				var result = this.sContext;
				this.aufnr = result.substr(result.indexOf("'") + 1, result.lastIndexOf("'") - result.indexOf("'") - 1);
				
			}
			// if (!this.sContext) {
			// 	this.sContext = "InsuranceSet('IN1')";
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
		clearValues: function(){
			this.getView().byId("insno").setValue("");
			this.getView().byId("insno").setDescription("");
			this.getView().byId("rank").setValue("");
			this.getView().byId("DP1").setModel(null);

			this.getView().byId("DP1").setValue("");

			this.getView().byId("DP2").setValue("");
			
			this.getView().byId("idContType").setSelectedItem(null);
			this.getView().byId("idTabCovPer").setValue("");
			this.getView().byId("idTabCovAmt").setValue("");
			this.getView().byId("idTabDisPer").setValue("");
			this.getView().byId("idTabDisAmt").setValue("");


			this.getView().byId("idActInd").setIcon("sap-icon://status-negative");
			this.getView().byId("idActInd").setText("Inactive");
			this.getView().byId("idActInd").removeStyleClass("active");
			this.actInd = false;
			this.getView().byId("idMainInsChk").setSelected(false);

			this.getView().getModel("addlServ").setData([]);
			// this.getView().byId("idInsCond").unbindItems();
		},
		 clearControls: function(oControl) {
			// Clear any bindings on the control
			if (oControl.unbindElement) {
			  oControl.unbindElement();
			}
			if (oControl.unbindAggregation) {
			  oControl.unbindAggregation();
			}
		  
			// Clear any models on the control
			if (oControl.setModel) {
			  oControl.setModel(null);
			}
		  
			// Clear any input fields
			if (oControl.setValue) {
			  oControl.setValue("");
			}
		  
			// Clear any child controls
			var aChildren = oControl.getAggregation("content");
			if (aChildren) {
			  for (var i = 0; i < aChildren.length; i++) {
				this.clearControls(aChildren[i]);
			  }
			}
		  
			// Clear any aggregation
			var aAggregations = oControl.getMetadata().getAllAggregations();
			for (var j = 0; j < aAggregations.length; j++) {
			  var sAggregationName = aAggregations[j].getName();
			  if (oControl.getBindingInfo(sAggregationName)) {
				oControl.unbindAggregation(sAggregationName);
			  }
			  oControl.destroyAggregation(sAggregationName);
			}
		  },
		_onPageNavButtonPress: function () {
			// var oView = this.getView();

			// // Destroy all controls of the page
			// var aContent = oView.getContent();
			// for (var i = 0; i < aContent.length; i++) {
			// 	this.clearControls(aContent[i]);
			// }

			this.clearValues();

			var component = sap.ui.getCore().getComponent();
			if (component) {
				var container = new sap.ui.core.ComponentContainer({
					component: component
				});
				container.destroy();
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
		formatDateUTCtoLocale: function (dDate) {
			if (dDate) {
				return new Date(dDate.getUTCFullYear(), dDate.getUTCMonth(), dDate.getUTCDate());
			}
			return dDate;

		},
		_onDateRangeSelectionChange: function (oEvent) {

			var oDateRangeSelection = oEvent.getSource();
			var oBindingContext = oDateRangeSelection.getBindingContext();
			var sBindingPathOfDateValue = oDateRangeSelection.getBindingPath("dateValue");
			var sBindingPathOfSecondDateValue = oDateRangeSelection.getBindingPath("secondDateValue");
			var oFrom = oEvent.getParameter("from");
			if (oBindingContext && sBindingPathOfDateValue && oFrom) {
				var oFromBefore = oBindingContext.getModel().getProperty(sBindingPathOfDateValue, oBindingContext);
				if (oFromBefore) {
					var oUTCFrom = new Date(Date.UTC(oFrom.getFullYear(), oFrom.getMonth(), oFrom.getDate(), oFromBefore.getUTCHours(), oFromBefore.getUTCMinutes(), oFromBefore.getUTCSeconds()));
					oBindingContext.getModel().setProperty(sBindingPathOfDateValue, oUTCFrom, oBindingContext);
				}
			}
			var oTo = oEvent.getParameter("to");
			if (oBindingContext && sBindingPathOfSecondDateValue && oTo) {
				var oToBefore = oBindingContext.getModel().getProperty(sBindingPathOfSecondDateValue, oBindingContext);
				if (oToBefore) {
					var oUTCTo = new Date(Date.UTC(oTo.getFullYear(), oTo.getMonth(), oTo.getDate(), oToBefore.getUTCHours(), oToBefore.getUTCMinutes(), oToBefore.getUTCSeconds()));
					oBindingContext.getModel().setProperty(sBindingPathOfSecondDateValue, oUTCTo, oBindingContext);
				}
			}

		},
		_onButtonPress: function (oEvent) {

			var sDialogName = "InsuranceRelationshipRemark";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];
			if (!oDialog) {
				oDialog = new InsuranceRelationshipRemark(this.getView());
				this.mDialogs[sDialogName] = oDialog;

				// For navigation.
				oDialog.setRouter(this.oRouter);
			}

			var context = oEvent.getSource().getBindingContext();
			oDialog._oControl.setBindingContext(context);

			oDialog.open();

		},
		_onFileUploaderUploadComplete: function () {
			// Please implement

		},
		_onFileUploaderChange: function () {
			// Please implement

		},
		_onFileUploaderTypeMissmatch: function () {
			// Please implement

		},
		_onFileUploaderFileSizeExceed: function () {
			// Please implement

		},
		_onButtonPress1: function (oEvent) {

			var sDialogName = "Dialog5";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];
			if (!oDialog) {
				oDialog = new Dialog5(this.getView());
				this.mDialogs[sDialogName] = oDialog;

				// For navigation.
				oDialog.setRouter(this.oRouter);
			}

			var context = oEvent.getSource().getBindingContext();
			oDialog._oControl.setBindingContext(context);

			oDialog.open();

		},
		formatDateUTCtoLocale1: function (dDate) {
			if (dDate) {
				return new Date(dDate.getUTCFullYear(), dDate.getUTCMonth(), dDate.getUTCDate());
			}
			return dDate;

		},
		_onDateRangeSelectionChange1: function (oEvent) {

			var oDateRangeSelection = oEvent.getSource();
			var oBindingContext = oDateRangeSelection.getBindingContext();
			var sBindingPathOfDateValue = oDateRangeSelection.getBindingPath("dateValue");
			var sBindingPathOfSecondDateValue = oDateRangeSelection.getBindingPath("secondDateValue");
			var oFrom = oEvent.getParameter("from");
			if (oBindingContext && sBindingPathOfDateValue && oFrom) {
				var oFromBefore = oBindingContext.getModel().getProperty(sBindingPathOfDateValue, oBindingContext);
				if (oFromBefore) {
					var oUTCFrom = new Date(Date.UTC(oFrom.getFullYear(), oFrom.getMonth(), oFrom.getDate(), oFromBefore.getUTCHours(), oFromBefore.getUTCMinutes(), oFromBefore.getUTCSeconds()));
					oBindingContext.getModel().setProperty(sBindingPathOfDateValue, oUTCFrom, oBindingContext);
				}
			}
			var oTo = oEvent.getParameter("to");
			if (oBindingContext && sBindingPathOfSecondDateValue && oTo) {
				var oToBefore = oBindingContext.getModel().getProperty(sBindingPathOfSecondDateValue, oBindingContext);
				if (oToBefore) {
					var oUTCTo = new Date(Date.UTC(oTo.getFullYear(), oTo.getMonth(), oTo.getDate(), oToBefore.getUTCHours(), oToBefore.getUTCMinutes(), oToBefore.getUTCSeconds()));
					oBindingContext.getModel().setProperty(sBindingPathOfSecondDateValue, oUTCTo, oBindingContext);
				}
			}

		},
		_onButtonPress2: function (oEvent) {

			var sDialogName = "InsuranceRelationshipRemark";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];
			if (!oDialog) {
				oDialog = new InsuranceRelationshipRemark(this.getView());
				this.mDialogs[sDialogName] = oDialog;

				// For navigation.
				oDialog.setRouter(this.oRouter);
			}

			var context = oEvent.getSource().getBindingContext();
			oDialog._oControl.setBindingContext(context);

			oDialog.open();

		},
		_onFileUploaderUploadComplete1: function () {
			// Please implement

		},
		_onFileUploaderChange1: function () {
			// Please implement

		},
		_onFileUploaderTypeMissmatch1: function () {
			// Please implement

		},
		_onFileUploaderFileSizeExceed1: function () {
			// Please implement

		},
		onPress: function(event) {
			var button = event.getSource();
			var isActivated = button.getPressed();
			if (isActivated) {
			  button.setIcon("sap-icon://status-positive");
			  button.setText("Active");
			  button.addStyleClass("active");
			} else {
			  button.setIcon("sap-icon://status-negative");
			  button.setText("Inactive");
			  button.removeStyleClass("active");
			}
			this.actInd = isActivated;
		  },
		_onButtonPress3: function (oEvent) {

			debugger;
			var url = "/sap/opu/odata/sap/ZGW_BILLING_APP_SRV/";
			var oModel = new sap.ui.model.odata.ODataModel(url, true);

			// var cData = this.getOwnerComponent().getCompData().results[0];
			var that = this;
			this.oMessage = new sap.ui.model.json.JSONModel();
			// this.oGloablDiaglogBox.open();
			this.hData = {
				"Aufnr": this.aufnr,
				"Vbeln": this.vbeln,
				"ValidFrom": this.getView().byId("DP1").getDateValue(),
				"ValidTo": this.getView().byId("DP2").getDateValue(),
				"Rank": this.getView().byId("rank").getValue(),
				"Text": "",
				"ActiveInd": this.actInd,
				"ControlNo": "",
				"Payer": this.getView().byId("insno").getValue(),
				"Name": "",
				"MainIns": this.getView().byId("idMainInsChk").getSelected(),
				"Ins_ToCond": [],
				"To_InsMessage": [],

			};
			var oTable = this.getView().byId("idInsCond");
			for (var i = 0; i < oTable.getItems().length; i++) {
				var sId = oTable.getItems()[i].getCells()[0].getId();
				if (sId.indexOf("input") != -1) {
					var condType = oTable.getItems()[i].getCells()[0].getValue();
				} else {
					var condType = oTable.getItems()[i].getCells()[0].getTitle();
				}

				var condVal = oTable.getItems()[i].getCells()[1].getValue();
				var itemData = {
					"Aufnr": this.aufnr,
					"Vbeln": this.vbeln,
					"ValidFrom": this.getView().byId("DP1").getDateValue(),
					"ValidTo": this.getView().byId("DP2").getDateValue(),
					"CondType": condType,
					"CondValue": condVal
				}
				this.hData.Ins_ToCond.push(itemData);
			}
			var itemData = {
				"Aufnr": this.aufnr,
				"Vbeln": this.vbeln,
				"ValidFrom": this.getView().byId("DP1").getDateValue(),
				"ValidTo": this.getView().byId("DP2").getDateValue(),
				"CondType": "ZCO%",
				"CondValue": this.getView().byId("idTabCovPer").getValue()
			}
			this.hData.Ins_ToCond.push(itemData);

			var itemData = {
				"Aufnr": this.aufnr,
				"Vbeln": this.vbeln,
				"ValidFrom": this.getView().byId("DP1").getDateValue(),
				"ValidTo": this.getView().byId("DP2").getDateValue(),
				"CondType": "ZCOF",
				"CondValue": this.getView().byId("idTabCovAmt").getValue()
			}
			this.hData.Ins_ToCond.push(itemData);
			var itemData = {
				"Aufnr": this.aufnr,
				"Vbeln": this.vbeln,
				"ValidFrom": this.getView().byId("DP1").getDateValue(),
				"ValidTo": this.getView().byId("DP2").getDateValue(),
				"CondType": "ZDC%",
				"CondValue": this.getView().byId("idTabDisPer").getValue()
			}
			this.hData.Ins_ToCond.push(itemData);
			var itemData = {
				"Aufnr": this.aufnr,
				"Vbeln": this.vbeln,
				"ValidFrom": this.getView().byId("DP1").getDateValue(),
				"ValidTo": this.getView().byId("DP2").getDateValue(),
				"CondType": "ZDCF",
				"CondValue": this.getView().byId("idTabDisAmt").getValue()
			}
			this.hData.Ins_ToCond.push(itemData);

			var msg = {
				"Type" : "S",
				"Id" : "ZDE",
				"Number" : "11"
			}
			this.hData.To_InsMessage.push(msg);
			this.oMessage = new sap.ui.model.json.JSONModel();
			this.oGloablDiaglogBox.open();
			this.popupView = null;

			oModel.create("/InsuranceContractSet", this.hData, {
				method: "POST",
				success: function (oResultData, oResponse) {
					
					that.oGloablDiaglogBox.close();
					if (!that.popupView) {
						that.popupView = sap.ui.xmlfragment("com.sap.build.standard.pocPatientServiceAndInvoice.view.Messages", that);
					}
					that.oMessage.setData(oResultData.To_InsMessage);

					that.popupView.setModel(that.oMessage, "message");
					var dialog = new sap.m.Dialog({
						title: "Messages",
						contentWidth: "600px",
						contentHeight: "600px",
						content: that.popupView,
						beginButton: new sap.m.Button({
							text: "OK",
							press: function () {
								that._onPageNavButtonPress();
								that.popupView.destroy();
								dialog.close();
							}
						})
					});

					dialog.open();


				},
				error: function (e) {
					that.oGloablDiaglogBox.close();
					sap.m.MessageToast.show("Error while creating ");
				}
			});
		},
		handleChangeValuestate: function (requiredFieldInfo, oView) {
			var status = true;
			if (requiredFieldInfo) {
				requiredFieldInfo.forEach(function (requiredinfo) {
					var input = oView.byId(requiredinfo.id);
					if (input) {
						input.setValueState("None"); //initially set ValueState to None
						if (input.getValue() === '') {
							input.setValueState("Error"); //input is blank set ValueState to error
							status = false;
						} else if (input.getDateValue && !input._bValid) { //since 1.64 ui5 will be providing a function 'isValidValue' that can be used here.
							input.setValueState("Error"); //Invalid Date set ValueState to error
							status = false;
						}
					}
				});
			}
			return status;

		},
		applyFiltersAndSorters: function (sControlId, sAggregationName, chartBindingInfo) {
			if (chartBindingInfo) {
				var oBindingInfo = chartBindingInfo;
			} else {
				var oBindingInfo = this.getView().byId(sControlId).getBindingInfo(sAggregationName);
			}
			var oBindingOptions = this.updateBindingOptions(sControlId);
			this.getView().byId(sControlId).bindAggregation(sAggregationName, {
				model: oBindingInfo.model,
				path: oBindingInfo.path,
				parameters: oBindingInfo.parameters,
				template: oBindingInfo.template,
				templateShareable: true,
				sorter: oBindingOptions.sorters,
				filters: oBindingOptions.filters
			});

		},
		updateBindingOptions: function (sCollectionId, oBindingData, sSourceId) {
			this.mBindingOptions = this.mBindingOptions || {};
			this.mBindingOptions[sCollectionId] = this.mBindingOptions[sCollectionId] || {};

			var aSorters = this.mBindingOptions[sCollectionId].sorters;
			var aGroupby = this.mBindingOptions[sCollectionId].groupby;

			// If there is no oBindingData parameter, we just need the processed filters and sorters from this function
			if (oBindingData) {
				if (oBindingData.sorters) {
					aSorters = oBindingData.sorters;
				}
				if (oBindingData.groupby || oBindingData.groupby === null) {
					aGroupby = oBindingData.groupby;
				}
				// 1) Update the filters map for the given collection and source
				this.mBindingOptions[sCollectionId].sorters = aSorters;
				this.mBindingOptions[sCollectionId].groupby = aGroupby;
				this.mBindingOptions[sCollectionId].filters = this.mBindingOptions[sCollectionId].filters || {};
				this.mBindingOptions[sCollectionId].filters[sSourceId] = oBindingData.filters || [];
			}

			// 2) Reapply all the filters and sorters
			var aFilters = [];
			for (var key in this.mBindingOptions[sCollectionId].filters) {
				aFilters = aFilters.concat(this.mBindingOptions[sCollectionId].filters[key]);
			}

			// Add the groupby first in the sorters array
			if (aGroupby) {
				aSorters = aSorters ? aGroupby.concat(aSorters) : aGroupby;
			}

			var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, true)] : undefined;
			return {
				filters: aFinalFilters,
				sorters: aSorters
			};

		},
		createFiltersAndSorters: function () {
			this.mBindingOptions = {};
			var oBindingData, aPropertyFilters;
			oBindingData = {};
			oBindingData.filters = [];
			aPropertyFilters = [];

			aPropertyFilters.push(new sap.ui.model.Filter("Case", "EQ", "1"));
			oBindingData.filters.push(new sap.ui.model.Filter(aPropertyFilters, true));

			this.updateBindingOptions("sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-1-content-build_simple_Table-1", oBindingData);

		},
		onInit: function () {
			debugger;
			this.aufnr = "";this.vbeln = "";
			this.actInd = false;
			this.oGloablDiaglogBox = new sap.m.BusyDialog();
			this.contdata = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.contdata, "contdata");

			this.addlServ = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.addlServ, "addlServ");

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("InsuranceRelationship_2").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			var oView = this.getView();
			oView.addEventDelegate({
				onBeforeShow: function () {
					if (sap.ui.Device.system.phone) {
						var oPage = oView.getContent()[0];
						if (oPage.getShowNavButton && !oPage.getShowNavButton()) {
							oPage.setShowNavButton(true);
							oPage.attachNavButtonPress(function () {
								this.oRouter.navTo("ServiceList", {}, true);
							}.bind(this));
						}
					}
				}.bind(this)
			});

			this.oModel = this.getOwnerComponent().getModel();

			var oView = this.getView(),
				oData = {},
				self = this;
			var oModel = new sap.ui.model.json.JSONModel();
			oView.setModel(oModel, "staticDataModel");
			self.oBindingParameters = {};

			oData["sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-1668584461814-content-sap_m_HBox-1-items-sap_m_DateRangeSelection-5"] = {};

			oData["sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-1668584461814-content-sap_m_HBox-1-items-sap_m_DateRangeSelection-5"]["dateValue"] = new Date("2022-05-01T00:00:00.000Z");

			oData["sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-1668584461814-content-sap_m_HBox-1-items-sap_m_DateRangeSelection-5"]["secondDateValue"] = new Date("9999-12-31T00:00:00.000Z");

			oData["sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-1-content-sap_m_HBox-1668138541872-items-sap_m_DateRangeSelection-1668138553225"] = {};

			oData["sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-1-content-sap_m_HBox-1668138541872-items-sap_m_DateRangeSelection-1668138553225"]["dateValue"] = new Date("2023-01-11T00:00:00.000Z");

			oData["sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-1-content-sap_m_HBox-1668138541872-items-sap_m_DateRangeSelection-1668138553225"]["secondDateValue"] = new Date("9999-12-31T00:00:00.000Z");

			oView.getModel("staticDataModel").setData(oData, true);

			// function dateDimensionFormatter(oDimensionValue, sTextValue) {
			// 	var oValueToFormat = sTextValue !== undefined ? sTextValue : oDimensionValue;
			// 	if (oValueToFormat instanceof Date) {
			// 		var oFormat = sap.ui.core.format.DateFormat.getDateInstance({
			// 			style: "short"
			// 		});
			// 		return oFormat.format(oValueToFormat);
			// 	}
			// 	return oValueToFormat;
			// }

			// this.mAggregationBindingOptions = {};
			// this.createFiltersAndSorters();

			// this.applyFiltersAndSorters("sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-1-content-build_simple_Table-1", "items");

		},
		oPayer: null,
		oField: null,
		searchBP: function (oEvent) {
			debugger;
			// this.oEventSrc = oEvent;
			// this.id = oEvent.getSource().getId();
			// this.name = oEvent.getSource().getName();
			// var that = this;

			this.oField = oEvent.getSource();
			//Because we cannot access this variable as controller object
			//inside callbacks/ promises, so we creeate a copy
			var that = this;
			if (!this.oPayer) {
				Fragment.load({
					name: 'com.sap.build.standard.pocPatientServiceAndInvoice.view.popup',
					id: 'Payer',
					controller: this
				}).then(function (oFragment) {
					//inside promise and call back functions, we cannot access this pointer
					//controller object, so we need to create a local variable for controller object
					//outside promise/callback var that = this;
					that.oPayer = oFragment;
					that.oPayer.setTitle("Search Business Partner");
					//Grant the access to the fragment from the view to the model
					that.getView().addDependent(that.oPayer);
					that.oPayer.setMultiSelect(false);
					//4th binding syntax agg binding
					that.oPayer.bindAggregation("items", {
						path: '/BusinessPartnerDetSet',
						template: new sap.m.ObjectListItem({
							title: '{PARTNER}',
							intro: '{NAME}'
						})
					});
					//check sdk functios for select dialog
					that.oPayer.open();
				});
			} else {
				this.oPayer.open();
			}
		},
		onConfirmPopup: function (oEvent) {
			debugger;
			var sId = oEvent.getSource().getId();
			if (sId.indexOf("kschl") != -1) {
				var oSelectedItemObject = oEvent.getParameter("selectedItem");
				//Extract the data from the item
				var sText = oSelectedItemObject.getTitle();
				//Set to the input field
				this.oField.setValue(sText);
				this.oField.setDescription(oSelectedItemObject.getIntro());
			} else {
				var url = "/sap/opu/odata/sap/ZGW_BILLING_APP_SRV/";
				var oModel = new sap.ui.model.odata.ODataModel(url, true);

				var sId = oEvent.getSource().getId();
				//Get the selected item object from event confirm
				var oSelectedItemObject = oEvent.getParameter("selectedItem");
				//Extract the data from the item
				var sText = oSelectedItemObject.getTitle();
				//Set to the input field
				this.oField.setValue(sText);
				this.oField.setDescription(oSelectedItemObject.getIntro());

				var efilter = "$filter=Kunnr eq '" + sText + "'";

				var url = "ContractSchemeDataSet?" + efilter;
				var that = this;
				oModel.read(url, null, null, null,
					function onSuccess(oData, oResponse) {
						that.getView().getModel("contdata").setData(oData.results)
						const data = oData.results;
						const uniqueData = {};
						data.forEach(item => {

							if (!uniqueData[item.DocNumber]) {

								uniqueData[item.DocNumber] = item;
							}
						});

						var tData = new sap.ui.model.json.JSONModel();
						tData.setData(uniqueData);
						that.getView().byId("idContType").setModel(tData, "tData")
						that.getView().byId("idContType").bindItems({
							path: "tData>/",
							template: new sap.ui.core.ListItem({
								text: "{tData>PurchNo}",
								key: "{tData>DocNumber}"
							})
						});

					},
					function _onError(oError) {
						// that.oGloablDiaglogBox.close();
					});
			}
		},
		onSelectionChange: function (oEvent) {
			debugger;
			var selectedValue = oEvent.getParameter("selectedItem").getKey();

			this.cov = this.getView().byId("idCov")

			var tCovData = new sap.ui.model.json.JSONModel();
			tCovData.setData(this.getView().getModel("contdata").getData().filter(item => item.DocNumber === selectedValue && item.CondType === 'COV'));
			if (tCovData.oData.length === 0) {
				this.getView().byId("idTabCovAmt").setValue("");
				this.getView().byId("idTabCovPer").setValue("");
			} else {
				this.getView().byId("idTabCovAmt").setValue(tCovData.oData[0].CondAmt);
				this.getView().byId("idTabCovPer").setValue(tCovData.oData[0].CondPer);
			}

			tCovData.setData(this.getView().getModel("contdata").getData().filter(item => item.DocNumber === selectedValue && item.CondType === 'DIS'));
			if (tCovData.oData.length === 0) {
				this.getView().byId("idTabDisAmt").setValue("");
				this.getView().byId("idTabDisPer").setValue("");
			} else {
				this.getView().byId("idTabDisAmt").setValue(tCovData.oData[0].CondAmt);
				this.getView().byId("idTabDisPer").setValue(tCovData.oData[0].CondPer);
			}

			const exCond = ['COV', 'DIS'];
			// const exCondArr = this.getView().getModel("contdata").getData().filter((element) => {
			// 	return !exCond.includes(element);
			//   });
			const exCondArr = this.getView().getModel("contdata").getData().filter(item => !exCond.includes(item.CondType) && item.DocNumber === selectedValue);
			this.getView().getModel("addlServ").setData(exCondArr);
		},
		onAdd: function (oEvent) {
			var table = this.getView().byId("idList");
			table.addItem(new sap.m.ColumnListItem({
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
						name: "",
						visible: true,
						width: "auto"
					}),
					new sap.m.Input({
						value: "",
						name: "",
						visible: true,
						width: "auto"
					}),
					new sap.m.ComboBox({
						selectedKey: "",
						items: [
							new sap.ui.core.ListItem({
								key: "COV",
								text: "Coverage"
							}),
							new sap.ui.core.ListItem({
								key: "DIS",
								text: "Discount"
							})
						],
						selectionChange: function (oEvent) {
							debugger;
							var selectedValue = oEvent.getParameter("selectedItem").getKey();

							if (selectedValue === 'COV') {
								oEvent.getSource().getParent().getCells()[4].setSelectedKey("");
							}
							oEvent.getSource().getParent().getCells()[4].setEnabled(selectedValue === 'DIS');
						}
					}),
					new sap.m.ComboBox({
						selectedKey: "",
						enabled: false,
						items: [
							new sap.ui.core.ListItem({
								key: "SPDS",
								text: "Special Marketing Discount"
							}),
							new sap.ui.core.ListItem({
								key: "MDS",
								text: "Membership Discount"
							}),
							new sap.ui.core.ListItem({
								key: "OTHDISC",
								text: "Other Discount"
							})
						]
					}),
					new sap.m.Text({
						text: "UPD",
						visible: false
					})
				]
			})
			);
			// this.getView().byId("idList").addItem(columnListItemNewLine);	
		},
		onAddCond: function (oEvent) {
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
						width: "auto"
					}),
					new sap.m.Text({
						text: "UPD",
						visible: false
					})
				]
			});
			this.getView().byId("idInsCond").addItem(columnListItemNewLine);
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
					id: 'kschl',
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
		onChange: function (oEvent) {
			debugger;
		},
		onExit: function () {

			// to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
			var aControls = [{
				"controlId": "sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-1-content-build_simple_Table-1",
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

		},
		onAfterRendering: function () {

			var oChart,
				self = this,
				oBindingParameters = this.oBindingParameters,
				oView = this.getView();

		}
	});
}, /* bExport= */ true);
