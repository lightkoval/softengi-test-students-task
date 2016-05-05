/**
 * Created by s.kovalevskaya on 02.05.2016.
 */
"use strict";
var controllers = angular.module("tmsControllers", []);

controllers.controller("GetSettingsController", ["$scope", "$http", function ($scope, $http) {
    $scope.getSettings = function getSettings() {
        $http.get("/api/settings").then(function success(response) {
            $scope.settings = response.data;
        });
    };

    $scope.updateSettings = function updateSettings(settings) {
        $http.put("/api/settings", settings).then(function success(response) {

        });
    };

    $scope.getSettings();
}]);

controllers.controller("AuthorizeController", ["$scope", "$http", "$location", "$rootScope", function ($scope, $http, $location, $rootScope) {
    $scope.user = {};
    $scope.submit = function submit(user) {
        $http.post("/api/testing/authorize", user).then(function success(response) {
            $rootScope.currentUser = response.data;
            $rootScope.currentTest = null;
            $location.path("/testing/start_test");
        });
    };
}]);

controllers.controller("StartTestController", ["$scope", "$http", "$location", "$rootScope", function ($scope, $http, $location, $rootScope) {
    $scope.submit = function submit() {
        $http.post("/api/testing/start_test", $rootScope.currentUser).then(function success(response) {
            $rootScope.currentTest = response.data;
            $location.path("testing/task");
        });
    };
}]);

controllers.controller("TaskController", ["$scope", "$http", "$rootScope", "$location", function ($scope, $http, $rootScope, $location) {

    if (!$rootScope.currentTest) {
        $scope.incorrectAnswer = null;
        $scope.correctAnswer = null;
        $location.path("/");
        return;
    }

    $scope.getTask = function getTask() {
        $http.post("/api/testing/tasks/next", $rootScope.currentTest).then(function success(response) {
            $scope.currentTask = response.data;
        });
    };

    $scope.sendAnswer = function sendAnswer(answer, taskId) {
        $http.post("/api/testing/tasks/answer", {answer: answer, taskId: taskId}).then(function success(response) {
            refresh();
        });
    };

    $scope.getCorrectAnswerCount = function getCorrectAnswerCount() {
        $http.post("/api/testing/tasks/correct", $rootScope.currentTest).then(function success(response) {
            $scope.correctAnswer = response.data.count;
        });
    };

    $scope.getIncorrectAnswerCount = function getIncorrectAnswerCount() {
        $http.post("/api/testing/tasks/incorrect", $rootScope.currentTest).then(function success(response) {
            $scope.incorrectAnswer = response.data.count;
        });
    };

    $scope.finishTest = function finishTest() {
        $http.post("/api/testing/finish_test", {
            currentTest: $rootScope.currentTest,
            correctAnswer: $scope.correctAnswer,
            incorrectAnswer: $scope.incorrectAnswer
        }).then(function success() {
            $rootScope.currentTest = null;
            $location.path("/");
        });
    };

    function refresh() {
        if (+$scope.correctAnswer + +$scope.incorrectAnswer + 1 >= $rootScope.currentTest.numberOfQuestions) {
            $scope.finishTest();
        } else {
            $scope.getCorrectAnswerCount();
            $scope.getIncorrectAnswerCount();
            $scope.getTask();
        }
    }

    refresh();
}]);

controllers.controller("ReportsController", ["$scope", "$http", "$location", function ($scope, $http, $location) {

}]);

controllers.controller("TestedStudentsController", ["$scope", "$http", "$location", function ($scope, $http, $location) {
    $http.get("/api/reports/tested_students").then(function success(response) {
        $scope.tested_students = response.data.table;
    });
}]);

controllers.controller("NotTestedStudentsController", ["$scope", "$http", "$location", function ($scope, $http, $location) {
    $http.get("/api/reports/not_tested_students").then(function success(response) {
        $scope.tested_students = response.data.table;

    })
}]);

controllers.controller("PoorStudentsController", ["$scope", "$http", "$location", function ($scope, $http, $location) {
    $http.get("/api/reports/poor_students").then(function success(response) {
        $scope.tested_students = response.data.table;

    })
}]);