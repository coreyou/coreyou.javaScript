angular.module('dmaApp').controller('tableMgrCtrl', function ($scope, $http, $modal, $q, $filter, $dmaService, $icscAlert, uiGridConstants) {
  'use strict';


  var gridOpeator =
          '<div class="ui-grid-cell-contents btn-group"><button type="button" class="btn btn-success btn-xs" bs-tooltip="tooltip" data-title="修改" ng-click="getExternalScopes().showModify(row)">' +
          '<span class="glyphicon glyphicon-edit"></span></button>' +
          '<button type="button" class="btn btn-danger btn-xs" bs-tooltip="tooltip" data-title="刪除" ng-click="getExternalScopes().del(row)">' +
          '<span class="glyphicon glyphicon-remove"></span></button></div>',

      modal = $modal({
        title: '修改資料表',
        template: 'importTbModal',
        scope: $scope
      });


  $scope.dsList = [];
  $scope.schemaList = [];
  $scope.datasource = {};
  $scope.schema = '';
  $scope.importTable = {};

  $scope.systemGroup = function (item) {
    return item.name.substring(0, 1);
  };

  $scope.tableGrid = {
    list: [],
    selectedItems: [],
    gridOptions: {
      multiSelect: true,
      enableColumnMenus: false,
      enableFiltering: true,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      enableSorting: false,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      data: 'tableGrid.list',
      columnDefs: [
        {
          name: 'domain', displayName: '領域', filter: {
          condition: uiGridConstants.filter.CONTAINS
        }, width: '10%'
        },
        {
          name: 'system', displayName: '系統', filter: {
          condition: uiGridConstants.filter.CONTAINS
        }, width: '10%'
        },
        {
          name: 'srcTable', displayName: '資料表', filter: {
          condition: uiGridConstants.filter.CONTAINS
        }, width: '40%'
        },
        {
          name: 'alias', displayName: '別名', filter: {
          condition: uiGridConstants.filter.CONTAINS
        }, width: '40%'
        }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.tableGrid.selectedItems = gridApi.selection.getSelectedRows();
        });
      }
    }
  };

  $scope.importGrid = {
    list: [],
    gridOptions: {
      multiSelect: false,
      enableColumnMenus: false,
      enableFiltering: true,
      enableRowHeaderSelection: false,
      enableSorting: false,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      data: 'importGrid.list',
      columnDefs: [
        {
          name: 'domain', displayName: '領域', filter: {
          condition: uiGridConstants.filter.CONTAINS
        }, width: '10%'
        },
        {
          name: 'system', displayName: '系統', filter: {
          condition: uiGridConstants.filter.CONTAINS
        }, width: '10%'
        },
        {
          name: 'id.srcTable', displayName: '資料表', filter: {
          condition: uiGridConstants.filter.CONTAINS
        }
        },
        {
          name: 'alias', displayName: '別名', filter: {
          condition: uiGridConstants.filter.CONTAINS
        }
        },
        {name: 'action', displayName: '操作', width: '80', enableFiltering: false, cellTemplate: gridOpeator}
      ]
    }
  };

  $scope.chgDS = function () {
    $scope.schema = '';
    $scope.tableGrid.list = [];

    $dmaService.db.getSchemas($scope.datasource.datasourceId).success(function (data, status, headers) {
      $scope.schemaList = data;
    }).error(function () {
      $scope.schemaList = [];
    });
  };

  $scope.chgSchema = function () {
    $scope.datasource.schema = $scope.schema;
    $q.all([
      $dmaService.dataDefinition.getUnImportTables($scope.datasource),
      $dmaService.dataDefinition.getTables($scope.datasource)
    ]).then(function (values) {
      $scope.tableGrid.list = values[0].data;
      $scope.importGrid.list = values[1].data;
    });
  };

  $scope.showModify = function (row) {
    $scope.importTable = row.entity;
    $scope.systemList.selected = {
      name: $scope.importTable.system
    };
    $scope.domainList.selected = {
      domain: $scope.importTable.domain
    };
    modal.$promise.then(modal.show);
  };

  $scope.update = function () {
    $scope.importTable.system = $scope.systemList.selected.name;
    $scope.importTable.domain = $scope.domainList.selected.domain;

    $dmaService.dataDefinition.updateTable($scope.importTable).success(function (data, status, headers) {
      modal.$promise.then(modal.hide);
      $icscAlert.success('修改成功 !!');
    });
  };

  $scope.del = function (row) {
    var table = row.entity;

    $dmaService.dataDefinition.deleteTable(table).success(function (data, status, headers) {
      $scope.tableGrid.list.unshift({
        alias: table.alias,
        domain: table.domain,
        srcSchema: table.id.srcSchema,
        srcTable: table.id.srcTable,
        system: table.system
      });
      modal.$promise.then(modal.hide);
      var index = $scope.importGrid.list.indexOf(table);
      $scope.importGrid.list.splice(index, 1);
      $icscAlert.success('刪除成功 !!');
    });
  };

  $scope.import = function () {
    var selectedItems = $scope.tableGrid.selectedItems;
    angular.forEach(selectedItems, function (item) {
      var index = $scope.tableGrid.list.indexOf(item);
      $scope.tableGrid.list.splice(index, 1);
      item.datasourceId = $scope.datasource.datasourceId;
    });

    $dmaService.dataDefinition.importTable(selectedItems).success(function (data, status, headers) {
      $icscAlert.success('匯入成功 !!');
      $dmaService.dataDefinition.getTables($scope.datasource).success(function (data, status, headers) {
        $scope.importGrid.list = data;
      });
    });
  };

  $dmaService.dataDefinition.getDatasources().success(function (data, status, headers) {
    $scope.dsList = data;
  });

  $dmaService.basicData.getSystems().success(function (data, status, headers) {
    $scope.systemList = data;
  });

  $dmaService.basicData.getDomains().success(function (data, status, headers) {
    $scope.domainList = data;
  });
});