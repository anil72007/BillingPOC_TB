sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/m/MessageBox",
	"./utilities",
	"../model/GroupState",
	"sap/ui/core/routing/History",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	"com/sap/build/standard/pocPatientServiceAndInvoice/utils/format"
], function (ManagedObject, MessageBox, Utilities, GroupState,History, Filter, FilterOperator,format) {
	formatter: format
	return ManagedObject.extend("com.sap.build.stand	ard.pocPatientServiceAndInvoice.controller.InvoiceList", {
		constructor: function (oView) {

			this._oView = oView;
			this._oControl = sap.ui.xmlfragment(oView.getId(), "com.sap.build.standard.pocPatientServiceAndInvoice.view.InvoiceList", this);
			this._bInit = false;


		},
		onInit: function () {
			debugger;
			this.cData = this.getOwnerComponent().getCompData();
			var url = "/sap/opu/odata/sap/ZGW_BILLING_APP_SRV/";
			var oModel = new sap.ui.model.odata.ODataModel(url, true);
			var oInitialSorter = new sap.ui.model.Sorter("Kunrg");
			this._oGroupState = new GroupState(oInitialSorter, this.getOwnerComponent().getModel("i18n").getResourceBundle());

			this.invoice = new sap.ui.model.json.JSONModel();
			this.invTab = this.getView().byId("idInvoiceTab");

			this.getView().setModel(this.invoice, "invoice");
			// this.invTab.setModel(this.invoice);
			
			this.listInvoice = this.getView().byId("idInvoiceList");
			if (this.listInvoice) {
				this.listInvoiceTemp = this.listInvoice.clone();
			}

			var headItem = this.cData.results[0].To_Items.results.filter(item => item.ItemCateg === 'ZADH');
			var existingItem = headItem[headItem.length - 1];			
			var efilter = "$filter=Vbeln eq '" + existingItem.DocNumber + "'";


			var url = "InvoiceSet?" + "&&" + efilter;
			var that = this;
			this.oGloablDiaglogBox.open();
			oModel.read(url, null, null, null,
				function onSuccess(oData, oResponse) {
					debugger;
					var aSorters = that._oGroupState.groupBy("Kunrg");
					that.oGloablDiaglogBox.close();
					that.invoice.setData(oData.results);
					that.invTab.getBinding("items").sort(aSorters);
				},
				function _onError(oError) {
					that.oGloablDiaglogBox.close();
				}
			);			
		},
		exit: function () {
			delete this._oView;
		},

		getView: function () {
			return this._oView;
		},

		getControl: function () {
			return this._oControl;
		},

		getOwnerComponent: function () {
			return this._oView.getController().getOwnerComponent();
		},
		onSubmitButtonPressed: function(oEvent){
			debugger;
			var cData = this.getOwnerComponent().getCompData();
			if (cData.results[0].To_Items.results[0].DocNumber) {
				this.data = { "Vbeln": cData.results[0].To_Items.results[0].DocNumber };

				var url = "/sap/opu/odata/sap/ZGW_BILLING_APP_SRV/";
				var oModel = new sap.ui.model.odata.ODataModel(url, true);
				var that = this;
				oModel.create("/InvoiceSet", this.data, {
					method: "POST",
					success: function (oResultData, oResponse) {
						debugger;
						sap.m.MessageToast.show(oResultData.Zukri);
						var oData = that.getView().getModel("invoice").getData();
						oData.push(oResultData);
						that.getView().getModel("invoice").setData(oData);

					},
					error: function (e) {
						debugger;
						sap.m.MessageToast.show("Error while creating Invoice");


					}
				});
			}
		},
		_onButtonPress1: function () {
			
			this.close();

		},
		open: function () {
			debugger;
			var oView = this._oView;
			var oControl = this._oControl;

			// }
			if (!this._bInit) {
				this.oGloablDiaglogBox = new sap.m.BusyDialog();
				// Initialize our fragment
				this.onInit();

				this._bInit = true;

				// connect fragment to the root view of this component (models, lifecycle)
				oView.addDependent(oControl);
			}

			var args = Array.prototype.slice.call(arguments);
			if (oControl.open) {
				oControl.open.apply(oControl, args);
			} else if (oControl.openBy) {
				oControl.openBy.apply(oControl, args);
			}
		},

		close: function () {
			this._oControl.close();
		},

		setRouter: function (oRouter) {
			this.oRouter = oRouter;

		},
		getBindingParameters: function () {
			return {};

		},
		_onButtonPress: function (oEvent) {
			debugger;
			this.close();


		},
		doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			debugger;
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
				var sPath = oBindingContext.sPath;
				var myId = sPath.split("/")[sPath.split("/").length - 1];
				this.oRouter.navTo(sRouteName, { OrdNumber: myId });
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

		},
		_onButtonPress1: function () {
			debugger;
			this.close();

		},
		filterPrice: function (oEvent) {

		},


		handleSelectionChange: function (oEvent) {


		},
		onSelect: function (oEvent) {
			debugger;

		},
		handleSelectionFinish: function (oEvent) {



		},
		onSearch: function (oEvent) {
			debugger;

		},
		onExit: function () {
			this._oDialog.destroy();

			// to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
			var aControls = [{
				"controlId": "sap_m_Dialog_0-content-sap_m_ScrollContainer-1670309517575-content-build_simple_Table-1670309559486",
				"groups": ["items"]
			}, {
				"controlId": "sap_m_Dialog_0-content-sap_m_VBox-1670308591528-items-build_simple_Table-1670309239976",
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
