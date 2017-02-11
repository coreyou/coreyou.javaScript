angular.module('dmaApp').controller('columnMgrCtrl', function ($scope, $http, $modal, $icscAlert, $q, $filter, $dmaService, uiGridConstants) {
  'use strict';

  var gridOpeator =
          '<div class="ui-grid-cell-contents btn-group"><button type="button" class="btn btn-info btn-xs" bs-tooltip="tooltip" data-title="挑選輔助查詢" ng-click="getExternalScopes().pickAssistQuery(row)">' +
          '<span class="glyphicon glyphicon-hand-up"></span></button>' +
          '<button type="button" class="btn btn-danger btn-xs" bs-tooltip="tooltip" data-title="刪除" ng-click="getExternalScopes().del(row)">' +
          '<span class="glyphicon glyphicon-remove"></span></button></div>',
      modalCfg = {
        title: '資料表清單',
        scope: $scope
      },
      modal,
      dataTypes = [
        {id: 'TEXT', dataType: '文字'},
        {id: 'NUMBER', dataType: '數字'},
        {id: 'DATE', dataType: '日期'},
        {id: 'TIME', dataType: '時間'},
        {id: 'CURRENCY', dataType: '貨幣'}
      ];

  $scope.dsList = [];
  $scope.schemaList = [];

  $scope.columnGrid = {
    list: [],
    selectedItems: [],
    gridOptions: {
      multiSelect: false,
      enableColumnMenu: false,
      enableFiltering: true,
      enableRowHeaderSelection: false,
      enableSorting: false,
      enableCellEditOnFocus: true,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      data: 'columnGrid.list',
      columnDefs: [
        {name: 'id.srcColumn', displayName: '欄位名稱', enableCellEdit: false, cellClass: 'ui-grid-disabled-cell'},
        {name: 'srcType', displayName: '型別', enableCellEdit: false, cellClass: 'ui-grid-disabled-cell', width: 80},
        {name: 'srcSize', displayName: '長度', enableCellEdit: false, cellClass: 'ui-grid-disabled-cell', width: 60},
        {
          name: 'srcDecimalDigits',
          displayName: '小數位數',
          cellClass: 'ui-grid-disabled-cell',
          enableCellEdit: false,
          width: 70
        },
        {name: 'srcIsPk', displayName: '主鍵', enableCellEdit: false, cellClass: 'ui-grid-disabled-cell', width: 60},
        {name: 'alias', displayName: '欄位別名'},
        {
          name: 'dataType',
          displayName: '資料型別',
          cellFilter: 'columnDataTypeFilter',
          editDropdownValueLabel: 'dataType',
          editableCellTemplate: 'ui-grid/dropdownEditor',
          editDropdownOptionsArray: dataTypes
        },
        {name: 'unit', displayName: '單位'},
        {name: 'format', displayName: '格式'},
        {name: 'readableUser', displayName: '可讀取者'},
        {name: 'assistId', displayName: '參考輔助查詢代碼', enableCellEdit: false},
        {
          name: 'action',
          displayName: '操作',
          width: '80',
          enableCellEdit: false,
          enableFiltering: false,
          cellTemplate: gridOpeator
        }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
      }
    }
  };

  $scope.tableGrid = {
    list: [],
    gridOptions: {
      multiSelect: false,
      enableColumnMenu: false,
      enableFiltering: true,
      enableRowHeaderSelection: false,
      enableSorting: true,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      data: 'tableGrid.list',
      columnDefs: [
        {name: 'domain', displayName: '領域', width: '10%'},
        {name: 'system', displayName: '系統', width: '10%'},
        {name: 'id.srcTable', displayName: '資料表', width: '40%'},
        {name: 'alias', displayName: '別名', width: '40%'}
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            $scope.tableGrid.selected = row.entity;
            var params = {
              datasourceId: row.entity.id.datasourceId,
              schema: row.entity.id.srcSchema,
              table: row.entity.id.srcTable
            };

            $dmaService.dataDefinition.getColumns(params).success(function (data, status, headers) {
              $scope.columnGrid.list = data;
              var columnDefs = [];
              columnDefs.push({
                name: 'seqNo',
                displayName: 'No.',
                enableFiltering: false,
                enableCellEdit: false,
                width: 45
              });
              angular.forEach($scope.columnGrid.list, function (item) {
                columnDefs.push({
                  name: item.id.srcColumn.toLowerCase(),
                  displayName: item.id.srcColumn,
                  width: '15%'
                });
              });
              $scope.dataGrid.gridOptions.columnDefs = columnDefs;
              $dmaService.dataDefinition.getPreviewData(params).success(function (data, status, headers) {
                angular.forEach(data, function (item, idx) {
                  item.seqNo = idx + 1;
                });
                $scope.dataGrid.list = data;
              });
            });

            modal.$promise.then(modal.hide);
          }
        });
      }
    }
  };

  $scope.assistGrid = {
    list: [],
    gridOptions: {
      multiSelect: false,
      enableColumnMenu: false,
      enableFiltering: true,
      enableRowHeaderSelection: false,
      enableSorting: true,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      data: 'assistGrid.list',
      columnDefs: [
        {name: 'assistId', displayName: '輔助查詢代碼'},
        {name: 'sourceType', displayName: '資料來源', cellFilter: 'sourceTypeFilter', enableFiltering: false},
        {name: 'remark', displayName: '備註'}
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            $scope.editColumn.assistId = row.entity.assistId;
            $scope.saveRow();
            modal.$promise.then(modal.hide);
          }
        });
      }
    }
  };

  $scope.dataGrid = {
    list: [],
    gridOptions: {
      multiSelect: false,
      enableColumnMenu: true,
      enableFiltering: true,
      enableRowHeaderSelection: false,
      enableSorting: true,
      data: 'dataGrid.list'
    }
  };

  $scope.chgDS = function () {
    $scope.schema = '';
    $scope.columnGrid.list = [];
    $scope.dataGrid.gridOptions.columnDefs = [];

    $dmaService.dataDefinition.getSchemas($scope.datasourceId).success(function (data, status, headers) {
      $scope.schemaList = data;
    }).error(function () {
      $scope.schemaList = [];
    });
  };

  $scope.chgSchema = function () {
    $scope.columnGrid.list = [];
    $scope.dataGrid.gridOptions.columnDefs = [];
    $scope.dataGrid.list = [];

    var params = {
      datasourceId: $scope.datasourceId,
      schema: $scope.schema
    };

    $dmaService.dataDefinition.getTables(params).success(function (data, status, headers) {
      $scope.tableGrid.list = data;
    });
  };

  $scope.selectTable = function () {
    modalCfg.title = '資料表清單';
    modalCfg.template = 'selectTbModal';
    modal = $modal(modalCfg);
    modal.$promise.then(modal.show);
  };

  $scope.pickAssistQuery = function (row) {
    $scope.editColumn = row.entity;
    modalCfg.title = '輔助查詢代碼清單';
    modalCfg.template = 'selectAssistQueryModal';
    modal = $modal(modalCfg);
    modal.$promise.then(modal.show);
  };

  $scope.save = function () {
    $dmaService.dataDefinition.updateColumns($scope.columnGrid.list).success(function (data, status, headers) {
      $scope.isEdit = false;
      $icscAlert.success('儲存成功 !!');
    });
  };

  $scope.del = function (row) {
    $dmaService.dataDefinition.deleteColumn(row.entity.id).success(function (data, status, headers) {
      var index = $scope.columnGrid.list.indexOf(row.entity);
      $scope.columnGrid.list.splice(index, 1);
      $icscAlert.success('刪除成功 !!');
    });
  };

  $scope.saveRow = function () {
    $scope.isEdit = true;
  };

  $dmaService.dataDefinition.getDatasources().success(function (data, status, headers) {
    $scope.dsList = data;
  });

  $dmaService.assistQueryMgr.getAssistQueryList().success(function (data, status, headers) {
    $scope.assistGrid.list = data;
  });
});
