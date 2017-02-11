/**
 * Created by I27160 on 2014/12/1.
 */

(function () {
  angular.module('bdgApp', ['icsc.common', 'ngCookies', 'ngAnimate', 'ngSanitize', 'mgcrea.ngStrap', 'ui.grid', 'ui.grid.selection', 'ui.grid.resizeColumns', 'ui.grid.edit', 'ui.grid.cellNav', 'ui.grid.autoResize', 'ui.grid.paging', 'kendo.directives'])
      .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/bdg-axes-a");
        $stateProvider.state('bdg-axes-a', {
          url: "/bdg-axes-a",
          templateUrl: "res/partials/dataSet.html"
        }).state('bdg-lc-a', {
          url: "/bdg-lc-a",
          templateUrl: "res/partials/limitCondition.html"
        });
      })
      .config(function ($alertProvider) {

        angular.extend($alertProvider.defaults, {
          container: 'body',
          keyboard: true,
          placement: 'bottom-right',
          type: 'success',
          duration: 3,
          animation: "am-fade-and-slide-bottom"
        });
      })
      .config(function ($selectProvider) {
        angular.extend($selectProvider.defaults, {
          sort: false
        });
      })
      .filter('mapIsUK', function () {
        var isUKHash = {
          1: '1-鍵值',
          2: '2-過濾',
          3: '3-顯示'
        };
        return function (input) {
          if (!input) {
            return '';
          } else {
            return isUKHash[input];
          }
        };
      })
      .filter('selectedAxis', function () {
        var isAxisHash = {
          0: '請選擇',
          1: 'X軸',
          2: 'Y軸(左側)',
          3: 'Y軸(右側)',
          4: '系列'

        };
        return function (input) {
          // debugger;
          if (!input) {
            return '請選擇';
          } else {
            return isAxisHash[input];
          }
        };
      })
      .filter('selectedFunc', function () {
        var isUKHash = {
          '': '請選擇',
          'SUM': 'SUM',
          'AVG': 'AVG',
          'MIN': 'MIN',
          'MAX': 'MAX'
        };
        return function (input) {
          if (!input) {
            return '請選擇';
          } else {
            return isUKHash[input];
          }
        }
      });
})();