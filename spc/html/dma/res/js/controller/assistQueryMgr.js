angular.module('dmaApp').controller('assistQueryMgrCtrl', function ($scope, $http, $modal, $aside, $icscAlert, $dmaService, uiGridConstants) {
  'use strict';

  //  $scope.assistTypeList = [
//    {'label': '過濾清單', 'value': 'FilterList'},
//    {'label': '下拉選單', 'value': 'DropdownList'}
//  ];

  var sourceTypeConstants = {
        TABLE: 'TABLE',
        PUBLIC: 'PUBLIC_TABLE',
        SQL: 'SQL'
      },
      assistEditModal, selectTableModal, selectPublicTableModal, selectRefModal;

  $scope.sourceTypeList = [
    {'label': '資料表', 'value': sourceTypeConstants.TABLE},
    {'label': '共用表格', 'value': sourceTypeConstants.PUBLIC},
    {'label': 'SQL 查詢句', 'value': sourceTypeConstants.SQL}
  ];
  $scope.refSourceTypeList = [
    {'label': '資料表', 'value': sourceTypeConstants.TABLE},
    {'label': '共用表格', 'value': sourceTypeConstants.PUBLIC}
  ];
  $scope.basicSetting = {};

  $scope.assistGrid = {
    list: [],
    gridOptions: {
      multiSelect: false,
      enableColumnMenus: false,
      enableFiltering: true,
      enableRowHeaderSelection: false,
      enableSorting: true,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      data: 'assistGrid.list',
      columnDefs: [
        {name: 'assistId', displayName: '輔助查詢代碼'},
        {name: 'sourceType', displayName: '資料來源', cellFilter: 'sourceTypeFilter', enableFiltering: false},
        {name: 'remark', displayName: '備註'},
        {
          name: 'action', displayName: '操作', width: '80', enableCellEdit: false, enableFiltering: false,
          cellTemplate: '<div class="ui-grid-cell-contents btn-group"><button type="button" class="btn btn-success btn-xs" bs-tooltip="tooltip" data-title="修改" ng-click="getExternalScopes().showModify(row)">' +
          '<span class="glyphicon glyphicon-edit"></span></button>' +
          '<button type="button" class="btn btn-danger btn-xs" bs-tooltip="tooltip" data-title="刪除" ng-click="getExternalScopes().del(row)">' +
          '<span class="glyphicon glyphicon-remove"></span></button></div>'
        }
      ]
    }
  };

  $scope.columnGrid = {
    list: [],
    gridOptions: {
      multiSelect: false,
      enableColumnMenus: false,
      enableRowHeaderSelection: false,
      enableSorting: false,
      enableCellEditOnFocus: true,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      data: 'columnGrid.list',
      columnDefs: [
        {
          name: 'no',
          displayName: '編號',
          enableCellEdit: false,
          cellTemplate: "<div class=\"ui-grid-cell-contents\">{{ rowRenderIndex +1 }}</div>",
          width: 45
        },
        {name: 'id.srcColumn', displayName: '欄位名稱', enableCellEdit: false, cellClass: 'ui-grid-disabled-cell'},
        {name: 'alias', displayName: '別名', enableCellEdit: true},
        {name: 'isShow', displayName: '是否顯示', type: 'boolean', width: 73},
        {
          name: 'isFilter', displayName: '提供過濾', type: 'boolean', width: 73,
          cellEditableCondition: function ($scope) {
            return $scope.row.entity.isShow === 'Y';
          }
        },
        {
          name: 'isTarget', displayName: '目標欄位', type: 'boolean', width: 73,
          cellEditableCondition: function ($scope) {
            return $scope.row.entity.isShow === 'Y';
          }
        },
        {name: 'showSeq', displayName: '顯示順序', type: 'number', width: 73},
        //{name: 'querySeq', displayName: '查詢順序', type: 'number', width: 73},
        //{
        //  name: 'queryRef', displayName: '查詢參考欄位', enableCellEdit: false, cellClass: 'ui-grid-disabled-cell',
        //  cellTemplate: "<div class=\"ui-grid-cell-contents\">{{row.entity.querySourceType ? (row.entity.querySchema ? row.entity.querySchema+'.'+row.entity.queryTable +'.'+row.entity.queryColumn : row.entity.queryTable +'.'+row.entity.queryColumn) : ''}}</div>"
        //},
        {
          name: 'refColumns', displayName: '參考欄位', enableCellEdit: false, cellClass: 'ui-grid-disabled-cell',
          cellTemplate: "<div class='ui-grid-cell-contents' bs-tooltip='tooltip' data-title='{{row.entity.refSourceType ? (row.entity.refSchema ? \"[\"+row.entity.refSchema+\".\"+row.entity.refTable+\".\"+row.entity.refColumn +\"] \"+row.entity.refDisplayColumns : \"[\"+row.entity.refTable+\".\"+row.entity.refColumn +\"] \"+row.entity.refDisplayColumns) : \"\"}}'>" +
          "{{row.entity.refSourceType ? (row.entity.refSchema ? '['+row.entity.refSchema+'.'+row.entity.refTable+'.'+row.entity.refColumn +'] '+row.entity.refDisplayColumns : '['+row.entity.refTable+'.'+row.entity.refColumn +'] '+row.entity.refDisplayColumns) : ''}}" +
          "</div>"
        },
        {
          name: 'action', displayName: '操作', width: '50', enableCellEdit: false, enableFiltering: false,
          cellTemplate: '<div class="ui-grid-cell-contents btn-group"><button type="button" class="btn btn-info btn-xs" bs-tooltip="tooltip" data-title="挑選參考欄位" ng-click="getExternalScopes().pickRefColumn(row)" ng-class="{\'disabled\':getExternalScopes().basicSetting.sourceType === \'SQL\'}">' +
          '<span class="glyphicon glyphicon-hand-up"></span></button>'
        }
      ],
      onRegisterApi: function (gridApi) {
        $scope.columnGrid.gridApi = gridApi;
        gridApi.edit.on.beginCellEdit($scope, function (rowEntity, colDef) {
          if (colDef.type === 'boolean') {
            rowEntity[colDef.name] = rowEntity[colDef.name] === 'Y' ? true : false;
          }
        });
        gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
          if (colDef.type === 'boolean') {
            rowEntity[colDef.name] = newValue ? 'Y' : 'N';
          }
          if (colDef.name === 'isShow' && !newValue) {
            rowEntity.isFilter = 'N';
            rowEntity.isTarget = 'N';
          }
        });
      }
    }
  };

  $scope.selectTableGrid = {
    list: [],
    gridOptions: {
      multiSelect: false,
      enableColumnMenus: false,
      enableFiltering: true,
      enableRowHeaderSelection: false,
      enableSorting: true,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      data: 'selectTableGrid.list',
      columnDefs: [
        {name: 'domain', displayName: '領域', width: '10%'},
        {name: 'system', displayName: '系統', width: '10%'},
        {name: 'id.srcTable', displayName: '資料表', width: '40%'},
        {name: 'alias', displayName: '別名', width: '40%'}
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var selectedType = $scope.basicSetting[$scope.basicSetting.sourceType],
                params = {
                  datasourceId: row.entity.id.datasourceId,
                  schema: row.entity.id.srcSchema,
                  table: row.entity.id.srcTable
                };

            selectedType.srcTable = params.table;
            $dmaService.dataDefinition.getColumns(params).success(function (data, status, headers) {
              angular.forEach(data, function (item, idx) {
                item.srcColumn = item.id.srcColumn;
                item.isShow = 'N';
                item.isFilter = 'N';
                item.isTarget = 'N';
              });

              selectedType.columns = data;
              $scope.columnGrid.list = data;
            });

            selectTableModal.$promise.then(selectTableModal.hide);
          }
        });
      }
    },
    chgSchema: function () {
      var selectedType = $scope.basicSetting[$scope.basicSetting.sourceType],
          self = this,
          params = {
            datasourceId: selectedType.datasourceId,
            schema: selectedType.srcSchema
          };

      $dmaService.dataDefinition.getTables(params).success(function (data, status, headers) {
        self.list = data;
      });
    },
    select: function () {
      selectTableModal = $modal({template: 'selectTableModal', scope: $scope});
      selectTableModal.$promise.then(selectTableModal.show);
    }
  };


  $scope.selectPublicTableGrid = {
    list: [],
    gridOptions: {
      multiSelect: false,
      enableColumnMenus: false,
      enableFiltering: true,
      enableRowHeaderSelection: false,
      enableSorting: true,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      data: 'selectPublicTableGrid.list',
      columnDefs: [
        {name: 'id.tabid', displayName: '編號', width: '10%'},
        {name: 'tabname', displayName: '名稱', width: '10%'},
        {name: 'tabcomment', displayName: '說明', width: '40%'}
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var selectedType = $scope.basicSetting[$scope.basicSetting.sourceType];
            selectedType.columns = [];
            for (var idx = 1; idx < 5; idx++) {
              selectedType.columns.push({
                id: {srcColumn: 'field' + idx},
                alias: row.entity['field' + idx + 'name'],
                isShow: 'N',
                isFilter: 'N',
                isTarget: 'N'
              })
            }

            $scope.columnGrid.list = selectedType.columns;
            $scope.basicSetting.publicTable = row.entity.id.tabid;
            selectPublicTableModal.$promise.then(selectPublicTableModal.hide);
          }
        });
      }
    },
    select: function () {
      selectPublicTableModal = $modal({template: 'selectPublicTableModal', scope: $scope});
      selectPublicTableModal.$promise.then(selectPublicTableModal.show);
    }
  };

  $scope.refTableGrid = {
    list: [],
    gridOptions: {
      multiSelect: false,
      enableColumnMenus: false,
      enableFiltering: true,
      enableRowHeaderSelection: false,
      enableSorting: true,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      data: 'refTableGrid.list',
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
            var selectedType = $scope.basicSetting[$scope.basicSetting.sourceType],
                params = {
                  datasourceId: row.entity.id.datasourceId,
                  schema: row.entity.id.srcSchema,
                  table: row.entity.id.srcTable
                };

            selectedType.refTable = params.table;
            $dmaService.dataDefinition.getColumns(params).success(function (data, status, headers) {
              $scope.refColumnGrid.list = data;
              $scope.refDisplayColumnGrid.list = data;
            });
          } else {
            $scope.refColumnGrid.list = [];
          }
        });
      }
    }
  };

  $scope.refColumnGrid = {
    list: [],
    gridOptions: {
      multiSelect: false,
      enableColumnMenus: false,
      enableFiltering: true,
      enableRowHeaderSelection: false,
      enableSorting: false,
      enableCellEditOnFocus: true,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      data: 'refColumnGrid.list',
      columnDefs: [
        {name: 'id.srcColumn', displayName: '欄位名稱'},
        {name: 'alias', displayName: '欄位別名'},
        {name: 'srcType', displayName: '型別', width: 80},
        {name: 'srcSize', displayName: '長度', width: 60},
        {name: 'srcIsPk', displayName: '主鍵', width: 60},
        {name: 'dataType', displayName: '資料型別', cellFilter: 'columnDataTypeFilter'}
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var selectedType = $scope.basicSetting[$scope.basicSetting.sourceType];
            selectedType.refColumn = row.entity.id.srcColumn;
          }
        });
      }
    }
  };

  $scope.refDisplayColumnGrid = {
    list: [],
    gridOptions: {
      multiSelect: true,
      enableColumnMenus: false,
      enableFiltering: true,
      enableRowHeaderSelection: false,
      enableSorting: false,
      enableCellEditOnFocus: true,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      data: 'refDisplayColumnGrid.list',
      columnDefs: [
        {name: 'id.srcColumn', displayName: '欄位名稱'}
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          var selectedType = $scope.basicSetting[$scope.basicSetting.sourceType];
          if (row.isSelected) {
            selectedType.refDisplayColumns.push(row.entity.id.srcColumn);
          } else {
            selectedType.refDisplayColumns.pop(row.entity.id.srcColumn);
          }
        });
      }
    }
  };

  $scope.refPublicTableGrid = {
    list: [],
    gridOptions: {
      multiSelect: false,
      enableColumnMenus: false,
      enableFiltering: true,
      enableRowHeaderSelection: false,
      enableSorting: true,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      data: 'refPublicTableGrid.list',
      columnDefs: [
        {name: 'id.tabid', displayName: '編號', width: '10%'},
        {name: 'tabname', displayName: '名稱', width: '10%'},
        {name: 'tabcomment', displayName: '說明', width: '40%'}
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var selectedType = $scope.basicSetting[$scope.basicSetting.sourceType],
                fields = [];

            for (var idx = 1; idx < 5; idx++) {
              if (row.entity['field' + idx + 'name'].trim() !== '') {
                var columnId = 'field' + idx,
                    columnName = row.entity['field' + idx + 'name'];
                fields.push({column: columnId, name: columnName, id: {srcColumn: columnId}});
              }
            }

            selectedType.refTable = row.entity.id.tabid.trim();
            $scope.refPublicColumnGrid.list = fields;
            $scope.refDisplayColumnGrid.list = fields;
          }
        });
      }
    }
  };

  $scope.refPublicColumnGrid = {
    list: [],
    gridOptions: {
      multiSelect: false,
      enableColumnMenus: false,
      enableRowHeaderSelection: false,
      enableFiltering: true,
      enableSorting: false,
      enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
      data: 'refPublicColumnGrid.list',
      columnDefs: [
        {
          name: 'no', displayName: '編號', enableFiltering: false, width: 50,
          cellTemplate: "<div class=\"ui-grid-cell-contents\">{{ rowRenderIndex +1 }}</div>"
        },
        {name: 'column', displayName: '欄位名稱'},
        {name: 'name', displayName: '說明'}
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var selectedType = $scope.basicSetting[$scope.basicSetting.sourceType];
            selectedType.refColumn = row.entity.column;
          }
        });
      }
    }
  };

  $scope.showAdd = function () {
    cleanForm();
    $scope.isAdd = true;
    assistEditModal = $modal({title: '新增輔助查詢', template: 'assistEditModal', scope: $scope});
    assistEditModal.$promise.then(assistEditModal.show);
  };

  $scope.showModify = function (row) {
    cleanForm();
    var assistQuery = row.entity, selectedType = {};
    $scope.isAdd = false;
    $scope.basicSetting[assistQuery.sourceType] = selectedType;
    $scope.basicSetting.assistId = assistQuery.assistId;
    $scope.basicSetting.sourceType = assistQuery.sourceType;
    $scope.basicSetting.remark = assistQuery.remark;

    selectedType.refDisplayColumns = [];
    if (assistQuery.sourceType === sourceTypeConstants.TABLE) {
      selectedType.datasourceId = assistQuery.datasourceId;
      selectedType.srcSchema = assistQuery.srcSchema;
      selectedType.srcTable = assistQuery.srcTable;
      $scope.chgDS();
      $scope.selectTableGrid.chgSchema();
    } else if (assistQuery.sourceType === sourceTypeConstants.PUBLIC) {
      $scope.basicSetting.publicTable = assistQuery.publicTable;
    } else if (assistQuery.sourceType === sourceTypeConstants.SQL) {
      selectedType.datasourceId = assistQuery.datasourceId;
      $scope.basicSetting.sql = assistQuery.sql;
      $scope.chgDS();
    }

    selectedType.columns = angular.copy(assistQuery.assistQueryFields);
    $scope.columnGrid.list = selectedType.columns;
    selectedType.refSchema = null;
    selectedType.refTable = null;
    selectedType.refColumn = null;
    selectedType.refSourceType = null;

    assistEditModal = $modal({title: '修改輔助查詢', template: 'assistEditModal', scope: $scope});
    assistEditModal.$promise.then(assistEditModal.show);
  };

  function cleanForm() {
    //Clean before input
    $scope.basicSetting = {};
    $scope.basicSetting.sourceType = null;
    $scope.columnGrid.list = [];

    //Clean before selected result
    $scope.selectTableGrid.list = [];
    $scope.refTableGrid.list = [];
    $scope.refColumnGrid.list = [];
    $scope.refPublicColumnGrid.list = [];
  }

  $scope.save = function () {
    var selectedType = $scope.basicSetting[$scope.basicSetting.sourceType],
        assistQuery = {};

    assistQuery.assistId = $scope.basicSetting.assistId;
    assistQuery.sourceType = $scope.basicSetting.sourceType;
    assistQuery.remark = $scope.basicSetting.remark;

    if (assistQuery.sourceType === sourceTypeConstants.TABLE) {
      assistQuery.datasourceId = selectedType.datasourceId;
      assistQuery.srcSchema = selectedType.srcSchema;
      assistQuery.srcTable = selectedType.srcTable;
    }
    if (assistQuery.sourceType === sourceTypeConstants.PUBLIC) {
      assistQuery.publicTable = $scope.basicSetting.publicTable;
    }
    if (assistQuery.sourceType === sourceTypeConstants.SQL) {
      assistQuery.datasourceId = selectedType.datasourceId;
      assistQuery.sql = $scope.basicSetting.sql;
    }

    assistQuery.fields = $scope.columnGrid.list;

    $dmaService.assistQueryMgr[$scope.isAdd ? 'add' : 'update'](assistQuery).success(function (data, status, headers) {
      $dmaService.assistQueryMgr.getAssistQueryList().success(function (data, status, headers) {
        $scope.assistGrid.list = data;
      });

      assistEditModal.$promise.then(assistEditModal.hide);
      $icscAlert.success($scope.isAdd ? '新增成功 !!' : '修改成功 !!');
    });
  };

  $scope.del = function (row) {
    $dmaService.assistQueryMgr.delete(row.entity.assistId).success(function (data, status, headers) {
      var index = $scope.assistGrid.list.indexOf(row.entity);
      $scope.assistGrid.list.splice(index, 1);
      $icscAlert.success('刪除成功 !!');
    });
  };

  $scope.executeSql = function () {
    var selectedType = $scope.basicSetting[$scope.basicSetting.sourceType];
    $dmaService.db.getColumnsInfoBySQL(selectedType.datasourceId, $scope.basicSetting.sql).success(function (data, status, headers) {
      var columns = [];
      angular.forEach(data, function (item, idx) {
        columns.push({
          id: {srcColumn: item.name},
          isShow: 'N',
          isFilter: 'N',
          isTarget: 'N'
        });
      });

      selectedType.columns = columns;
      $scope.columnGrid.list = columns;
    });
  };

  $scope.chgSourceType = function () {
    if (typeof $scope.basicSetting[$scope.basicSetting.sourceType] === 'undefined') {
      $scope.basicSetting[$scope.basicSetting.sourceType] = {columns: []}
    }
    $scope.columnGrid.list = $scope.basicSetting[$scope.basicSetting.sourceType].columns;
  };

  $scope.chgDS = function () {
    var selectedType = $scope.basicSetting[$scope.basicSetting.sourceType];
    $dmaService.dataDefinition.getSchemas(selectedType.datasourceId).success(function (data, status, headers) {
      selectedType.schemas = data;
    }).error(function () {
      selectedType.schemas = [];
    });
  };

  $scope.pickRefColumn = function (row) {
    $scope.columnGrid.selected = row.entity;
    selectRefModal = $modal({template: 'selectRefModal', scope: $scope});
    selectRefModal.$promise.then(selectRefModal.show);
  };

  $scope.confirmRefColumn = function () {
    var selectedType = $scope.basicSetting[$scope.basicSetting.sourceType];
    $scope.columnGrid.selected.refSourceType = selectedType.refSourceType;
    if (selectedType.refSourceType === sourceTypeConstants.TABLE) {
      $scope.columnGrid.selected.refSchema = selectedType.refSchema;
    }
    $scope.columnGrid.selected.refTable = selectedType.refTable;
    $scope.columnGrid.selected.refColumn = selectedType.refColumn;
    $scope.columnGrid.selected.refDisplayColumns = selectedType.refDisplayColumns.toString();
    selectedType.refDisplayColumns = [];
    selectRefModal.$promise.then(selectRefModal.hide);
  };

  $scope.cancelRefColumn = function () {
    var selectedType = $scope.basicSetting[$scope.basicSetting.sourceType];
    selectedType.refSchema = null;
    selectedType.refTable = null;
    selectedType.refColumn = null;
    selectedType.refDisplayColumns = [];
    $scope.columnGrid.selected.refSourceType = null;
    $scope.columnGrid.selected.refSchema = null;
    $scope.columnGrid.selected.refTable = null;
    $scope.columnGrid.selected.refColumn = null;
    $scope.columnGrid.selected.refDisplayColumns = null;
    selectRefModal.$promise.then(selectRefModal.hide);
  };

  $scope.chgRefSchema = function () {
    var selectedType = $scope.basicSetting[$scope.basicSetting.sourceType];
    var params = {
      datasourceId: selectedType.datasourceId,
      schema: selectedType.refSchema
    };

    $dmaService.dataDefinition.getTables(params).success(function (data, status, headers) {
      $scope.refTableGrid.list = data;
    });
  };

  $dmaService.dataDefinition.getDatasources().success(function (data, status, headers) {
    $scope.datasources = data;
  });

  $dmaService.basicData.getPublicTables().success(function (data, status, headers) {
    $scope.refPublicTableGrid.list = data;
    $scope.selectPublicTableGrid.list = data;
  });

  $dmaService.assistQueryMgr.getAssistQueryList().success(function (data, status, headers) {
    $scope.assistGrid.list = data;
  });

  $scope.checkAssistId = function (value) {
    if (!$scope.isAdd) {
      return true;
    }

    var result = true;
    angular.forEach($scope.assistGrid.list, function (assistQuery, key) {
      if (assistQuery.assistId === value) {
        result = false;
        return result;
      }
    });

    return result;
  };
});