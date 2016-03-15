angular.module('plunker', ['ezfb', 'ngRoute', 'hljs'])

    .constant(
        'SOCIAL_PLUGINS', [
            'like', 'share-button', 'send', 'post', 'video',
            'comments', 'page', 'follow'
        ]
    ).config(
        function (ezfbProvider, $routeProvider, SOCIAL_PLUGINS) {

            ezfbProvider.setInitParams({
                appId: '386469651480295',
                version: 'v2.4'
            });

            $routeProvider.otherwise({
                redirectTo: '/video'
            });

            angular.forEach(SOCIAL_PLUGINS, function (dirTag) {
                var routeName = dirTag;

                $routeProvider.when(
                    '/' + routeName,
                    { templateUrl: routeName + '.html' }
                );
            });
        }
    ).controller(
        'MainCtrl',
        function ($scope, $route, SOCIAL_PLUGINS, $location) {

            $scope.SOCIAL_PLUGINS = SOCIAL_PLUGINS;
    
            $scope.pluginOn = true;
            $scope.rendering = false;
    
            $scope.goto = function (dirTag) {
                $location.path('/' + dirTag);
            };
    
            $scope.isActive = function (dirTag) {
                return ($location.path() === '/' + dirTag);
            };
    
            $scope.rendered = function () {
                $scope.rendering = false;
            };
    
            $scope.$watch(
                'pluginOn',
                function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        $scope.rendering = true;
                    }
                }
            );
    
            $scope.$on(
                '$routeChangeSuccess',
                function () {
                    $scope.rendering = true;
                }
            );
        }
    ).controller(
        'LoginCtrl',
        function ($scope, ezfb, $window, $location, $q) {

            function updateMe() {
                ezfb.getLoginStatus()
                    .then(function (res) {
                        // res: FB.getLoginStatus response
                        return ezfb.api('/me');
                    })
                    .then(function (me) {
                        // me: FB.api('/me') response
                        $scope.me = me;
                    });
            }

            function updateLoginStatus() {
                return ezfb.getLoginStatus()
                    .then(function (res) {
                        // res: FB.getLoginStatus response
                        $scope.loginStatus = res;
                    });
            }

            function updateApiCall() {
                return $q.all($q.defer('app_easyfb_all_updateApiCall'),
                        [ezfb.api('/me'), ezfb.api('/me/likes')]
                    ).then(function (resList) {
                        // Runs after both api calls are done
                        // resList[0]: FB.api('/me') response
                        // resList[1]: FB.api('/me/likes') response
                        $scope.apiRes = resList;
                    });
            }

            updateMe();

            updateLoginStatus().then(updateApiCall);

            ezfb.Event.subscribe(
                'auth.statusChange',
                function (statusRes) {
                    $scope.loginStatus = statusRes;

                    updateMe();
                    updateApiCall();
                }
            );

            $scope.login = function () {
                // Calling FB.login with required permissions specified
                ezfb.login(
                    function (res) {
                        msos.console.debug('app - ezfb - LoginCtrl - login -> called, cb: 1.');
                    },
                    { scope: 'email,user_likes' }
                ).then(
                    function (res) {
                        msos.console.debug('app - ezfb - LoginCtrl - login -> called, cb: 2.');
                    }
                );
                /*
                 * Note that the `res` result is shared.
                 * Changing the `res` in 1 will also change the one in 2
                 */
            };

            $scope.logout = function () {
                // Calling FB.logout
                ezfb.logout(
                    function (res) {
                        msos.console.debug('app - ezfb - LoginCtrl - logout -> called, cb: 1.');
                    }
                ).then(
                    function (res) {
                        msos.console.debug('app - ezfb - LoginCtrl - logout -> called, cb: 2.');
                    }
                );
            };

            $scope.share = function () {
                var no = 0,
                    callback = function (res) {
                        no += 1
                        msos.console.debug('app - ezfb - LoginCtrl - share - callback -> called: ' + no + ', response:', res);
                    };

                ezfb.ui(
                    {
                        method: 'feed',
                        name: 'angular-easyfb API demo',
                        picture: 'http://plnkr.co/img/plunker.png',
                        link: 'http://plnkr.co/edit/qclqht?p=preview',
                        description:
                            'angular-easyfb is an AngularJS module wrapping Facebook SDK.' +
                            ' Facebook integration in AngularJS made easy!' +
                            ' Please try it and feel free to give feedbacks.'
                    },
                    callback
                ).then(callback);
            };

            var autoToJSON = ['loginStatus', 'apiRes'];

            angular.forEach(
                autoToJSON,
                function (varName) {
                    $scope.$watch(
                        varName,
                        function (val) {
                            $scope[varName + 'JSON'] = JSON.stringify(val, null, 2);
                        },
                        true
                    );
                }
            );
        }
    );