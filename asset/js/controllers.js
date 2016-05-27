/**
 * Created by Cyrielo on 5/24/2016.
 */
'use strict';
var RegistroAppControllers = angular.module('RegistroApp.controllers', [])
    .controller('headerCtrl', function( $scope, $window, Storage ){
        $scope.full_name = Storage.get('full_name');
    })
    .controller('homeCtrl', function($scope, $window, Auth,  Dashboard){
        if( !Auth.isLoggedIn() )
            $window.location.href = '#/login'; //user is not logged in
        $scope.Dashboard = Dashboard;
        $scope.events = [];
        var applied = false;
        Dashboard.listEvents(function(events){
            $scope.events = events;
            if(!applied)
                $scope.$apply();
            applied = true;
        });
    })
    .controller('LoginCtrl', function ( $scope, $window, Auth) {
        if( Auth.isLoggedIn() )
            $window.location.href = '#/home';
        $scope.Auth = Auth;
    })
    .controller('LogoutCtrl', function($scope, $window, Auth){
        Auth.logout();
        $window.location.href = '#/login';
    })
    .controller('RegisterCtrl', function($scope, $window, Auth){
        if( Auth.isLoggedIn() )
            $window.location.href = '#/home'; //user is logged in
        $scope.Auth = Auth;
    })
    .controller('CreateEventCtrl', function( $scope, $window, Dashboard ){
        $scope.Dashboard = Dashboard;
    })
    .controller('eventDetailsCtrl', function($scope, $window, $stateParams,
    Dashboard, Auth, Storage, DateHelper){
        if( !Auth.isLoggedIn() )
            $window.location.href = '#/login'; //user is not logged in

        $scope.Dashboard = Dashboard;
        $scope.DateHelper = DateHelper;
        $scope.event_id = $stateParams.eventId;
        $scope.user_key = Storage.get('user_key');

        $scope.openAttendanceLogs = function(){
            Dashboard.getAttendanceArchive($stateParams.eventId, function(attendanceArchive){
                //console.log(attendanceArchive);
                $('#modal1').openModal();
                var attendance_profiles = [];
                Dashboard.getUsers(function(users){
                    for( var i in attendanceArchive ){
                        var attendance_user_id = attendanceArchive[i].user_id,
                            attendance_check_in_time = attendanceArchive[i].check_in_time,
                            attendance_check_out_time = attendanceArchive[i].check_out_time;
                        for( var j in users ){
                            console.log(attendance_user_id == users[j].user_key );
                            if( attendance_user_id == users[j].user_key ){
                                users[j].check_in_time = attendance_check_in_time;
                                users[j].check_out_time = attendance_check_out_time;
                                attendance_profiles.push( users[j] );
                                break;
                            }
                        }
                    }
                    $scope.$apply(function(){
                        $scope.attendance_archive_list = attendance_profiles;
                        $('#checkoutWaiter').css('display', 'none');
                        $('#checkoutData').css('display', 'block');
                    });
                });
            });
        };

        Dashboard.getEventInfo( $stateParams.eventId, function(event_info){
           console.log(event_info);
            $scope.event_details = event_info;
        });

        Dashboard.getAttendanceList( $scope.event_id, function(attendance){
            var attendance_profiles = [];
            Dashboard.getUsers(function(users){
               for( var i in attendance ){
                   var attendance_user_id = attendance[i].user_id,
                       attendance_check_in_time = attendance[i].check_in_time;
                   for( var j in users ){
                       console.log(attendance_user_id == users[j].user_key );
                       if( attendance_user_id == users[j].user_key ){
                           users[j].check_in_time = attendance_check_in_time;
                           attendance_profiles.push( users[j] );
                           break;
                       }
                   }
               }
                $scope.$apply(function(){
                    $scope.attendance_list = attendance_profiles;
                });
            });
        });


    });