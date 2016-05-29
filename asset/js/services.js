/**
 * Created by Cyrielo on 5/24/2016.
 */
'use strict';
var RegistroAppServices = angular.module('RegistroApp.services', [])
    .service('Auth', function(Storage, $window){
      var auth =  {
          usersTable : 'users',
          login : function(username, password){
              var errors = [];
              if(typeof username == 'undefined')
                errors.push('Username is required ');
              else if( username.trim().length < 1 )
                errors.push('Username is empty');
              if( typeof password == 'undefined')
                errors.push('Password is required ');
              else if( password.trim().length < 1 )
                errors.push('Password is empty');
              if( errors.length < 1 ){
                  this.accountExists(username, password, function( is_authenticated, user_key, user_data ){
                      if( is_authenticated ){

                          Storage.put('username', username);
                          Storage.put('full_name', user_data.full_name);
                          Storage.put('user_key', user_key);
                          $window.location.href = '#/home';
                      }else{
                          sweetAlert({
                              title : '',
                              text : 'Invalid username and password combination',
                              type : 'error'
                          });
                      }
                  });
              }else{
                 sweetAlert('',  errors.toString(), 'error' );
              }
          },
          register : function(full_name, username, password, password_again){
              var errors = [];

              if(typeof full_name == 'undefined')
                  errors.push('Full name is required');
              else if( full_name.trim().length < 2 )
                  errors.push('Full name is too short');

              if(typeof username == 'undefined')
                  errors.push('Username is required');
              else if( username.trim().length < 2 || username.split(' ').length > 1 )
                  errors.push('Username must not contain spaces');

              if( typeof password == 'undefined')
                  errors.push('Password is required');
              else if( password.trim().length < 6 )
                  errors.push('Password is too short');

              if( typeof password_again == 'undefined')
                  errors.push('Password again is required');
              else if( password_again !=  password )
                  errors.push('Passwords do not match');

              if( errors.length < 1 ){
                  var md5_password = md5( password );
                  var newUserKey = firebaseDatabase.ref('users').push().key;
                  firebaseDatabase.ref( this.usersTable + '/' + newUserKey).set({
                      full_name: full_name,
                      username : username,
                      password : md5_password,
                      user_key : newUserKey
                  }).then(function(){
                      sweetAlert({
                          title : '',
                          text : 'Your account has been created',
                          type : 'success'
                      }, function(){
                          auth.login(username, password);
                      });
                  });
              }else{
                  sweetAlert('',  errors[0], 'error' );
                  console.log( errors );
                  return errors;
              }
          },
          logout : function () {
              Storage.clear();
          },
          accountExists : function (username, password, callback) {
              firebaseDatabase.ref( this.usersTable ).once('value', function(all_users){
                  var user_values = all_users.val();
                  for(var i in user_values) {
                      if( user_values[i].username == username && user_values[i].password == md5(password) ){
                          callback(true, i, user_values[i] );
                          return;
                      }
                  }
                  callback(false);
              });
          },

          isLoggedIn : function(){
            var username = window.localStorage.getItem('username');
            return ( username != undefined );
          }
      };
        return auth;
    })
    .service('Dashboard', function(Storage, $window){
        var dashBoard =  {

            eventTable : 'events',
            attendanceTable : 'attendance',
            attendanceArchive : 'attendanceArchive',

            createEvent : function(event_name, event_description,
              event_capacity, event_start_date, event_end_date, event_venue ){
                console.log( arguments );
              var errors = [];

              if( typeof event_name == 'undefined' )
                errors.push('Please enter an event name');
              else if( event_name.trim().length < 1 )
                errors.push('Event name is empty');

              if( typeof event_description == 'undefined' )
                errors.push('Event description is required');
              else if ( event_description.trim().length < 1 )
                errors.push('Event description is empty');

              if( typeof event_capacity == 'undefined' )
                errors.push('Event capacity is required');
              else if( typeof parseInt( event_capacity ) != 'number' )
                errors.push('Event capacity must be a number');


              // event_start_date, event_end_date, event_venue
              var today =  Date.parse( new Date().toString() );

              console.log(event_start_date);
              if( typeof event_start_date == 'undefined' )
                errors.push('Please enter a start date for your event');
              else if ( today > Date.parse(new Date(event_start_date).toString()) )
                errors.push('Event start date can\'t be in the past');

              if( typeof event_end_date == 'undefined' )
                errors.push('Please enter an end date for your event');
              else if ( today > Date.parse(new Date(event_end_date).toString()) )
                errors.push('Event end date can\'t be in the past');

              if( typeof event_venue == 'undefined' )
                errors.push('Event venue is required');
              else if( event_venue.trim().length < 1 )
                errors.push('Event venue is empty');

              if( errors.length < 1 ){
                  var newEventKey = firebaseDatabase.ref( this.eventTable).push().key;
                  firebaseDatabase.ref( this.eventTable + '/' + newEventKey).set({
                      event_name : event_name,
                      event_description : event_description,
                      event_capacity : event_capacity,
                      event_owner : Storage.get('username'),
                      attendants : 0,
                      event_id : newEventKey,
                      event_start_date :  Date.parse(new Date(event_start_date).toString()),
                      event_end_date :  Date.parse(new Date(event_end_date).toString()),
                      event_venue :  event_venue
                  }).then(function(){
                      sweetAlert({
                          title : 'Done!',
                          text : 'Event created successfully',
                          type : 'success'
                      }, function(){
                          $window.location.href = '#/home';
                      });
                  });
              }else{
                sweetAlert({
                  title : 'Oops...',
                  text : errors[0],
                  type : 'error'
                });
              }
            },
            listEvents : function(callback){
                firebaseDatabase.ref( this.eventTable).on('value', function(events_objects){
                    var events_objects_values = events_objects.val(),
                        events_array = [];
                    for( var i in events_objects_values )
                        events_array.push( events_objects_values[i] );
                    callback( events_array );
                });
            },
            deleteEvent : function ( event_id ) {
                firebaseDatabase.ref( this.eventTable + '/' + event_id ).once('value', function(event_obj){
                    event_obj = event_obj.val();
                    if( event_obj.event_owner == Storage.get('username') ){
                        sweetAlert({
                            title : 'Are you sure',
                            text  : 'Do you really want to delete this event?',
                            type : 'warning',
                            showCancelButton: true,
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Yes, destroy it!"
                        }, function(){
                            firebaseDatabase.ref( dashBoard.eventTable + '/' + event_id).remove();
                            firebaseDatabase.ref( dashBoard.attendanceTable + '/' + event_id).remove();
                            firebaseDatabase.ref( dashBoard.attendanceArchive + '/' + event_id).remove();
                            $window.location.href = '#/home';
                        });
                    }else{
                        sweetAlert('Oops...', 'You don\'t have permission to delete other people\'s event', 'error');
                    }
                });
            },
            checkIn : function( event_id, user_id ){
                var attendance_path = this.attendanceTable + '/' + event_id + '/' + user_id;
                this.canCheckIn( event_id, function( canCheckIn, current_attendance ){
                    if(canCheckIn){
                        firebaseDatabase.ref( attendance_path ).once('value',function(data){
                            if( data.val() == null ){
                                firebaseDatabase.ref( dashBoard.eventTable + '/' + event_id).update({
                                    attendants : current_attendance + 1
                                }).then(function(){
                                    firebaseDatabase.ref( attendance_path ).set({
                                        check_in_time : ( Date.parse( new Date().toString() ) ),
                                        user_id : user_id
                                    }).then(function(){
                                        sweetAlert('Welcome on board!', 'Check in successful :)', 'success');
                                    });
                                });
                            }else{
                                sweetAlert('Oops...', 'You have already checked-in for this event', 'error');
                            }
                        });
                    }else {
                        sweetAlert('Oops...', 'Sorry this event is passed or filled up, check back next time', 'error');
                    }
                })
            },
            checkOut : function( event_id, user_id ){
                this.isCheckedIn( event_id, user_id, function(isCheckedIn){
                    console.log(isCheckedIn);
                    if(isCheckedIn){
                        dashBoard.getTotalAttendance(event_id, function(total_attendance){
                            firebaseDatabase.ref( dashBoard.eventTable + '/' + event_id).update({
                                attendants : total_attendance - 1
                            }).then(function(){
                                var attendance_path = dashBoard.attendanceTable + '/' + event_id + '/' + user_id;
                                firebaseDatabase.ref( attendance_path).once('value', function (user_attendance_info) {
                                    user_attendance_info = user_attendance_info.val();
                                    var attendance_archive_path = dashBoard.attendanceArchive + '/' + event_id + '/' + user_id;
                                    firebaseDatabase.ref(attendance_archive_path).set({
                                        user_id : user_id,
                                        check_in_time : user_attendance_info.check_in_time,
                                        check_out_time : ( Date.parse( new Date().toString() ) )
                                    }).then(function(){
                                        //We delete the user info from active attendance list
                                        firebaseDatabase.ref(attendance_path).remove();
                                        sweetAlert('Goodbye!', 'You\'ve successfully checked out from this event', 'success');
                                    });
                                });
                            });
                        });

                    }else{
                        sweetAlert('Oops...', 'You\'re not currently checked-in for this event', 'error');
                    }
                })
            },
            canCheckIn : function( event_id, callback ){
                firebaseDatabase.ref( this.eventTable + '/' + event_id).once('value', function (event_obj) {
                    event_obj = event_obj.val();
                    ( event_obj.event_capacity > event_obj.attendants && event_obj.event_end_date > Date.parse( new Date().toString() ) ) ? callback(true, event_obj.attendants) : callback(false);
                })
            },
            isCheckedIn : function(event_id, user_id, callback){
                var attendance_path = dashBoard.attendanceTable + '/' + event_id + '/' + user_id;
                firebaseDatabase.ref( attendance_path).once('value', function(user_attendance_info){
                    (user_attendance_info.val() == null) ? callback(false) : callback(true);
                });
            },
            getTotalAttendance : function(event_id, callback){
                firebaseDatabase.ref( this.eventTable + '/' + event_id).once('value', function(event_obj){
                    callback( event_obj.val().attendants );
                });
            },
            getAttendanceList : function(event_id, callback){
                var attendance_path = dashBoard.attendanceTable + '/' + event_id ;
                firebaseDatabase.ref( attendance_path).on('value', function( attendance ){
                    var attendance_list = attendance.val();
                    var attendance_array = [];
                    for(var i in attendance_list){
                        attendance_array.push( attendance_list[i] );
                    }
                    callback(attendance_array);
                })
            },
            getAttendanceArchive : function(event_id, callback){
                var attendance_archive_path = dashBoard.attendanceArchive + '/' + event_id ;
                firebaseDatabase.ref( attendance_archive_path).on('value', function( attendance ){
                    var attendance_list = attendance.val();
                    var attendance_array = [];
                    for(var i in attendance_list){
                        attendance_array.push( attendance_list[i] );
                    }
                    callback(attendance_array);
                })
            },
            updateEvent : function( event_id, event_name, event_description, event_capacity ){
                firebaseDatabase.ref( this.eventTable + '/' + event_id).update({
                    event_name : event_name,
                    event_description : event_description,
                    event_capacity : event_capacity
                }).then(function(){
                   sweetAlert('Done!', 'Event details updated', 'success');
                });
            },
            getUsers : function(callback){
                firebaseDatabase.ref('users').once('value',function(users){
                   var users_array  = [];
                    for(var i in users.val()){
                        users_array.push(users.val()[i]);
                    }
                    callback(users_array);
                });
            },
            getEventInfo : function (event_id, callback) {
                firebaseDatabase.ref( this.eventTable + '/' + event_id).on('value', function(event_info){
                    var event_values = event_info.val();
                    callback(event_values);
                });
            }
        };
        return dashBoard;
    })
    .service('Storage', function(){
       return {
           put : function(key, value){
               window.localStorage.setItem(key, value);
           },
           get : function( key ){
               return window.localStorage.getItem(key);
           },
           remove : function (key) {
               window.localStorage.removeItem(key);
           },
           clear : function () {
               window.localStorage.clear();
           }
       }
    }).service('DateHelper', function(){
        return {
            parseTimeInt : function(time_int){
              if (typeof time_int == 'undefined')
                return '';
                var
                    date_string = '',
                    date = new Date( time_int ),
                    today = new Date(),
                    hrs_24 =  date.getUTCHours() + 1,
                    hours = ( hrs_24 > 12 ) ? ( hrs_24 - 12 )  : hrs_24,
                    min = date.getUTCMinutes(),
                    d = date.toDateString(),
                    am_pm = ( (date.getUTCHours() + 1) < 12 ) ? 'AM' : 'PM' ;
                if( today.getDate() == date.getDate() )
                    date_string+='Today @ ';
                else if( ( today.getDate() - 1 ) == date.getDate() )
                    date_string+='Yesterday @ ';
                else
                    date_string+= d + ' ';
                date_string+= hours + ':' + min + ' '+ am_pm;
                return date_string;
            }
        }
    });
