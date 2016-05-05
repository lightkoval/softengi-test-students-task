/**
 * Created by s.kovalevskaya on 04.05.2016.
 */
"use strict";
var app = angular.module("validator", []);

app.directive("naturalNumber", function () {
    function isValid(s) {
        return (s < 0) ? false : (+s ^ 0) === +s;
    }

    return {
        require: "ngModel",
        link: function (scope, element, attr, mCtrl) {
            function myValidation(value) {
                if (isValid(value)) {
                    mCtrl.$setValidity("naturalNumber", true);
                } else {
                    mCtrl.$setValidity("naturalNumber", false);
                }
                return value;
            }

            mCtrl.$parsers.push(myValidation);
        }
    };
});

