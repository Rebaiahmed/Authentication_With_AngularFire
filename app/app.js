'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute','firebase'

]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {

      $routeProvider
          .when('/home',{
            templateUrl :'partials/login.html',
            controller :'HomeCtrl',
            resolve :{
              auth : function($location,Auth){
                console.log('auth' + Auth + 'location' + $location)
                return Auth.$onAuth(function(authData){


                  if(authData){
                    $location.path('/Profile')
                  }


                })

              }
            }
          })

          .when('/Register',{
            templateUrl :'partials/Register.html',
            controller :'HomeCtrl',
            resolve :{
              auth : function($location,Auth){
                console.log('auth' + Auth + 'location' + $location)
                return Auth.$onAuth(function(authData){


                  if(authData){
                    $location.path('/Profile')
                  }
                })

              }
            }
          })

          .when('/Profile',{
            templateUrl :'partials/Profile.html',
            controller :'ProfileCtrl',
            resolve : {
                auth: function ($location, Auth) {

                    return Auth.$onAuth(function (authData) {


                        if (!authData) {
                          $location.path('/home')

                        }



                    })
                },
                profile: function (Auth, User) {
                    //load the currentUser
                    return Auth.$requireAuth().then(function (auth) {



                        return User.getProfile(auth.uid).$loaded().then(function(profile){
                            console.log('Proifle' + profile)
                            return profile
                        }, function(err){
                            console.log('err' +err);
                        })

                    }).catch(function (err) {
                        console.log('err' + err);
                        return err;
                    })

                }

            }
          })

      $routeProvider.otherwise({
        redirectTo: '/home'
      });

}])

    .constant('FireBaseUrl','https://authenticationtest94.firebaseio.com/')
    .run(function($rootScope,Auth,$location,User){
        Auth.$onAuth(function(authData){


            if(authData){
                $rootScope.isloggedIn = true;

            }else{
                $rootScope.isloggedIn = false;

            }
        })

        $rootScope.logout = function(){
            Auth.$unauth();
            $location.path('/home')
        }

        $rootScope.$on('$routeChangeSuccess', function() {

            var user =User.getloggedInUser();

            if(user){

                $rootScope.loggedUser= User.getloggedInUser();
            }

        })


    })


    .factory('Auth', function($firebaseAuth,FireBaseUrl){
      //initilize firebase
      var ref = new Firebase(FireBaseUrl);

      var Auth = $firebaseAuth(ref);

      return Auth;
    })

    .factory('User', function($firebaseArray,$firebaseObject,FireBaseUrl){
//decalring our ref
      var ref = new Firebase(FireBaseUrl+ 'users');

      //getProfile

      var getProfile = function(uid){
        //get The Profile with this uid
        return $firebaseObject(ref.child(uid));

          }

          var getloggedInUser = function(){
              //get the user in localStorage
              var user = localStorage.getItem('firebase:session::authenticationtest94')

              if(user){
                  return JSON.parse(user);
              }

        }
      return {
        getProfile:getProfile,
          getloggedInUser:getloggedInUser
      }


    })

.controller('HomeCtrl', function($scope,$location,Auth){





      //initilize the user
      $scope.user ={};

      $scope.newUser ={};





      //sign up method


      $scope.signup = function(){
        //create a New User

        Auth.$createUser({
          username :$scope.newUser.username,
          email :$scope.newUser.email,
          password :$scope.newUser.password
        })
            .then(function(userDate){
              //call the login method

              $scope.login($scope.newUser.email,$scope.newUser.password);

            }).catch(function(err){
              $scope.error =err;
            })

      }








      $scope.login = function(email,password){

        Auth.$authWithPassword({
          email : email,
          password : password
        }).then(function(auth){


          $location.path( "/Profile" );

        }).catch(function(err){
          $scope.error =err;
        })

      }

    })


.controller('ProfileCtrl', function($scope,User,Auth,$location,$rootScope){




        $scope.profile= $rootScope.loggedUser


      $scope.ModifyProfile = function(){
          //$save()

      }


        $scope.logout = function(){
            Auth.$unauth();
            $location.path('/home')
        }
    })
