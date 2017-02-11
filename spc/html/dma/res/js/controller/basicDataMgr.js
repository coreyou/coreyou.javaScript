angular.module('dmaApp').controller('basicDataMgrCtrl', function ($scope, $http, $modal, $icscAlert, $dmaService, uiGridConstants) {
  'use strict';

  var gridOpeator =
          '<div class="ui-grid-cell-contents btn-group"><button type="button" class="btn btn-success btn-xs" bs-tooltip="tooltip" data-title="修改" ng-click="getExternalScopes().showModify(row)">' +
          '<span class="glyphicon glyphicon-edit"></span></button>' +
          '<button type="button" class="btn btn-danger btn-xs" bs-tooltip="tooltip" data-title="刪除" ng-click="getExternalScopes().del(row)">' +
          '<span class="glyphicon glyphicon-remove"></span></button></div>',
      modalCfg = {
        template: 'domainModal',
        scope: $scope
      },
      modal;


  $scope.tabs = [
    {
      "title": "領域資料",
      "template": "domain"
    }
  ];
  $scope.tabs.activeTab = 0;

  $scope.domain = {};
  $scope.domainGrid = {
    list: [],
    gridOptions: {
      multiSelect: false,
      enableColumnMenus: false,
      enableFiltering: true,
      enableRowHeaderSelection: false,
      enableSorting: false,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      data: 'domainGrid.list',
      columnDefs: [
        {name: 'domain', displayName: '領域名稱'},
        {name: 'description', displayName: '領域描述'},
        {name: 'action', displayName: '操作', width: '80', enableFiltering: false, cellTemplate: gridOpeator}
      ]
    }
  };

  $scope.showAdd = function () {
    modalCfg.title = '新增領域資料';
    modal = $modal(modalCfg);
    $scope.isAdd = true;
    $scope.domain = {};
    modal.$promise.then(modal.show);
  };

  $scope.showModify = function (row) {
    modalCfg.title = '修改領域資料';
    modal = $modal(modalCfg);
    $scope.domain = row.entity;
    $scope.isAdd = false;
    modal.$promise.then(modal.show);
  };

  $scope.add = function () {
    $dmaService.basicDataMgr.addDomain($scope.domain).success(function (data, status, headers) {
      modal.$promise.then(modal.hide);
      $scope.domainGrid.list.push($scope.domain);
      $icscAlert.success('新增成功 !!');
    });
  };

  $scope.update = function () {
    $dmaService.basicDataMgr.updateDomain($scope.domain).success(function (data, status, headers) {
      modal.$promise.then(modal.hide);
      $icscAlert.success('儲存成功 !!');
    });
  };

  $scope.del = function (row) {
    $dmaService.basicDataMgr.deleteDomain(row.entity.domain).success(function (data, status, headers) {
      var index = $scope.domainGrid.list.indexOf(row.entity);
      $scope.domainGrid.list.splice(index, 1);
      $icscAlert.success('刪除成功 !!');
    });
  };

  $scope.checkDomain = function (value) {
    if (!$scope.isAdd) {
      return true;
    }

    var result = true;
    angular.forEach($scope.domainGrid.list, function (domain, key) {
      if (domain.domain === value) {
        result = false;
        return result;
      }
    });

    return result;
  };

  $dmaService.basicData.getDomains().success(function (data, status, headers) {
    $scope.domainGrid.list = data;
  });
});