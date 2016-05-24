'use strict';
var RegistroApp = angular.module('RegistroApp',[
    'RegistroApp.services', 'RegistroApp.controllers', 'ui.router',
    'ngCookies']);

RegistroApp.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('/home');
    $stateProvider.state('login', {
        url : '/login',
            views : {
                loginView : {
                    templateUrl : 'partials/templates/login.html',
                    controller : 'LoginCtrl'
                }
            }
        })
        .state('register', {
            url : '/register',
            views : {
                loginView : {
                    templateUrl : 'partials/templates/register.html',
                    controller : 'RegisterCtrl'
                }
            }
        })
    
});