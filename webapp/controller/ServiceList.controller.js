sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./ServiceSearch",
	"./InvoiceList",
	"./Log",
	"./utilities",
	"sap/ui/core/routing/History",
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV',
	'sap/ui/core/Fragment',
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Text",
	"com/sap/build/standard/pocPatientServiceAndInvoice/utils/format"
], function (BaseController, MessageBox, ServiceSearch, InvoiceList, Log, Utilities, History, Export, ExportTypeCSV, Fragment, Dialog, Button, Text, format) {
	"use strict";
	this.invData = ""
	return BaseController.extend("com.sap.build.standard.pocPatientServiceAndInvoice.controller.ServiceList", {
		formatter: format,

		handleRouteMatched: function (oEvent) {

		},
		onAfterRendering: function () {

		},
		onDeleteRow: function (oEvent) {

			var oTable = oEvent.getSource();
			var oSelectedItem = oEvent.getParameter("listItem");
			if (oEvent.getSource().getModel().getProperty(oSelectedItem.getBindingContext().sPath).BillStatus === 'C') {
				MessageBox.error("This Item is completely Billed and cannot be deleted!!!");
			} else {
				var that = this;
				this.openConfirmationDialog("Are you sure you want to delete this item?", function (result) {
					if (result === true) {
						oTable.removeItem(oSelectedItem);
						var array = that.getView().getModel("main").getData().To_Items.results;
						var value = oSelectedItem.getCells()[1].getText();
						const index = array.findIndex(element => element["ItmNumber"] === value);
						if (index !== -1) {
							
							if (that.getView().getModel("main").getData().To_Items.results[index].Mode === 'INS') {
								that.getView().getModel("main").getData().To_Items.results.splice(index, 1);
							} else {
								that.getView().getModel("main").getData().To_Items.results[index].Mode = 'DEL';
							}
						}
					} else {
						// User clicked "No", do nothing
					}
				});
			}
			// this.getView().getModel("main").refresh();
		},
		openConfirmationDialog: function (message, callback) {
			var dialog = new Dialog({
				title: "Confirmation",
				type: "Message",
				content: new Text({
					text: message
				}),
				beginButton: new Button({
					text: "Yes",
					press: function () {
						dialog.close();
						callback(true);
					}
				}),
				endButton: new Button({
					text: "No",
					press: function () {
						dialog.close();
						callback(false);
					}
				})
			});

			dialog.open();
		},
		onDataExport: function (oEvent) {

			var oExport = new Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType: new ExportTypeCSV({
					separatorChar: ";"
				}),

				// Pass in the model created above
				models: this.getView().getModel("main"),

				// binding information for the rows aggregation
				rows: {
					path: "/To_Items"
				},

				// column definitions with column name and binding info for the content

				columns: [{
					name: "Document Number",
					template: {
						content: "{DocNumber}"
					}
				}, {
					name: "Item Number",
					template: {
						content: "{ItmNumber}"
					}
				}, {
					name: "Material ",
					template: {
						content: "{Material}"
					}
				}, {
					name: "Description",
					template: {
						content: "{ShortText}"
					}
				}, {
					name: "Price",
					template: {
						content: "{NetValue}"
					}
				}]
			});

			// download exported file
			oExport.saveFile().catch(function (oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});
		},
		onNavBack: function () {
			this.getView().getModel().refresh();
			this.getOwnerComponent().setCompData([]);
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
		getCaseItemData: function (oEvent) {

			var url = "/sap/opu/odata/sap/ZGW_BILLING_APP_SRV/";
			var oModel = new sap.ui.model.odata.ODataModel(url, true);

			
			const str = oEvent.getParameters().arguments.OrdNumber;
			const start = str.indexOf("'") + 1; // finds the index of the first single quote and adds 1 to skip it
			const end = str.lastIndexOf("'"); // finds the index of the last single quote
			const literal = str.substring(start, end); // extracts the substring between the single quotes
			const value = parseInt(literal);

			this.ordData = value;

			var aFilters = new Array();
			var ordID = new sap.ui.model.Filter({ path: "CaseOrder", operator: sap.ui.model.FilterOperator.EQ, value1: this.ordData })
			aFilters.push(ordID);
			var efilter = "$filter=CaseOrder eq '" + this.ordData + "'";

			var url = "GetCaseDataSet?$expand=To_ItemCond,To_Items,To_Movement,To_Message" + "&&" + efilter;

			var that = this;

			if (!this.getOwnerComponent().getCompData().results) {
				
				this.oGloablDiaglogBox.open();
				oModel.read(url, null, { filters: aFilters }, null,
					function onSuccess(oData, oResponse) {
						that.oGloablDiaglogBox.close();
						if (oData.results.length === 0) {
							MessageBox.error("Error while fetching Data!!!");
							that.onNavBack();
						}
						that.getOwnerComponent().setCompData(oData);
						that.getView().getModel("main").setData(oData.results[0]);

					},
					function _onError(oError) {
						that.oGloablDiaglogBox.close();
					}

				);
			}
			var ordID = oEvent.getParameter("arguments").OrdNumber;
			var sPath = '/' + ordID;
			this.getView().bindElement(sPath, {
				expand: 'To_Items'
			});

			if (this.getOwnerComponent().getItem() !== "") {
				this.setPrice(this.getView().byId("idtab"), this.getOwnerComponent().getItem());
				this.setPrice(this.getView().byId("idRoomChg"), this.getOwnerComponent().getItem());
				this.setPrice(this.getView().byId("idConsumable"), this.getOwnerComponent().getItem());
				this.setPrice(this.getView().byId("idMedication"), this.getOwnerComponent().getItem());
				this.setPrice(this.getView().byId("idExamination"), this.getOwnerComponent().getItem());
				this.setPrice(this.getView().byId("idClinical"), this.getOwnerComponent().getItem());

				this.getOwnerComponent().setItem("");
			}
		},
		setPrice(oTable, tItem) {
			var oContext = oTable.getBindingContext();

			// Get the binding object of your table
			var oBinding = oTable.getBinding("items");
			for (var j = 0; j < oTable.getItems().length; j++) {
				if (!oTable.getItems()[j].isGroupHeader()) {
					if (oTable.getItems()[j].getCells()[1].getText() === tItem) {
						var tPrice = 0;
						var tData = this.getOwnerComponent().getCompData().results[0].To_ItemCond.results.filter(item => item.ItmNumber === tItem);
						for (var i = 0; i < tData.length; i++) {
							tPrice = tPrice + parseInt(tData[i].CondValue);
						}
						oTable.getItems()[j].getCells()[5].setNumber(tPrice);
					}
				}
			}
		},
		oPopupMessage: null, oCondType: null,
		onSaveItems: function (oEvent) {

			var url = "/sap/opu/odata/sap/ZGW_BILLING_APP_SRV/";
			var oModel = new sap.ui.model.odata.ODataModel(url, true);

			var cData = this.getOwnerComponent().getCompData().results[0];
			var that = this;
			this.oMessage = new sap.ui.model.json.JSONModel();
			this.oGloablDiaglogBox.open();
			this.popupView = null;
			oModel.create("/GetCaseDataSet", cData, {
				method: "POST",
				success: function (oResultData, oResponse) {
					that.oGloablDiaglogBox.close();
					if (!that.popupView) {
						that.popupView = sap.ui.xmlfragment("com.sap.build.standard.pocPatientServiceAndInvoice.view.Messages", that);
					}
					that.oMessage.setData(oResultData.To_Message);

					that.popupView.setModel(that.oMessage, "message");
					var dialog = new sap.m.Dialog({
						title: "Messages",
						contentWidth: "600px",
						contentHeight: "600px",
						content: that.popupView,
						beginButton: new sap.m.Button({
							text: "OK",
							press: function () {
								
								window.location.reload();
								that.popupView.destroy();
								dialog.close();
							}
						})
					});

					dialog.open();


				},
				error: function (e) {

					sap.m.MessageToast.show("Error while creating ");
					that.oGloablDiaglogBox.close();

				}
			});





		},
		_onButtonPress: function (oEvent) {

			var sDialogName = "ServiceSearch";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];
			if (!oDialog) {
				oDialog = new ServiceSearch(this.getView());
				this.mDialogs[sDialogName] = oDialog;

				// For navigation.
				oDialog.setRouter(this.oRouter);
			}

			var context = oEvent.getSource().getBindingContext();
			oDialog._oControl.setBindingContext(context);

			oDialog.open();

		},
		_onButtonInvoice: function (oEvent) {

			var sDialogName = "InvoiceList";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];
			if (!oDialog) {
				oDialog = new InvoiceList(this.getView());
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
		_onMenuItemPress: function (oEvent) {

			var cData = this.getOwnerComponent().getCompData();
			if (cData.results[0].To_Items.results[0].DocNumber) {
				this.data = { "Vbeln": cData.results[0].To_Items.results[0].DocNumber };

				var url = "/sap/opu/odata/sap/ZGW_BILLING_APP_SRV/";
				var oModel = new sap.ui.model.odata.ODataModel(url, true);

				oModel.create("/InvoiceSet", this.data, {
					method: "POST",
					success: function (oResultData, oResponse) {

						sap.m.MessageToast.show(oResultData.Ktext);


					},
					error: function (e) {

						sap.m.MessageToast.show("Error while creating Invoice");


					}
				});
			}


		},
		doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation, oEvent) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet, sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				
				if (sRouteName === "InsuranceRelationship_1") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					var ItmNumber = oEvent.getParameter("listItem").getCells()[1].getText();
					this.oRouter.navTo("ConditionDetails", {
						ItmNumber: ItmNumber
					});
				}
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

		},
		_onMenuItemPress1: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("InvoicePayment", oBindingContext, fnResolve, "", oEvent);
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onButtonPress1: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("InsuranceRelationship_1", oBindingContext, fnResolve, "", oEvent);
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onToggleButtonPress: function (oEvent) {

			var sDialogName = "Log";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];
			if (!oDialog) {
				oDialog = new Log(this.getView());
				this.mDialogs[sDialogName] = oDialog;

				// For navigation.
				oDialog.setRouter(this.oRouter);
			}

			var context = oEvent.getSource().getBindingContext();
			oDialog._oControl.setBindingContext(context);

			oDialog.open();

		},
		_onTableItemPress: function (oEvent) {

			var oBindingContext = oEvent.getParameter("listItem").getBindingContext();

			return new Promise(function (fnResolve) {
				this.doNavigate("ServiceDetail", oBindingContext, fnResolve, "", oEvent);
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onTableItemPress1: function (oEvent) {

			var oBindingContext = oEvent.getParameter("listItem").getBindingContext();

			return new Promise(function (fnResolve) {
				this.doNavigate("ServiceDetail", oBindingContext, fnResolve, "", oEvent);
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onTableItemPress2: function (oEvent) {

			var oBindingContext = oEvent.getParameter("listItem").getBindingContext();

			return new Promise(function (fnResolve) {
				this.doNavigate("ServiceDetail", oBindingContext, fnResolve, "", oEvent);
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onTableItemPress3: function (oEvent) {

			var oBindingContext = oEvent.getParameter("listItem").getBindingContext();

			return new Promise(function (fnResolve) {
				this.doNavigate("ServiceDetail", oBindingContext, fnResolve, "", oEvent);
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onTableItemPress4: function (oEvent) {

			var oBindingContext = oEvent.getParameter("listItem").getBindingContext();

			return new Promise(function (fnResolve) {
				this.doNavigate("ServiceDetail", oBindingContext, fnResolve, "", oEvent);
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},

		onInit: function () {
			// 
			history.pushState(null, null, location.href);
			var that = this;
			window.onpopstate = function () {
				if (location.pathname === '/index.html') {
					
				}
			};
			this.adminChg = this.getView().byId("idtab");
			this.roomChg = this.getView().byId("idRoomChg");
			this.consumable = this.getView().byId("idConsumable");
			this.medication = this.getView().byId("idMedication");
			this.examination = this.getView().byId("idExamination");

			
			this.oDataSer = new sap.ui.model.json.JSONModel();

			this.getView().setModel(this.oDataSer, "main");
			this.fldVal = new sap.ui.model.json.JSONModel();
			this.roomChgData = new sap.ui.model.json.JSONModel();
			this.consumableData = new sap.ui.model.json.JSONModel();
			this.medicationData = new sap.ui.model.json.JSONModel();
			this.examinationData = new sap.ui.model.json.JSONModel();

			this.ordData = "";
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("ServiceList1").attachMatched(this.getCaseItemData, this);
			
			this.oGloablDiaglogBox = new sap.m.BusyDialog();


		},
		onExit: function () {
			this.getOwnerComponent().setCompData([]);
			// to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
			var aControls = [{
				"controlId": "sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-1-content-build_simple_Table-1672824753670",
				"groups": ["items"]
			}, {
				"controlId": "sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-1666936268157-content-build_simple_Table-1672800635917",
				"groups": ["items"]
			}, {
				"controlId": "sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-1666936288237-content-build_simple_Table-1",
				"groups": ["items"]
			}, {
				"controlId": "sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-1666936323795-content-build_simple_Table-1",
				"groups": ["items"]
			}, {
				"controlId": "sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-1666936454140-content-build_simple_Table-1",
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
