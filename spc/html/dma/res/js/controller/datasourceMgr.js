angular.module('dmaApp').controller('datasourceMgrCtrl', function ($scope, $http, $modal, $icscAlert, $dmaService, uiGridConstants) {
  'use strict';

  var gridOpeator =
          '<div class="ui-grid-cell-contents btn-group"><button type="button" class="btn btn-success btn-xs" bs-tooltip="tooltip" data-title="修改" ng-click="getExternalScopes().showModify(row)">' +
          '<span class="glyphicon glyphicon-edit"></span></button>' +
          '<button type="button" class="btn btn-danger btn-xs" bs-tooltip="tooltip" data-title="刪除" ng-click="getExternalScopes().del(row)">' +
          '<span class="glyphicon glyphicon-remove"></span></button></div>',
      modalCfg = {
        template: 'dataSourceModal',
        scope: $scope
      },
      modal;

//  $scope.readableUserList = [];
//  $scope.readableUserGroup = function (item) {
//    if (item.type === 'domain')
//      return 'Domain';
//    if (item.type === 'system')
//      return 'System';
//    if (item.type === 'group')
//      return 'Authority Group';
//  };

  $scope.datasource = {};
  $scope.isAdd = true;
  $scope.dsGrid = {
    list: [],
    gridOptions: {
      multiSelect: false,
      enableColumnMenus: false,
      enableFiltering: true,
      enableRowHeaderSelection: false,
      enableSorting: false,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      data: 'dsGrid.list',
      columnDefs: [
        {name: 'datasourceId', displayName: 'Datasource', filter: {
          condition: uiGridConstants.filter.CONTAINS
        }},
        {name: 'driver', displayName: 'Driver', filter: {
          condition: uiGridConstants.filter.CONTAINS
        }},
        {name: 'url', displayName: 'URL', filter: {
          condition: uiGridConstants.filter.CONTAINS
        }},
        {name: 'userId', displayName: 'User', filter: {
          condition: uiGridConstants.filter.CONTAINS
        }},
//        {name: 'readableUser', displayName: 'Readable User'},
        {name: 'owner', displayName: 'Owner'},
        {name: 'action', displayName: '操作', width: '80', enableFiltering: false, cellTemplate: gridOpeator}
      ]
    }
  };

  $scope.checkDSName = function (value) {
    if (!$scope.isAdd) {
      return true;
    }

    var result = true;
    angular.forEach($scope.dsGrid.list, function (ds, key) {
      if (ds.datasourceId === value) {
        result = false;
        return result;
      }
    });

    return result;
  };

  $scope.showModify = function (row) {
    modalCfg.title = '修改資料源';
    modal = $modal(modalCfg);
    $scope.datasource = row.entity;
    $scope.isAdd = false;
    modal.$promise.then(modal.show);
  };

  $scope.showAdd = function () {
    modalCfg.title = '新增資料源';
    modal = $modal(modalCfg);
    $scope.isAdd = true;
    $scope.datasource = {};
    modal.$promise.then(modal.show);
  };

  $scope.testConnect = function () {
    $dmaService.db.testConnect($scope.datasource).success(function (data, status, headers) {
      $icscAlert.success('連線成功 !!');
    });
  };

  $scope.update = function () {
    $dmaService.dataDefinition.updateDS($scope.datasource).success(function (data, status, headers) {
      modal.$promise.then(modal.hide);
      $icscAlert.success('修改成功 !!');
    });
  };
  $scope.add = function () {
    $dmaService.dataDefinition.addDS($scope.datasource).success(function (data, status, headers) {
      modal.$promise.then(modal.hide);
      $scope.dsGrid.list.push($scope.datasource);
      $icscAlert.success('新增成功 !!');
    });
  };
  $scope.del = function (row) {
    $dmaService.dataDefinition.deleteDS(row.entity.datasourceId).success(function (data, status, headers) {
      var index = $scope.dsGrid.list.indexOf(row.entity);
      $scope.dsGrid.list.splice(index, 1);
      $icscAlert.success('刪除成功 !!');
    });
  };

  $dmaService.dataDefinition.getDatasources().success(function (data, status, headers) {
    $scope.dsGrid.list = data;
  });

//  $http.get('basicDataMgr/getReadableUserList').success(function (data, status, headers) {
//    $scope.readableUserList = data;
//    $scope.readableUserList.unshift({
//      type: 'all',
//      label: 'Everyone',
//      value: 'All'
//    });
//  });
});