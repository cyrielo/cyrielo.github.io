'use strict';
/*Create the app module and it's dependency modules*/
var firebaseDatabase = firebase.database();
var RegistroApp = angular.module('RegistroApp',['RegistroApp.controllers',
    'RegistroApp.services', 'ui.router', 'ngCookies']);
/*Configuring the states and url router*/
RegistroApp.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('/home');
    $stateProvider
        .state('home', {
            url : '/home',
            views : {
                headerView : {
                    templateUrl : 'partials/template/header.html',
                    controller : 'headerCtrl'
                },
                mainView : {
                    templateUrl : 'partials/event-dashboard.html',
                    controller : 'homeCtrl'
                }
            }
        })
        .state('login', {
            url : '/login',
            views : {
                mainView : {
                    templateUrl : 'partials/login.html',
                    controller : 'LoginCtrl'
                }
            }
        })
        .state('logout', {
            url : '/logout',
            views : {
                mainView : {
                    templateUrl : 'partials/login.html',
                    controller : 'LogoutCtrl'
                }
            }
        })
        .state('register', {
            url : '/register',
            views : {
                mainView : {
                    templateUrl : 'partials/register.html',
                    controller : 'RegisterCtrl'
                }
            }
        })
        .state('create_event', {
            url : '/create_event',
            views : {
                headerView : {
                    templateUrl : 'partials/template/header.html',
                    controller : 'headerCtrl'
                },
                mainView : {
                    templateUrl : 'partials/create_event.html',
                    controller : 'CreateEventCtrl'
                }
            }
        })
        .state('event-details', {
            url : '/event-details/:eventId',
            views : {
                headerView : {
                    templateUrl : 'partials/template/header.html',
                    controller : 'headerCtrl'
                },
                mainView : {
                    templateUrl : 'partials/event-details.html',
                    controller : 'eventDetailsCtrl'
                }
            }
        })
});