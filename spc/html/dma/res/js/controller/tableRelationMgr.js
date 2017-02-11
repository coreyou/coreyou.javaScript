angular.module('dmaApp').controller('tableRelationMgrCtrl', function ($scope, $http, $modal, $icscAlert, $dmaService, $compile, uiGridConstants) {
  'use strict';

  var selectTableModal;

  $scope.joinType = {
    list: [
      {label: 'FULL', value: 'FULL'},
      {label: 'LEFT', value: 'LEFT'},
      {label: 'RIGHT', value: 'RIGHT'},
      {label: 'INNER', value: 'INNER'}
    ]
  };

  $scope.$on('srcTable:confirm', function (event, table) {
    $scope.srcColumnGrid.selectedTable = table;

    $dmaService.dataDefinition.getColumns({
      datasourceId: $scope.datasourceId,
      schema: $scope.srcSchema,
      table: table.id.srcTable
    }).success(function (data, status, headers) {
      $scope.srcColumnGrid.list = data;
    });

    getRelations();
  });

  $scope.$on('targetTable:confirm', function (event, table) {
    $scope.tarColumnGrid.selectedTable = table;

    var params = {
      datasourceId: $scope.datasourceId,
      schema: $scope.srcSchema,
      table: table.id.srcTable
    };
    $dmaService.dataDefinition.getColumns(params).success(function (data, status, headers) {
      $scope.tarColumnGrid.list = data;
    });
  });

  var baseSetting = {
    list: [],
    selectedTable: null,
    selected: null,
    gridOptions: {
      enableFiltering: true,
      enableRowHeaderSelection: false,
      enableColumnMenus: false,
      enableSorting: true,
      multiSelect: false,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      columnDefs: [
        {
          name: 'id.srcColumn', displayName: '欄位名稱',
          filter: {
            condition: uiGridConstants.filter.CONTAINS
          }
        },
        {
          name: 'alias', displayName: '欄位別名',
          filter: {
            condition: uiGridConstants.filter.CONTAINS
          }
        }
      ]
    }
  };

  $scope.srcColumnGrid = $.extend(true, {}, baseSetting, {
    gridOptions: {
      data: 'srcColumnGrid.list',
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.srcColumnGrid.selected = gridApi.selection.getSelectedRows()[0];
          $scope.condition.isAdd = $scope.srcColumnGrid.selected && $scope.tarColumnGrid.selected;
        });
      }
    }
  });

  $scope.tarColumnGrid = $.extend(true, {}, baseSetting, {
    gridOptions: {
      data: 'tarColumnGrid.list',
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.tarColumnGrid.selected = gridApi.selection.getSelectedRows()[0];
          $scope.condition.isAdd = $scope.srcColumnGrid.selected && $scope.tarColumnGrid.selected;
        });
      }
    }
  });

  $scope.condition = {
    isAdd: false,
    selected: [],
    list: [],
    gridOptions: {
      multiSelect: true,
      enableColumnResizing: true,
      enableRowHeaderSelection: false,
      enableColumnMenus: false,
      enableSorting: false,
      data: 'condition.list',
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      columnDefs: [
        {name: 'srcTable', displayName: '資料表'},
        {name: 'srcColumn', displayName: '資料欄位'},
        {name: 'tarTable', displayName: '關聯表'},
        {name: 'tarColumn', displayName: '關聯欄位'}
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.condition.selected = gridApi.selection.getSelectedRows();
        });
      }
    },
    add: function () {
      if (checkConditionIsDuplicate()) {
        $icscAlert.warn("關聯條件重複", $scope.srcColumnGrid.selected.id.srcColumn +
        " --> " + $scope.tarColumnGrid.selected.id.srcColumn + " 已存在 !!");
      } else {
        $scope.condition.list.push({
          srcTable: $scope.srcColumnGrid.selectedTable.id.srcTable,
          srcColumn: $scope.srcColumnGrid.selected.id.srcColumn,
          tarTable: $scope.tarColumnGrid.selectedTable.id.srcTable,
          tarColumn: $scope.tarColumnGrid.selected.id.srcColumn
        });
      }
    },
    del: function () {
      angular.forEach($scope.condition.selected, function (condition) {
        var index = $scope.condition.list.indexOf(condition);
        $scope.condition.list.splice(index, 1);
      });
    },
    save: function () {
      var relation = {
        datasourceId: $scope.datasourceId,
        srcSchema: $scope.srcSchema,
        srcTable: $scope.srcColumnGrid.selected.id.srcTable,
        joinType: $scope.joinType.selected,
        tarSchema: $scope.srcSchema,
        tarTable: $scope.tarColumnGrid.selected.id.srcTable,
        details: $scope.condition.list
      };

      $dmaService.tableRelationMgr.add(relation).success(function (data, status, headers) {
        getRelations();
        $scope.joinType.selected = null;
        $scope.condition.list = [];
        $icscAlert.success('關聯', '儲存成功 !!');
      });
    }
  };

  $scope.relation = {
    disabledDel: true,
    list: [],
    selectedItems: [],
    gridOptions: {
      multiSelect: false,
      enableColumnMenu: false,
      enableRowHeaderSelection: false,
      enableSorting: false,
      expandableRowTemplate: '<div ui-grid="row.entity.subGridOptions" class="subGrid"></div>',
      expandableRowHeight: 130,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      data: 'relation.list',
      columnDefs: [
        {name: 'datasourceId', displayName: '資料源', enableColumnMenu: false, width: '15%'},
        {
          name: 'srcTable', displayName: '資料表', enableColumnMenu: false,
          cellTemplate: "<div class=\"ui-grid-cell-contents\">{{row.entity.srcSchema +'.'+row.entity.srcTable }}</div>"
        },
        {name: 'joinType', displayName: '關聯類型', enableColumnMenu: false, width: '80'},
        {
          name: 'tarTable', displayName: '關聯表', enableColumnMenu: false,
          cellTemplate: "<div class=\"ui-grid-cell-contents\">{{row.entity.tarSchema +'.'+row.entity.tarTable }}</div>"
        },
        {
          name: 'action',
          displayName: '操作', enableColumnMenu: false,
          width: 50,
          cellTemplate: '<div class="ui-grid-cell-contents"><button type="button" class="btn btn-danger btn-xs" bs-tooltip="tooltip" data-title="刪除" ng-click="getExternalScopes().del(row)"><span class="glyphicon glyphicon-remove"></button></div>'
        }
      ]
    },
    del: function (row) {
      $dmaService.tableRelationMgr.delete(row.entity.id).success(function (data, status, headers) {
        $icscAlert.success('關聯', '刪除成功 !!');
        var index = $scope.relation.list.indexOf(row.entity);
        $scope.relation.list.splice(index, 1);
      });
    }
  };

  $scope.selectTableGrid = {
    list: [],
    gridOptions: {
      multiSelect: false,
      enableColumnMenu: false,
      enableFiltering: true,
      enableRowHeaderSelection: false,
      enableSorting: true,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      data: 'selectTableGrid.list',
      columnDefs: [
        {
          name: 'domain', displayName: '領域', width: '10%',
          filter: {condition: uiGridConstants.filter.CONTAINS}
        },
        {
          name: 'system', displayName: '系統', width: '10%',
          filter: {condition: uiGridConstants.filter.CONTAINS}
        },
        {
          name: 'id.srcTable', displayName: '資料表', width: '40%',
          filter: {condition: uiGridConstants.filter.CONTAINS}
        },
        {
          name: 'alias', displayName: '別名', width: '40%',
          filter: {condition: uiGridConstants.filter.CONTAINS}
        }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            selectTableModal.$promise.then(selectTableModal.hide);
            $scope.$broadcast($scope.selectTableGrid.type + ':confirm', row.entity);
          }
        });
      }
    }
  };

  $scope.selectTable = function (tableType) {
    $scope.selectTableGrid.type = tableType;
    selectTableModal = undefined;
    selectTableModal = $modal({scope: $scope, template: 'selectTableModal'});
    selectTableModal.$promise.then(selectTableModal.show);
  };

  $scope.chgDS = function () {
    $dmaService.dataDefinition.getSchemas($scope.datasourceId).success(function (data, status, headers) {
      $scope.schemas = data;
    }).error(function () {
      $scope.schemas = [];
    });
  };

  $scope.chgSchema = function () {
    var params = {
      datasourceId: $scope.datasourceId,
      schema: $scope.srcSchema
    };
    $dmaService.dataDefinition.getTables(params).success(function (data, status, headers) {
      $scope.selectTableGrid.list = data;
    });

    $scope.tarColumnGrid.list = [];
    $scope.tarColumnGrid.selectedTable = null;
  };


  $scope.chgJoinType = function () {
    $scope.condition.save();
  };

  function checkConditionIsDuplicate() {
    var result = false;
    angular.forEach($scope.condition.list, function (condition) {
      if ($scope.srcColumnGrid.selected.id.srcColumn === condition.srcColumn
          && $scope.tarColumnGrid.selected.id.srcColumn === condition.tarColumn) {
        result = true;
        return result;
      }
    });

    return result;
  }

  function getRelations() {
    $dmaService.tableRelationMgr.getRelations({
      datasourceId: $scope.datasourceId,
      srcSchema: $scope.srcSchema,
      srcTable: $scope.srcColumnGrid.selectedTable.id.srcTable
    }).success(function (data, status, headers) {
      angular.forEach(data, function (item) {
        item.subGridOptions = {
          columnDefs: [
            {
              name: "id.srcColumn",
              displayName: '資料欄位',
              enableColumnMenu: false,
              headerCellClass: 'ui-grid-subGrid-header'
            },
            {
              name: "id.tarColumn",
              displayName: '關聯欄位',
              enableColumnMenu: false,
              headerCellClass: 'ui-grid-subGrid-header'
            }],
          data: item.relationDetails
        };
      });

      $scope.relation.list = data;
    });
  }

  $dmaService.dataDefinition.getDatasources().success(function (data, status, headers) {
    $scope.datasources = data;
  });
});