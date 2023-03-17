sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
], function (ManagedObject, MessageBox, Utilities, History, Filter, FilterOperator) {

	return ManagedObject.extend("com.sap.build.standard.pocPatientServiceAndInvoice.controller.ServiceSearch", {
		constructor: function (oView) {

			this._oView = oView;
			this._oControl = sap.ui.xmlfragment(oView.getId(), "com.sap.build.standard.pocPatientServiceAndInvoice.view.ServiceSearch", this);
			this._bInit = false;


		},
		onInit: function () {
			debugger;
			this.idMatGrpTab = "";
			this._oDialog = this.getControl();
			this.cData = this.getOwnerComponent().getCompData();

			this.oData = {};
			var url = "/sap/opu/odata/sap/ZGW_BILLING_APP_SRV/";
			var oModel = new sap.ui.model.odata.ODataModel(url, true);
			this.service = new sap.ui.model.json.JSONModel();
			this.movement = new sap.ui.model.json.JSONModel();

			// this.srvTab = this.getView().byId("idSrvGrp");
			this.movTab = this.getView().byId("idMovement");

			// this.listitem = this.getView().byId("idSrvGrpListItem");
			// if (this.listitem) {
			// 	this.oTemplate = this.listitem.clone();
			// }

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

			// this.getView().byId("idSrvGrp").setFilterFunction(function (sTerm, oItem) {
			// 	// A case-insensitive 'string contains' filter
			// 	return new RegExp("^" + sTerm, "i").test(oItem.getText());
			// });

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
					// const newJsonData = JSON.stringify(Object.values(uniqueData));
					that.service.setData(uniqueData);
					// that.srvTab.setModel(that.service);
					// that.srvTab.bindAggregation("items", {
					// 	path: "/",
					// 	template: that.oTemplate
					// });
				},
				function _onError(oError) {

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

		open: function () {
			debugger;

			// const data =  [
			// 	{
			// 		"text": "Node1",
			// 		"ref": "sap-icon://attachment-audio",
			// 		"nodes":
			// 		[
			// 			{
			// 				"text": "Node1-1",
			// 				"ref": "sap-icon://attachment-e-pub",
			// 				"nodes":[
			// 					{
			// 						"text": "Node1-1-1",
			// 						"ref": "sap-icon://attachment-html"
			// 					},
			// 					{
			// 						"text": "Node1-1-2",
			// 						"ref": "sap-icon://attachment-photo",
			// 						"nodes":[
			// 							{
			// 								"text": "Node1-1-1",
			// 								"ref": "sap-icon://attachment-text-file",
			// 								"nodes":[
			// 									{
			// 										"text": "Node1-1-1-1",
			// 										"ref": "sap-icon://attachment-video"
			// 									},
			// 									{
			// 										"text": "Node1-1-1-2",
			// 										"ref": "sap-icon://attachment-zip-file"
			// 									},
			// 									{
			// 										"text": "Node1-1-1-3",
			// 										"ref": "sap-icon://course-program"
			// 									}
			// 								]
			// 							}
			// 						]
			// 					}
			// 				]
			// 			},
			// 			{
			// 				"text": "Node1-2",
			// 				"ref": "sap-icon://create"
			// 			}
			// 		]
			// 	},
			// 	{
			// 		"text": "Node2",
			// 		"ref": "sap-icon://customer-financial-fact-sheet"
			// 	}
			// ];

			//   // Create the JSON model and set it to the view
			//   const model = new sap.ui.model.json.JSONModel(data);
			//   this.getView().setModel(model,"TreeExample");

			var oView = this._oView;
			var oControl = this._oControl;
			this.getView().byId("idSrcSearch").removeAllItems();
			this.getView().byId("treeTable").clearSelection();
			// this.getView().byId("treeTable").getSelectionModel().removeSelections();
			// if(this.getView().byId("treeTable").getSelectionModel()){

			// }
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
			// debugger;
			var url = "/sap/opu/odata/sap/ZGW_BILLING_APP_SRV/";
			var oModel = new sap.ui.model.odata.ODataModel(url, true);


			var addItems = this.getView().byId("idSrcSearch").getSelectedItems();
			var headItem = this.getView().getModel("main").getData().To_Items.results.filter(item => item.ItemCateg === 'ZADH');

			var itemno = headItem[headItem.length - 1].ItmNumber;
			var lineItem = parseInt(itemno, 10);

			let currentDate = new Date();
			let options = { dateStyle: 'short' };
			let dateString = currentDate.toLocaleDateString(undefined, options);
			var oData = this.getView().getModel("main").getData();
			let now = new Date();
			// let currentTime = "/Date(" + now.getTime() + ")/";

			// var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
			// 	pattern: "kk:mm:ss"
			// });
			// var tz = new Date(0).getTimezoneOffset() * 60 * 1000;
			// var timeStr = timeFormat.format(new Date(now.ms + tz));


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
						debugger;
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
							
							if(oTable.getItems()[j].getCells()[1].getText() === tItem){
								oTable.getItems()[j].getCells()[5].setNumber(tPrice);
							}
						}
					},
					function _onError(oError) {
						debugger;
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
				// columnListItemNewLine.highlight();
				// this.getView().byId("idSrcSearch").attachEventOnce("updateFinished", function() {
				// 	// Get a reference to the new row in the table
				// 	let selectedRow = this.getView().byId("idSrcSearch").getItems()[newRowIndex];
				// 	// Add the CSS class to the new row
				// 	selectedRow.addStyleClass("highlighted-row");
				//   });
				
				if(this.getView().byId("idSrcSearch").getSelectedItems()[i].getCells()[2].getText() === 'OSS000000'){
					this.idMatGrpTab = "idtab";
				}else if(this.getView().byId("idSrcSearch").getSelectedItems()[i].getCells()[2].getText() === 'OSB000000'){
					this.idMatGrpTab = "idRoomChg";
				}else if(this.getView().byId("idSrcSearch").getSelectedItems()[i].getCells()[2].getText() === 'RAWMAT1'){
					this.idMatGrpTab = "idConsumable";
				}else if(this.getView().byId("idSrcSearch").getSelectedItems()[i].getCells()[2].getText() === 'RAWMAT2'){
					this.idMatGrpTab = "idConsumable";
				}else if(this.getView().byId("idSrcSearch").getSelectedItems()[i].getCells()[2].getText() === 'OSC000000'){
					this.idMatGrpTab = "idExamination";
				}
				if(this.idMatGrpTab){
					this.getView().byId(this.idMatGrpTab).addItem(columnListItemNewLine);
				}
				

			}
			this.getView().getModel("main").setData(oData);
			this.getOwnerComponent().setCompData(this.cData);
			this.close();
			// var oBindingContext = oEvent.getSource().getBindingContext();

			// // var sPath = oBindingContext.sPath;
			// // var myId = sPath.split("/")[sPath.split("/").length - 1];
			// // // var myId = oEvent.getParameter("listItem").getBindingContext().getModel().oData[oEvent.getParameter("listItem").getBindingContext().getPath().substring(1)].CaseOrder;
			// // // this.oRouter = this.getOwnerComponent().getRouter();
			// // this.oRouter.navTo("ServiceList1",{
			// // 	OrdNumber : myId
			// // });

			// return new Promise(function (fnResolve) {

			// 	this.doNavigate("ServiceList2", oBindingContext, fnResolve, "");
			// }.bind(this)).catch(function (err) {
			// 	if (err !== undefined) {
			// 		MessageBox.error(err.message);
			// 	}
			// });

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
			// debugger;
			// var oTreeTable = this.getView().byId("treeTable");

			// var oBinding = oTreeTable.getBinding("rows");
			// var oFilter = new sap.ui.model.Filter("Object", sap.ui.model.FilterOperator.EQ, "000000000000000016");

			// oTreeTable.bindRows({
			// 		path: "/GetServiceSet",
			// 		parameters : {
			// 			countMode: "Inline",
			// 			treeAnnotationProperties : {
			// 				hierarchyLevelFor : 'TreeLevel',
			// 				hierarchyNodeFor : 'Node',
			// 				hierarchyParentNodeFor : 'Parent',
			// 				hierarchyDrillStateFor : 'Drillstate'
			// 			}
			// 		}
			// 	});

			// oTreeTable.bindAggregation("rows", {
			// 	path: "/GetServiceSet",
			// 	filters: [
			// 		new sap.ui.model.Filter("Object", sap.ui.model.FilterOperator.EQ, "000000000000000016")
			// 	],
			// 	parameters: {

			// 		treeAnnotationProperties: {
			// 			hierarchyLevelFor: 'TreeLevel',
			// 			hierarchyNodeFor: 'Node',
			// 			hierarchyParentNodeFor: 'Parent',
			// 			hierarchyDrillStateFor: 'Drillstate'
			// 		}
			// 	}
			// });
			// oBinding.filter(oFilter);
		},


		handleSelectionChange: function (oEvent) {

			// var changedItem = oEvent.getParameter("changedItem");
			// var isSelected = oEvent.getParameter("selected");

			// this.srvSearchModel = new sap.ui.model.json.JSONModel();
			// this.srvSearchTab = this.getView().byId("idSrcSearch");
			// if (this.srvSearchTab.getModel().getData()) {
			// 	this.srvSearch = this.srvSearchTab.getModel().getData();
			// }


			// this.listSrcSearch = this.getView().byId("idListSrcSearch");
			// if (this.listSrcSearch) {
			// 	this.oTemplate = this.listSrcSearch.clone();
			// }
			// if (!isSelected) {
			// 	this.srvSearchTab.getModel().setData(this.srvSearchTab.getModel().getData().filter(item => item.Clas2 !== changedItem.mProperties.key));
			// } else {
			// 	var oclas2 = [];
			// 	oclas2.push(changedItem.mProperties.key);
			// 	if (this.srvSearchTab.getModel().getData()) {
			// 		for (var i = 0; i < this.srvSearchTab.getModel().getData().length; i++) {
			// 			oclas2.push(this.srvSearchTab.getModel().getData()[i].Clas2)
			// 		}
			// 	}
			// 	this.srvSearchModel.setData(this.oData.results.filter(item => oclas2.includes(item.Clas2)));
			// 	this.srvSearchTab.setModel(this.srvSearchModel);
			// }
			// this.srvSearchTab.bindAggregation("items", {
			// 	path: "/",
			// 	template: this.oTemplate
			// });
		},
		onSelect: function (oEvent) {
			debugger;
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

			// var selectedItems = oEvent.getParameter("selectedItems");
			// this.srvSearchModel = new sap.ui.model.json.JSONModel();
			// this.srvSearchTab = this.getView().byId("idSrcSearch");

			// this.listSrcSearch = this.getView().byId("idListSrcSearch");
			// if (this.listSrcSearch) {
			// 	this.oTemplate = this.listSrcSearch.clone();
			// }

			// var oclas2 = [];
			// for (var i = 0; i < selectedItems.length; i++) {
			// 	oclas2.push(selectedItems[i].getKey());
			// }

			// this.srvSearchModel.setData(this.oData.results.filter(item => oclas2.includes(item.Clas2)));
			// this.srvSearchTab.setModel(this.srvSearchModel);

			// this.srvSearchTab.bindAggregation("items", {
			// 	path: "/",
			// 	template: this.oTemplate
			// });

		},
		onSearch: function (oEvent) {
			debugger;
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
