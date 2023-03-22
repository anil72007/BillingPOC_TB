sap.ui.define([

], function () {
    'use strict';
    return {
        getStatus: function (Type) {
            
            switch (Type) {
                case "S":
                    return "Success";
                    break;
                case "W":
                    return "Warning";
                    break;
                case "E":
                    return "Error";
                    break;
                default:
                    break;
            }
        }
    }
});