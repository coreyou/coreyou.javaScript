(function () {
  var dmaApp = angular.module('dmaApp', ['icsc.common', 'ui.grid.selection', 'ui.grid.resizeColumns', 'ui.grid.edit',
    'ui.grid.rowEdit', 'ui.grid.cellNav', 'ui.grid.autoResize', 'ui.grid.expandable', 'ui.bootstrap.tpls', 'ui.bootstrap.tabs']);

  dmaApp.config(function ($stateProvider, $urlRouterProvider, $modalProvider) {
    $urlRouterProvider.otherwise("/tableRelationMgr");
    $stateProvider.state('tableRelationMgr', {
      url: "/tableRelationMgr",
      templateUrl: "res/partials/tableRelationMgr.html"
    }).state('dataDefinition.datasourceMgr', {
      url: "/datasourceMgr",
      templateUrl: "res/partials/datasourceMgr.html"
    }).state('dataDefinition.tableMgr', {
      url: "/tableMgr",
      templateUrl: "res/partials/tableMgr.html"
    }).state('dataDefinition.columnMgr', {
      url: "/columnMgr",
      templateUrl: "res/partials/columnMgr.html"
    }).state('assistQueryMgr', {
      url: "/assistQueryMgr",
      templateUrl: "res/partials/assistQueryMgr.html"
    }).state('basicDataMgr', {
      url: "/basicDataMgr",
      templateUrl: "res/partials/basicDataMgr.html"
    }).state('dataDefinition', {
      abstract: true,
      template: '<ui-view/>'
    });

    angular.extend($modalProvider.defaults, {
      show: false,
      animation: 'am-fade-and-slide-top',
      placement: 'top'
    });
  });

  dmaApp.filter('columnDataTypeFilter', function () {
    var map = {
      'TEXT': '文字',
      'NUMBER': '數字',
      'DATE': '日期',
      'TIME': '時間',
      'CURRENCY': '貨幣'
    };

    return function (input) {
      if (!input) {
        return '';
      } else {
        return map[input];
      }
    };
  }).filter('sourceTypeFilter', function () {
    var map = {
      'TABLE': '資料表',
      'PUBLIC_TABLE': '共用表格',
      'SQL': 'SQL 查詢句'
    };
    return function (input) {
      if (!input) {
        return '';
      } else {
        return map[input];
      }
    };
  });

//  dmaApp.config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
//    cfpLoadingBarProvider.includeSpinner = false;
//  }])
}());
