/**
 * Created by s.kovalevskaya on 02.05.2016.
 */
"use strict";
var router = angular.module("tmsRouter", ["ngRoute"]);

router.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
        .when("/settings", {
            templateUrl: "partials/settings/settings.html",
            controller: "GetSettingsController"
        })
        .when("/testing/authorize", {
            templateUrl: "partials/testing/authorize.html",
            controller: "AuthorizeController"
        })
        .when("/testing/start_test", {
            templateUrl: "partials/testing/start_test.html",
            controller: "StartTestController"
        })
        .when("/testing/task", {
            templateUrl: "partials/testing/task.html",
            controller: "TaskController"
        })
        .when("/reports/", {
            templateUrl: "partials/reports/reports.html",
            controller: "ReportsController"
        })
        .when("/reports/tested_students", {
            templateUrl: "partials/reports/tested_students.html",
            controller: "TestedStudentsController"
        })
        .when("/reports/not_tested_students", {
            templateUrl: "partials/reports/not_tested_students.html",
            controller: "NotTestedStudentsController"
        })
        .when("/reports/poor_students", {
            templateUrl: "partials/reports/poor_students.html",
            controller: "PoorStudentsController"
        })
    ;
}]);
