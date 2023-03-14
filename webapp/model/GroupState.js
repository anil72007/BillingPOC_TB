sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/Sorter",
    "sap/ui/core/format/DateFormat"
], function (BaseObject, Sorter, DateFormat) {
"use strict";

return BaseObject.extend("com.sap.build.standard.pocPatientServiceAndInvoice.model.GroupState", {

    _KEY_NO_GROUPING: "NO_GROUPING",

    /**
     * Creates sorters to group the master list.
     * If a user groups by a field, and there is a corresponding sort option, the option will be chosen.
     * If a user ungroups, the sorting will be reset to the default sorting.
     * @class
     * @public
     * @param {sap.ui.model.Sorter} oInitialSorter the initial sorter as defined in the XML view
     * @param {jQuery.sap.util.ResourceBundle} oResourceBundle resource bundle providing required UI texts
     * @alias sap.ui.demo.orderbrowser.model.GroupState
     */
    constructor: function (oInitialSorter, oResourceBundle) {

        this._oSorters = {};
        this._oSorters[this._KEY_NO_GROUPING] = [ oInitialSorter ];
        this._oResourceBundle = oResourceBundle;
        this._oMonthNameFormat = DateFormat.getInstance({ pattern: "MMMM"});
    },

    /**
     * Groups by certain fields of the order, or resets the grouping.
     *
     * @param {string} sKey a key representing the desired grouping. Allowed values: CompanyName,
     * 					OrderPeriod, ShippedPeriod, NO_GROUPING
     * @returns {sap.ui.model.Sorter|sap.ui.model.Sorter[]} single sorter or array of sorters
     */
    groupBy: function (sKey) {
        if (this._oSorters && this._oSorters[sKey]) {
            return this._oSorters[sKey];
        }

        var aSorters = null;
        switch (sKey) {
            // Customer: Every customer gets their own group, with the group name being the customer name.
            case "Kunrg":
                aSorters = [
                    new Sorter("Kunrg", false, this._groupByKunrg.bind(this))
                    ];
                break;
            default:
                // Revert to original sorter as defined in view XML.
                aSorters = this._oSorters[this._KEY_NO_GROUPING];
                break;
            }

        // Remember new Sorter instance for later reuse.
        this._oSorters[sKey] = aSorters;

        return aSorters;
    },
    _groupByKunrg: function (oContext) {
        var sKunrg = oContext.getProperty("Kunrg");
        var sText = '';
        if( sKunrg === '1000000001'){
            sText = sKunrg + '- BK C / Singapore 123456';
        }else if( sKunrg === '10000000'){
            sText = sKunrg + '- BPJS / Singapore 123456';
        }else {
            sText = sKunrg;
        }
        return {
            key: sKunrg,
            text: sText
        };
    },
     /**
     * Groups the orders by month (+ year) when it was created.
     * @param {Object} oContext The binding context of the current object
     * @returns {Object} the properties needed to display the group for the passed order,
     * 			see also {@link sap.ui.demo.orderbrowser.controller.Master#createGroupHeader()}
     */
    _groupByOrderPeriod: function (oContext) {
        var oDate = oContext.getProperty("OrderDate"),
            iYear = oDate.getFullYear(),
            iMonth = oDate.getMonth() + 1,
            sMonthName = this._oMonthNameFormat.format(oDate);

        return {
            key: iYear + "-" + iMonth,
            text: this._oResourceBundle.getText("masterGroupTitleOrderedInPeriod", [ sMonthName, iYear ])
        };
    },

    /**
     * Groups the orders by month (+ year) when the ordered products have been shipped.
     * There will be one group covering all orders which still need to be shipped.
     * @param {Object} oContext The binding context of the current object
     * @returns {Object} the properties needed to display the group for the passed order,
     * 			see also {@link sap.ui.demo.orderbrowser.controller.Master#createGroupHeader()}
     */
    _groupByShippedPeriod: function (oContext) {
        var oDate = oContext.getProperty("ShippedDate");
        // Special handling needed because shipping date may be empty (=> not yet shipped).
        if (oDate != null) {
            var iYear = oDate.getFullYear(),
                iMonth = oDate.getMonth() + 1,
                sMonthName = this._oMonthNameFormat.format(oDate);

            return {
                key: iYear + "-" + iMonth,
                text: this._oResourceBundle.getText("masterGroupTitleShippedInPeriod", [ sMonthName, iYear ])
            };
        } else {
            return {
                key: 0,
                text: this._oResourceBundle.getText("masterGroupTitleNotShippedYet")
            };
        }
    }

});
});