/**
 * Created by coreyou on 2015/1/27.
 */
(function() {
    var app_scope = angular.module('appName_scope', ['ngRoute'], function($routeProvider) {  // config function
        // when(path, route)
        $routeProvider.when('/simpleView', {
            // 測試url: http://localhost:63342/workspace/coreyou.javaScript/angular/ngRouteView.html#/simpleView
            templateUrl: 'view_1.html'  // 在ng-view的地方引入view_1.html
        }).when('/edit', {
            // 測試url: http://localhost:63342/workspace/coreyou.javaScript/angular/ngRouteView.html#/edit
            templateUrl: 'view_2.html'
        }).when('/hello/:message/:friendIndex', {    // 網址內含變數
            // url: http://localhost:63342/workspace/coreyou.javaScript/angular/ngRouteView.html#/hello/message變數值/friendIndex變數值
            // 可以輸入 http://localhost:63342/workspace/coreyou.javaScript/angular/ngRouteView.html#/hello/hi~/0 來測試
            templateUrl: 'view_3.html',
            controller: 'GreetingCtrl'
        }).when('/', {
            templateUrl: 'view_4.html'
        }).when('/edit/:friendIndex', {
            templateUrl: 'view_5.html',
            controller: 'EditCtrl'
        }).otherwise({
            // 沒有符合的url的時候
            redirectTo: '/'
        });
    });

    app_scope.controller('OnePieceCtrl', function($scope) { // used in ngRouteView.html
        $scope.friends = [
            {
                name: '蒙奇·D·魯夫',
                reward: 400000000
            },
            {
                name: '布魯克',
                reward: 33000000
            },
            {
                name: '羅羅亞·索隆',
                reward: 55000000
            },
            {
                name: '香吉士',
                reward: 77000000
            }
        ];

        // 按下Add按鈕
        $scope.add = function(){
            $scope.friends.push({
                name: $scope.pName,
                reward: $scope.pReward
            });
        };

        // 按下叉叉按鈕
        $scope.remove = function(index){
            $scope.friends.splice(index, 1);
        };
    });

    app_scope.controller('GreetingCtrl', function($scope, $routeParams) {
        $scope.greeting = $routeParams.message; // $routeParams接受由網址傳入的參數，會被拿來印在view_3.html上面
        $scope.friendIndex = $routeParams.friendIndex;
    });

    app_scope.controller('EditCtrl', function($scope, $routeParams) {
        $scope.friendIndex = $routeParams.friendIndex;
    });

    app_scope.controller('HttpCtrl', function($scope, $http) { // used in httpRequest.html
        $http.get('staticJSON.json').success(function(data) {
            $scope.userData = data;
        });

        $scope.$watch('userData', function () { // 可以利用 $scope 的 $watch 來監聽指定的 model
            if ($scope.userData.length > 0) {
                alert('userData 有資料');
            } else {
                alert('userData 無資料');
            }
        });
    });
})();
