sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	"com/sap/build/standard/pocPatientServiceAndInvoice/model/GroupState",
], function (ManagedObject, MessageBox, Utilities, History, Filter, FilterOperator,GroupState) {

	return ManagedObject.extend("com.sap.build.standard.pocPatientServiceAndInvoice.controller.ServiceSearch", {
		constructor: function (oView) {

			this._oView = oView;
			this._oControl = sap.ui.xmlfragment(oView.getId(), "com.sap.build.standard.pocPatientServiceAndInvoice.view.ServiceSearch", this);
			this._bInit = false;


		},
		onInit: function () {
			
			this.idMatGrpTab = "";
			this._oDialog = this.getControl();
			this.cData = this.getOwnerComponent().getCompData();

			var oInitialSorter = new sap.ui.model.Sorter("ShortText");
			this._oGroupState = new GroupState(oInitialSorter, this.getOwnerComponent().getModel("i18n").getResourceBundle());

			this.oData = {};
			var url = "/sap/opu/odata/sap/ZGW_BILLING_APP_SRV/";
			var oModel = new sap.ui.model.odata.ODataModel(url, true);
			this.service = new sap.ui.model.json.JSONModel();
			this.movement = new sap.ui.model.json.JSONModel();

			
			this.movTab = this.getView().byId("idMovement");

			this.listMovement = this.getView().byId("idListMovement");
			if (this.listMovement) {
				this.oTempMovement = this.listMovement.clone();
			}
			this.movement.setData(this.cData.results[0].To_Movement.results);
			this.movTab.setModel(this.movement);
			this.movTab.bindAggregation("items", {
				path: "/",
				template: this.oTempMovement
			});

			var that = this;
			oModel.read("/GetServiceSet", null, null, null,
				function onSuccess(oData, oResponse) {

					that.oData = oData;
					const data = oData.results;
					const uniqueData = {};
					data.forEach(item => {

						if (!uniqueData[item.Clas2]) {

							uniqueData[item.Clas2] = item;
						}
					});

					that.service.setData(uniqueData);

				},
				function _onError(oError) {

				}
			);
			this.getView().getModel().refresh();
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

		open: function () {

			var oView = this._oView;
			var oControl = this._oControl;
			this.getView().byId("idSrcSearch").removeAllItems();
			this.getView().byId("treeTable").clearSelection();

			if (!this._bInit) {

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
			// 
			var url = "/sap/opu/odata/sap/ZGW_BILLING_APP_SRV/";
			var oModel = new sap.ui.model.odata.ODataModel(url, true);

			if(this.getView().byId("idMovement").getSelectedItems().length === 0){
				MessageBox.error("Please select the Movement for adding the Line Item");
				return;
			}
			var addItems = this.getView().byId("idSrcSearch").getSelectedItems();
			var headItem = this.getView().getModel("main").getData().To_Items.results.filter(item => item.ItemCateg === 'ZADH');

			var itemno = headItem[headItem.length - 1].ItmNumber;
			var lineItem = parseInt(itemno, 10);

			let currentDate = new Date();
			let options = { dateStyle: 'short' };
			let dateString = currentDate.toLocaleDateString(undefined, options);
			var oData = this.getView().getModel("main").getData();
			let now = new Date();

			for (var i = 0; i < addItems.length; i++) {
				lineItem = lineItem + 10;
				let res = lineItem.toString().padStart(itemno.length, '0')
				var data = {
					"CreatDate": now,
					"Currency": "SGD",
					"DocNumber": this.getView().byId("idtab").getItems()[this.getView().byId("idtab").getItems().length - 1].getCells()[0].getTitle(),
					"HgLvItem": "000000",
					"ItemCateg": "ZADH",
					"ItmNumber": res,
					"MatEntrd": this.getView().byId("idSrcSearch").getSelectedItems()[i].getCells()[0].getTitle(),
					"Material": this.getView().byId("idSrcSearch").getSelectedItems()[i].getCells()[0].getTitle(),
					"MatlGroup": "OSS000000",
					"NetValue": "0",
					"ObjNrIt": "",
					"PrcGroup1": "",
					"PrcGroup2": "",
					"PrcGroup3": "",
					"PrcGroup4": "",
					"PrcGroup5": "",
					"ReqQty": "1",
					"SalesUnit": "",
					"ShortText": this.getView().byId("idSrcSearch").getSelectedItems()[i].getCells()[1].getText(),
					"Mode": "INS"
				};
				oData.To_Items.results.push(data);
				var efilter = "$filter=ITM_NUMBER eq '" + res + "' and PARTN_NUMB eq '" + oData.PartNo + "' and MATERIAL eq '"
					+ this.getView().byId("idSrcSearch").getSelectedItems()[i].getCells()[0].getTitle() + "'";

				var url = "SimPriceHeadSet?$expand=To_SimPrice" + "&&" + efilter;
				var that = this;
				oModel.read(url, null, null, null,
					function onSuccess(oData, oResponse) {
						
						var tPrice = 0;
						var tItem = "";
						for (var i = 0; i < oData.results[0].To_SimPrice.results.length; i++) {
							tItem = oData.results[0].To_SimPrice.results[i].ItmNumber;
							var itemCond = {
								"SdDoc": that.getView().byId("idtab").getItems()[that.getView().byId("idtab").getItems().length - 1].getCells()[0].getTitle(),
								"ItmNumber": oData.results[0].To_SimPrice.results[i].ItmNumber,
								"CondType": oData.results[0].To_SimPrice.results[i].CondType,
								"CondTypeDesc": oData.results[0].To_SimPrice.results[i].CondTypeDesc,
								"CondValue": oData.results[0].To_SimPrice.results[i].CondValue

							};
							tPrice = tPrice + parseInt(oData.results[0].To_SimPrice.results[i].CondValue);
							that.getView().getModel("main").getData().To_ItemCond.results.push(itemCond);
						}
						var itemUpd = that.getView().getModel("main").getData().To_Items.results.filter(item => item.ItmNumber === tItem);
						itemUpd[0].NetValue = tPrice.toString();
						that.getView().getModel("main").refresh();

						var oTable = that.getView().byId(that.idMatGrpTab);
						var oContext = oTable.getBindingContext();

						// Get the binding object of your table
						var oBinding = oTable.getBinding("items");
						for (var j = 0; j < oTable.getItems().length; j++) {
							if(!oTable.getItems()[j].isGroupHeader()){
								if(oTable.getItems()[j].getCells()[1].getText() === tItem){
									oTable.getItems()[j].getCells()[5].setNumber(tPrice);

								}
							}
							
						}
					},
					function _onError(oError) {
						
					}

				);

				var columnListItemNewLine = new sap.m.ColumnListItem({
					highlight: "Warning",
					selected: true,
					type: "Navigation",
					cells: [

						new sap.m.ObjectIdentifier({
							title: this.getView().byId("idtab").getItems()[this.getView().byId("idtab").getItems().length - 1].getCells()[0].getTitle(),
							visible: true
						}),
						new sap.m.Text({
							text: res,
							visible: true
						}),
						new sap.m.Text({
							text: this.getView().byId("idSrcSearch").getSelectedItems()[i].getCells()[0].getTitle(),
							visible: true
						}),
						new sap.m.Text({
							text: this.getView().byId("idSrcSearch").getSelectedItems()[i].getCells()[1].getText(),
							visible: true
						}),
						new sap.m.Text({
							text: "1",
							visible: true
						}),
						new sap.m.ObjectNumber({
							number: 0,
							unit: "SGD",
							emphasized: true
						}),
						new sap.m.Text({
							text: now.toLocaleDateString('en-US'),
							type: 'sap.ui.model.type.Date',
							formatOptions: { UTC: true, style: 'short' },
							visible: true
						}),
						new sap.m.Text({
							text: "INS",
							visible: false
						})
					]
				});

				if(this.getView().byId("idSrcSearch").getSelectedItems()[i].getCells()[2].getText() === '001'){
					this.idMatGrpTab = "idtab";
				}else if(this.getView().byId("idSrcSearch").getSelectedItems()[i].getCells()[2].getText() === '002'){
					this.idMatGrpTab = "idRoomChg";
				}else if(this.getView().byId("idSrcSearch").getSelectedItems()[i].getCells()[2].getText() === '003'){
					this.idMatGrpTab = "idConsumable";
				}else if(this.getView().byId("idSrcSearch").getSelectedItems()[i].getCells()[2].getText() === '004'){
					this.idMatGrpTab = "idConsumable";
				}else if(this.getView().byId("idSrcSearch").getSelectedItems()[i].getCells()[2].getText() === '005'){
					this.idMatGrpTab = "idExamination";
				}else if(this.getView().byId("idSrcSearch").getSelectedItems()[i].getCells()[2].getText() === '006'){
					this.idMatGrpTab = "idClinical";
				}
				if(this.idMatGrpTab){
					this.getView().byId(this.idMatGrpTab).addItem(columnListItemNewLine);
				}
				

			}
			this.getView().getModel("main").setData(oData);
			this.getOwnerComponent().setCompData(this.cData);
			this.close();
		},
		doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			
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
			
			this.close();

		},
		filterPrice: function (oEvent) {

		},


		handleSelectionChange: function (oEvent) {


		},
		onSelect: function (oEvent) {
			
			this.srvSearchModel = new sap.ui.model.json.JSONModel();
			this.srvSearchTab = this.getView().byId("idSrcSearch");
			this.listSrcSearch = this.getView().byId("idListSrcSearch");
			if (this.listSrcSearch) {
				this.oTemplate = this.listSrcSearch.clone();
			}

			var aSelectedIndices = oEvent.getSource().getSelectedIndices();
			var oclas2 = [];
			for (var i = 0; i < aSelectedIndices.length; i++) {
				var oContext = oEvent.getSource().getContextByIndex(aSelectedIndices[i]);
				oclas2.push(oContext.getObject().Clas2);
			}

			this.srvSearchModel.setData(this.oData.results.filter(item => oclas2.includes(item.Clas2)));
			this.srvSearchTab.setModel(this.srvSearchModel);

			this.srvSearchTab.bindAggregation("items", {
				path: "/",
				template: this.oTemplate
			});
		},
		handleSelectionFinish: function (oEvent) {



		},
		onSearch: function (oEvent) {
			
			var sVal = oEvent.getSource().getValue();
			var oFilter1 = new Filter("Objecttext", FilterOperator.Contains, sVal);
			this.getView().byId("idSrcSearch").getBinding("items").filter(oFilter1);
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
