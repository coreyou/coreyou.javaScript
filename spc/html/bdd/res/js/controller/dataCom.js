angular.module('bddApp').controller('dataComCtrl', function ($scope, $http, $icscRest, $modal, $alert, $compile, $dmaService) {
  'use strict';

  $scope.msg = function (type, msg) {
    $alert({
      type: type,
      content: msg
    });
  };

  $scope.$on('design:master:getColumn', function (event, table) {
    if ($scope.activeDataCom.hasDS()) {
      var params = {
        datasourceId: $scope.activeDataCom.dsId,
        schema: $scope.activeDataCom.schemaId,
        table: table
      };
      $scope.src.tables.push(table);
      $dmaService.dataDefinition.getColumns(params).success(function (data, status, headers) {
        $scope.src.list = data;
      });
    } else {
      $scope.msg('danger', '請先選擇資料源！');
    }
  });

  $scope.$on('design:slave:getColumn', function (event, table) {
    if ($scope.activeDataCom.hasDS()) {
      var params = {
        datasourceId: $scope.activeDataCom.dsId,
        schema: $scope.activeDataCom.schemaId,
        table: table
      };
      $scope.src.tables.push(table);
      $dmaService.dataDefinition.getColumns(params).success(function (data, status, headers) {
        $scope.src.list = $scope.src.list.concat(data);
      });
    } else {
      $scope.msg('danger', '請先選擇資料源！');
    }
  });

  $scope.$on('reface:getColumn', function (event, tables) {
    if ($scope.activeDataCom.hasDS()) {
      var params = {
        datasourceId: $scope.activeDataCom.dsId,
        schema: $scope.activeDataCom.schemaId,
        table: tables.shift()
      };
      $dmaService.dataDefinition.getColumns(params).success(function (data, status, headers) {
        $scope.src.list = $scope.src.list.concat(data);
        if (tables.length > 0) {
          $scope.$broadcast('reface:getColumn', tables);
          if (tables.length === 1) $scope.$broadcast('reface:getRelation', tables[0]);
        }
      });
    } else {
      $scope.msg('danger', '請先選擇資料源！');
    }
  });

  $scope.$on('reface:getRelation', function (event, table) {
    var params = {
      datasourceId: $scope.activeDataCom.dsId,
      srcSchema: $scope.activeDataCom.schemaId,
      srcTable: table
    };
    $dmaService.tableRelation.getRelations(params).success(function (data, status, headers) {
      $scope.relation.list = data;
    });
  });

  $scope.table = {
    modal: {},
    list: [],
    gridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      data: 'table.list',
      columnDefs: [
        {name: 'tableId', displayName: '資料表'}
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            $scope.table.selectedItem = row.entity;
            $scope.table.modal.$promise.then(function () {
              var table = row.entity.tableId;
              $scope.clear();
              $scope.table.modal.hide();
              $scope.src.tables = [table];
              $scope.$broadcast('design:master:getColumn', table);
              $scope.$broadcast('reface:getRelation', table);
            });
          }
        });
      }
    }),
    show: function ($event) {
      var self = this;
      self.modal = $modal({
        template: 'tableModal',
        show: false,
        scope: $scope
      });
      self.modal.$promise.then(function () {
        self.modal.show();
        self.modal.$element.find('.modal-dialog').offset({top: $event.clientY, left: $event.clientX});
      });
    }
  };

  $scope.relation = {
    modal: {},
    list: [],
    selectedItems: [],
    gridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      data: 'relation.list',
      columnDefs: [
        {name: 'srcTable', displayName: '來源表格'},
        {name: 'srcColumns.toString()', displayName: '來源欄位'},
        {name: 'joinType', displayName: '集合類型'},
        {name: 'tarTable', displayName: '目標表格'},
        {name: 'tarColumns.toString()', displayName: '目標欄位'}
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var table = row.entity['tarTable'];
            $scope.relation.selectedItem = row.entity;
            if ($scope.relation.selectedItems.indexOf(row.entity) === -1) {
              $scope.relation.selectedItems.push(row.entity);
            }
            $scope.relation.modal.hide();
            $scope.$broadcast('design:slave:getColumn', table);
            $scope.$broadcast('reface:getRelation', table);
          }
        });
      }
    }),
    show: function ($event) {
      var self = this;
      self.modal = $modal({
        template: 'relationModal',
        show: false,
        scope: $scope
      });
      self.modal.$promise.then(function () {
        self.modal.show();
        self.modal.$element.find('.modal-dialog').offset({top: $event.clientY, left: $event.clientX});
      });
    },
    getJoinOn: function (rel) {
      var joinOn = [];
      $.each(rel.srcColumns, function (i, v) {
        joinOn.push(rel.srcTable + '.' + v + ' = ' + rel.tarTable + '.' + rel.tarColumns[i]);
      });
      return joinOn;
    },
    getRel: function () {
      var _rel = [],
          rel = this.selectedItems;
      $.each(rel, function (i, v) {
        _rel.push({
          joinType: v.joinType,
          joinTable: v.tarTable,
          joinOn: $scope.relation.getJoinOn(v)
        });
      });
      return _rel;
    }
  };

  $scope.src = {
    list: [],
    tables: [],
    defCol: [],
    gridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      data: 'src.list',
      columnDefs: [
        { name: 'id.srcTable', displayName: '表格' },
        { name: 'id.srcColumn', displayName: '欄位ID' },
        { name: 'alias', displayName: '欄位名稱' },
        { name: 'srcType', displayName: '資料型態', width: 150 },
        { name: 'srcSize', displayName: '資料長度', width: 100 },
        { name: 'formula', displayName: '自定義公式' }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.core.on.renderingComplete($scope, function () {
          var boxHeight = $(window).height() - _bdd.constants.MASTER_PAGE_FIXED_HEIGHT;
          $('#bdd-src-grid').height(Math.floor(boxHeight * 0.6));
        });
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var table = row.entity.id.srcTable,
                colId = row.entity.id.srcColumn,
                colName = row.entity.alias,
                col = {
                  isUK: 1,
                  table: table,
                  colId: colId,
                  colName: colName,
                  inputType: 'INPUT',
                  srcType: row.entity.srcType,
                  formula: row.entity.formula
                };
            $scope.target.list.push(col);
          }
        });
      }
    })
  };

  $scope.target = {
    selectedRow: {},
    list: [],
    gridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      data: 'target.list',
      columnDefs: [
        { name: 'isUK', enableCellEdit: true, displayName: '欄位設定',
          cellFilter: 'mapIsUK', editDropdownValueLabel: 'isUK', editableCellTemplate: 'ui-grid/dropdownEditor',
          editDropdownOptionsArray: [
            { id: 1, isUK: '1-鍵值' },
            { id: 2, isUK: '2-過濾' },
            { id: 3, isUK: '3-顯示' }
          ]
        },
        { name: 'table', enableCellEdit: false, displayName: '表格' },
        { name: 'colId', enableCellEdit: false, displayName: '欄位ID' },
        { name: 'colName', enableCellEdit: false, displayName: '欄位名稱' },
        { name: 'inputType', enableCellEdit: false, displayName: '輸入類別' },
        { name: 'op',
          displayName: '操作',
          cellTemplate:
            '<div class="ui-grid-cell-contents btn-group">' +
              '<button type="button" class="btn btn-info btn-xs" bs-tooltip="tooltip" data-title="挑選輔助輸入類別" ng-click="getExternalScopes().pickAssist(row)">' +
                '<span class="glyphicon glyphicon-hand-up">' +
              '</button>' +
              '<button type="button" class="btn btn-danger btn-xs" bs-tooltip="tooltip" data-title="刪除" ng-click="getExternalScopes().del(row)">' +
                '<span class="glyphicon glyphicon-remove">' +
              '</button>' +
            '</div>',
          enableFiltering: false
        },
        { name: 'formula', displayName: '自定義公式', visible: false }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.core.on.renderingComplete($scope, function () {
          var boxHeight = $(window).height() - _bdd.constants.MASTER_PAGE_FIXED_HEIGHT;
          $('#bdd-target-grid').height(Math.floor(boxHeight * 0.4));
        });
//        gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
//          $scope.$apply();
//        });
      }
    }),
    del: function (row) {
      var index = $scope.target.list.indexOf(row.entity);
      $scope.target.list.splice(index, 1);
    },
    pickAssist: function (row) {
      $scope.assist.modal = $modal({
        template: 'assistModal',
        show: false,
        scope: $scope
      });
      $scope.target.selectedRow = row.entity;
      $scope.assist.modal.$promise.then($scope.assist.modal.show);
    }
  };

  $scope.assist = {
    modal: {},
    list: [
      { assistId: 'DATE', remark: '八碼日期: yyyyMMdd' },
      { assistId: 'TIME', remark: '四碼時間: HHmm' }
    ],
    selectedRow: {},
    gridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      data: 'assist.list',
      columnDefs: [
        { name: 'assistId', displayName: '輔助輸入鍵值' },
//        { name: 'filterWay', displayName: '過濾方式' },
        { name: 'remark', displayName: '說明' }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            $scope.assist.selectedRow = row.entity;
            $scope.target.selectedRow.inputType = row.entity.assistId;
            $scope.assist.modal.hide();
          }
        });
      }
    })
  };

  $scope.assistor = {
    modal: {},
    list: [],
    targetColId: '',
    gridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      data: 'assistor.list',
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var content = row.entity[$scope.assistor.targetColId.toLowerCase()],
                active = $scope.advQueryPane.form.active,
                condition = $scope.advQueryPane.form[active];
            if (condition) {
              if (condition.slice(-1) === '~')
                $scope.advQueryPane.form[active] += content;
              else $scope.advQueryPane.form[active] += ',' + content;
            } else {
              $scope.advQueryPane.form[active] = content;
            }
          }
        });
      }
    }),
    show: function ($event) {
      var currentTarget = $event.currentTarget,
          $currentTarget = $(currentTarget),
          top = $currentTarget.offset().top + currentTarget.offsetHeight,
          left = $currentTarget.offset().left;
      $dmaService.assistQuery.getAssistQuery($currentTarget.data("bdd-assistor")).success(function (rs) {
        if (rs.data && rs.data.length > 0) {
          $scope.assistor.modal = $modal({
            template: 'assistorModal',
            backdrop: 'static',
            show: false,
            scope: $scope
          });
          $scope.assistor.targetColId = rs.target;
          $scope.assistor.gridOpts.columnDefs = rs.columnDefs;
          $scope.assistor.list = rs.data;
          $scope.assistor.modal.$promise.then(function () {
            $scope.assistor.modal.show();
            $scope.assistor.modal.$element.find('.modal-dialog').offset({top: top, left: left});
          });
        } else {
          $scope.msg('danger', '查不到' + data.assistId + '資料！');
        }
      });
      $scope.advQueryPane.form.active = $currentTarget.data('bdd-form-active');
    },
    setSymbol: function () {
      var active = $scope.advQueryPane.form.active,
          condition = $scope.advQueryPane.form[active];
      if (condition && condition.slice(-1) !== '~') {
        $scope.advQueryPane.form[active] += '~';
      }
    }
  };

  $scope.orderBy = {
    modal: {},
    colList: [],
    ruleList: [],
    colGridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      data: 'orderBy.colList',
      columnDefs: [
        {name: 'id.srcTable', displayName: '表格'},
        {name: 'id.srcColumn', displayName: '欄位ID'},
        {name: 'alias', displayName: '欄位名稱'},
        {name: 'srcType', displayName: '資料型態'},
        {name: 'srcSize', displayName: '資料長度'}
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var e = row.entity,
                colVal = e.id.srcTable + '.' + e.id.srcColumn;
            $scope.orderBy.rule = colVal + ' ASC';
          }
        });
      }
    }),
    ruleGridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      enableFiltering: false,
      data: 'orderBy.ruleList',
      columnDefs: [
        { name: 'rule', displayName: '排序欄位清單(由上而下加入排序欄位)' },
        { name: 'op', displayName: '操作', width: 100,
          cellTemplate:
            '<div class="ui-grid-cell-contents btn-group">' +
              '<button type="button" class="btn btn-danger btn-xs" bs-tooltip="tooltip" data-title="刪除" ng-click="getExternalScopes().delRule(row)">' +
                '<span class="glyphicon glyphicon-remove">' +
              '</button>' +
            '</div>'
        }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.selected) {

          }
        });
      }
    }),
    show: function () {
      var filterCols = [];
      this.modal = $modal({
        template: 'orderByModal',
        show: false,
        scope: $scope
      });
      this.modal.$promise.then(this.modal.show);
      $.each($scope.src.list, function (i, v) {
        $.each($scope.target.list, function (i2, v2) {
          if (v.id.srcTable === v2.table && v.id.srcColumn === v2.colId) {
            filterCols.push(v);
          }
        });
      });
      $scope.orderBy.colList = filterCols;
    },
    desc: function () {
      var ruleVal = $scope.orderBy.rule;
      if (ruleVal && ruleVal.slice(-3) === 'ASC') {
        ruleVal = ruleVal.slice(0, -3) + 'DESC';
        $scope.orderBy.rule = ruleVal;
      }
    },
    addRule: function () {
      var ruleVal = $scope.orderBy.rule;
      if (ruleVal) {
        $scope.orderBy.ruleList.push({
          rule: ruleVal
        });
      }
    },
    clearRule: function () {
      $scope.orderBy.rule = '';
    },
    delRule: function (row) {
      var index = $scope.orderBy.ruleList.indexOf(row.entity);
      $scope.orderBy.ruleList.splice(index, 1);
    },
    get: function () {
      var orderStr = '';
      $.each(this.ruleList, function (i, v) {
        orderStr += v.rule + ',';
      });
      return orderStr.slice(0, -1);
    }
  };

  $scope.userFilter = {
    modal: {},
    selectedDataType: '',
    colList: [],
    ruleList: [],
    colGridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      data: 'userFilter.colList',
      columnDefs: [
        { name: 'id.srcTable', displayName: '表格', width: 150 },
        { name: 'id.srcColumn', displayName: '欄位ID', width: 150 },
        { name: 'alias', displayName: '欄位名稱', width: 150 },
        { name: 'srcType', displayName: '資料型態', width: 100 },
        { name: 'srcSize', displayName: '資料長度', visible: false },
        { name: 'formula', displayName: '自定義公式' }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var e = row.entity,
                formula = e.formula,
                colVal = formula ? formula : e.id.srcTable + '.' + e.id.srcColumn;
            if ($scope.userFilter.rule) {
              if (_bdd.util.isRuleOp($scope.userFilter.rule)) {
                $scope.userFilter.rule += '' + colVal;
              } else {
                var ruleGrain = $scope.userFilter.rule.split(' ');
                if (ruleGrain.length === 1) {
                  $scope.userFilter.rule = colVal;
                } else {
                  if (_bdd.util.isRuleOp(ruleGrain[ruleGrain.length - 2])) {
                    $scope.userFilter.rule += ' AND ' + colVal;
                  } else {
                    var tempRuleGrain = $scope.userFilter.rule.split(' AND ');
                    tempRuleGrain[tempRuleGrain.length - 1] = colVal;
                    $scope.userFilter.rule = tempRuleGrain.join(' AND ');
                  }
                }
              }
            } else {
              $scope.userFilter.rule = colVal;
            }
            $scope.userFilter.selectedDataType = e.srcType;
          }
        });
      }
    }),
    ruleGridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      enableFiltering: false,
      data: 'userFilter.ruleList',
      columnDefs: [
        { name: 'rule', displayName: '規則清單(規則間以OR串聯)' },
        { name: 'op', displayName: '操作', width: 100,
          cellTemplate:
            '<div class="ui-grid-cell-contents btn-group">' +
              '<button type="button" class="btn btn-danger btn-xs" bs-tooltip="tooltip" data-title="刪除" ng-click="getExternalScopes().delRule(row)">' +
                '<span class="glyphicon glyphicon-remove">' +
              '</button>' +
            '</div>'
        }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.selected) {

          }
        });
      }
    }),
    show: function () {
      var filterCols = [];
      this.modal = $modal({
        template: 'userFilterModal',
        show: false,
        scope: $scope
      });
      this.modal.$promise.then(this.modal.show);
      $.each($scope.src.list, function (i, v) {
        $.each($scope.target.list, function (i2, v2) {
          if (v.id.srcTable === v2.table && v.id.srcColumn === v2.colId) {
            filterCols.push(v);
          }
        });
      });
      $scope.userFilter.colList = filterCols;
    },
    op: function ($event) {
      if ($scope.userFilter.rule) {
        var opSign = $event.target.textContent;
        if (_bdd.util.isRuleOp($scope.userFilter.rule)) {
          var op_rules = $scope.userFilter.rule.split(' ');
          op_rules[op_rules.length - 1] = opSign;
          $scope.userFilter.rule = op_rules.join(' ');
        } else {
          var op_tempRuleGrain = $scope.userFilter.rule.split(' AND '),
              op_lastRule = op_tempRuleGrain[op_tempRuleGrain.length - 1].split(' ');
          if (op_lastRule.length === 1) $scope.userFilter.rule += ' ' + opSign;
        }
      } else {
        $scope.msg('info', '請選擇欄位運算元！');
      }
    },
    fillOpd: function () {
      if (_bdd.util.isRuleOp($scope.userFilter.rule)) {
        var isInOpd = $scope.userFilter.rule.slice(-2) === 'in';
        if (_bdd.util.isStrDataType($scope.userFilter.selectedDataType)) {
          if (isInOpd) {
            var inputStrReal = '(',
                inputStrGrain = $scope.userFilter.input.split(',');
            $.each(inputStrGrain, function (i, v) {
              inputStrReal += "'" + v.trim() + "',";
            });
            inputStrReal = inputStrReal.slice(0, -1) + ')';
            $scope.userFilter.rule += ' ' + inputStrReal;
          } else {
            $scope.userFilter.rule += " '" + $scope.userFilter.input + "'";
          }
        } else {
          if (isInOpd) {
            var hasInvalidNum = false,
                inputNumReal = '(',
                inputNumGrain = $scope.userFilter.input.split(',');
            $.each(inputNumGrain, function (i, v) {
              if ($.isNumeric(v)) {
                inputNumReal += v.trim() + ",";
              } else {
                hasInvalidNum = true;
              }
            });
            inputNumReal = inputNumReal.slice(0, -1) + ')';
            if (hasInvalidNum) $scope.msg('info', '請於\",\"間輸入有效的數字！');
            else $scope.userFilter.rule += ' ' + inputNumReal;
          } else {
            if ($.isNumeric($scope.userFilter.input)) $scope.userFilter.rule += ' ' + $scope.userFilter.input;
            else $scope.msg('info', '請輸入有效的數字！');
          }
        }
      } else {
        $scope.msg('info', '請選擇欄位運算元！');
      }
    },
    clearRule: function () {
      $scope.userFilter.rule = '';
    },
    addRule: function () {
      var ruleVal = $scope.userFilter.rule;
      if (_bdd.util.isInvalidRule(ruleVal) || _bdd.util.isRuleOp(ruleVal)) {
        $scope.msg('info', '無效的運算式！');
      } else {
        var ruleObj = {rule: ruleVal.split('AND').length > 1 ? '(' + ruleVal + ')' : ruleVal};
        $scope.userFilter.ruleList.push(ruleObj);
      }
    },
    delRule: function (row) {
      var index = $scope.userFilter.ruleList.indexOf(row.entity);
      $scope.userFilter.ruleList.splice(index, 1);
    },
    getRules: function () {
      return $scope.userFilter.ruleList;
    }
  };

  $scope.essential = {
    modal: {},
    selectedDataType: '',
    colList: [],
    ruleList: [],
    colGridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      data: 'essential.colList',
      columnDefs: [
        { name: 'id.srcTable', displayName: '表格', width: 150 },
        { name: 'id.srcColumn', displayName: '欄位ID', width: 150 },
        { name: 'alias', displayName: '欄位名稱', width: 150 },
        { name: 'srcType', displayName: '資料型態', width: 100 },
        { name: 'srcSize', displayName: '資料長度', visible: false },
        { name: 'formula', displayName: '自定義公式' }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var e = row.entity,
                formula = e.formula,
                colVal = formula ? formula : e.id.srcTable + '.' + e.id.srcColumn;
            if ($scope.essential.rule) {
              if (_bdd.util.isRuleOp($scope.essential.rule)) {
                $scope.essential.rule += '' + colVal;
              } else {
                var ruleGrain = $scope.essential.rule.split(' ');
                if (ruleGrain.length === 1) {
                  $scope.essential.rule = colVal;
                } else {
                  if (_bdd.util.isRuleOp(ruleGrain[ruleGrain.length - 2])) {
                    $scope.essential.rule += ' AND ' + colVal;
                  } else {
                    var tempRuleGrain = $scope.essential.rule.split(' AND ');
                    tempRuleGrain[tempRuleGrain.length - 1] = colVal;
                    $scope.essential.rule = tempRuleGrain.join(' AND ');
                  }
                }
              }
            } else {
              $scope.essential.rule = colVal;
            }
            $scope.essential.selectedDataType = e.srcType;
          }
        });
      }
    }),
    ruleGridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      enableFiltering: false,
      data: 'essential.ruleList',
      columnDefs: [
        { name: 'rule', displayName: '規則清單(規則間以OR串聯)' },
        { name: 'op', displayName: '操作', width: 100,
          cellTemplate:
            '<div class="ui-grid-cell-contents btn-group">' +
              '<button type="button" class="btn btn-danger btn-xs" bs-tooltip="tooltip" data-title="刪除" ng-click="getExternalScopes().delRule(row)">' +
                '<span class="glyphicon glyphicon-remove">' +
              '</button>' +
            '</div>'
        }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {

        });
      }
    }),
    show: function () {
      var self = this;
      self.modal = $modal({
        template: 'essentialModal',
        show: false,
        scope: $scope
      });
      $scope.essential.colList = $scope.src.list;
      self.modal.$promise.then(self.modal.show);
    },
    op: function ($event) {
      if ($scope.essential.rule) {
        var opSign = $event.target.textContent;
        if (_bdd.util.isRuleOp($scope.essential.rule)) {
          var op_rules = $scope.essential.rule.split(' ');
          op_rules[op_rules.length - 1] = opSign;
          $scope.essential.rule = op_rules.join(' ');
        } else {
          var op_tempRuleGrain = $scope.essential.rule.split(' AND '),
              op_lastRule = op_tempRuleGrain[op_tempRuleGrain.length - 1].split(' ');
          if (op_lastRule.length === 1) $scope.essential.rule += ' ' + opSign;
        }
      } else {
        $scope.msg('info', '請選擇欄位運算元！');
      }
    },
    fillOpd: function () {
      if (_bdd.util.isRuleOp($scope.essential.rule)) {
        var isInOpd = $scope.essential.rule.slice(-2) === 'in';
        if (_bdd.util.isStrDataType($scope.essential.selectedDataType)) {
          if (isInOpd) {
            var inputStrReal = '(',
                inputStrGrain = $scope.essential.input.split(',');
            $.each(inputStrGrain, function (i, v) {
              inputStrReal += "'" + v.trim() + "',";
            });
            inputStrReal = inputStrReal.slice(0, -1) + ')';
            $scope.essential.rule += ' ' + inputStrReal;
          } else {
            $scope.essential.rule += " '" + $scope.essential.input + "'";
          }
        } else {
          if (isInOpd) {
            var hasInvalidNum = false,
                inputNumReal = '(',
                inputNumGrain = $scope.essential.input.split(',');
            $.each(inputNumGrain, function (i, v) {
              if ($.isNumeric(v)) {
                inputNumReal += v.trim() + ",";
              } else {
                hasInvalidNum = true;
              }
            });
            inputNumReal = inputNumReal.slice(0, -1) + ')';
            if (hasInvalidNum) $scope.msg('info', '請於\",\"間輸入有效的數字！');
            else $scope.essential.rule += ' ' + inputNumReal;
          } else {
            if ($.isNumeric($scope.essential.input)) $scope.essential.rule += ' ' + $scope.essential.input;
            else $scope.msg('info', '請輸入有效的數字！');
          }
        }
      } else {
        $scope.msg('info', '請選擇欄位運算元！');
      }
    },
    clearRule: function () {
      $scope.essential.rule = '';
    },
    addRule: function () {
      var ruleVal = $scope.essential.rule;
      if (_bdd.util.isInvalidRule(ruleVal) || _bdd.util.isRuleOp(ruleVal)) {
        $scope.msg('info', '無效的運算式！');
      } else {
        var ruleObj = {rule: ruleVal.split('AND').length > 1 ? '(' + ruleVal + ')' : ruleVal};
        $scope.essential.ruleList.push(ruleObj);
      }
    },
    delRule: function (row) {
      var index = $scope.essential.ruleList.indexOf(row.entity);
      $scope.essential.ruleList.splice(index, 1);
    },
    getRules: function () {
      var rules = [];
      if ($scope.essential.ruleList) {
        $.each($scope.essential.ruleList, function (i, v) {
          rules.push(v.rule);
        });
      }
      if ($scope.userFilter.ruleList) {
        $.each($scope.userFilter.ruleList, function (i, v) {
          rules.push(v.rule);
        });
      }
      return rules;
    }
  };

  $scope.activeDataCom = {
    comId: '',
    comTitle: '',
    dsId: '',
    schemaId: '',
    setDefault: function () {
      this.comId = '';
      this.comTitle = '';
    },
    hasDS: function () {
      return !!this.dsId && !!this.schemaId;
    }
  };

//  $scope.$on('query.hide', function (event) {
//    $scope.query.modal.$element.remove();
//  });

  $scope.query = {
    modal: {},
    list: [],
    selectedRow: '',
    gridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      data: 'query.list',
      columnDefs: [
        { name: 'comid', displayName: '資料元件ID' },
        { name: 'comtitle', displayName: '元件名稱' },
        { name: 'createemp', displayName: '建立者' },
        { name: 'updateemp', displayName: '最後更新者' },
        { name: 'updatedate', displayName: '更新日期' },
        { name: 'updatetime', displayName: '更新時間' },
        { name: 'op', displayName: '操作',
          cellTemplate:
            '<div class="ui-grid-cell-contents btn-group">' +
              '<button type="button" class="btn btn-danger btn-xs" bs-tooltip="tooltip" data-title="刪除" ng-click="getExternalScopes().del(row)">' +
                '<span class="glyphicon glyphicon-remove">' +
              '</button>' +
            '</div>',
          enableFiltering: false
        }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            $scope.query.selectedRow = row.entity;
          }
        });
      }
    }),
    show: function () {
      this.selectedRow = '';
      this.list = [];
      this.modal = $modal({
        template: 'queryModal',
        show: false,
        scope: $scope,
        prefixEvent: 'query'
      });
      this.modal.$promise.then(this.modal.show);
    },
    queryByCD: function () {
      $scope.query.list = [];
      $icscRest.post('bdd/dataCom/queryByCD', {title: $scope.query.title, domain: $scope.domainOpts.selected, keyword: $scope.keywordOpts.selected}).success(function (data, status, headers) {
        $scope.query.list = data;
        $scope.msg('success', '查詢成功!!');
      });
    },
    del: function (row) {
      $icscRest.post('bdd/dataCom/delete', {comId: row.entity.comId}).success(function (data, status, headers) {
        var index = $scope.query.list.indexOf(row.entity);
        $scope.query.list.splice(index, 1);
        $scope.msg('success', '刪除成功!!');
      });
    },
    reface: function () {
      var row = this.selectedRow;
      $scope.clear();
      if (row) {
        $scope.activeDataCom.comId = row.comid;
        $scope.activeDataCom.comTitle = row.comtitle;
        $scope.activeDataCom.dsId = row.dsid;
        $scope.activeDataCom.schemaId = row.schemaid;
        // definition col
        var defCol = $.parseJSON(row.defcol);
        if (defCol && defCol.length > 0) {
          $scope.src.defCol = defCol;
          $scope.src.list = defCol;
        }
        // src
        var tables = $.parseJSON(row.tableid);
        if (tables && tables.length > 0) {
          $scope.src.tables = tables;
          var tables_copy = angular.copy(tables);
          $scope.$broadcast('reface:getColumn', tables_copy);
        }
        var relations = $.parseJSON(row.relation);
        if (relations && relations.length > 0) $scope.relation.selectedItems = relations;
        // target
        var limitCol = $.parseJSON(row.limitcol);
        if (limitCol && limitCol.length > 0) $scope.target.list = limitCol;
        // essential
        var essential = $.parseJSON(row.essential);
        if (essential && essential.length > 0) $scope.essential.ruleList = essential;

        this.modal.hide();
        $scope.msg('success', row.comtitle + '資料元件已開啟！');
        $scope.$broadcast('reface:done');
      }
    }
  };

  $scope.save = {
    modal: $modal({
      template: 'saveModal',
      show: false,
      scope: $scope
    }),
    show: function () {
      this.modal.show();
    },
    params: function () {
      var comId = $scope.activeDataCom.comId || '' + Date.now(),
          ts = new Date(Number(comId)),
          date = _bdd.util.getDateStr(ts),
          time = _bdd.util.getHMSTimeStr(ts);
      return {
        comId: comId,
        comTitle: $scope.activeDataCom.comTitle,
        dsId: $scope.activeDataCom.dsId,
        schemaId: $scope.activeDataCom.schemaId,
        tableId: $scope.src.tables,
        relation: $scope.relation.selectedItems,
        essential: $scope.essential.ruleList,
        filter: '',
        orderBy: '',
        defCol: $scope.src.defCol,
        limitCol: $scope.target.list,
        uniqueCol: [],
        domains: $scope.domainOpts.selected,
        keywords: $scope.keywordOpts.selected,
        memo: '',
        isValid: 'Y',
        updateDate: date,
        updateTime: time
      };
    },
    save: function () {
      $icscRest.post('bdd/dataCom/save', $scope.save.params()).success(function (data, status, headers) {
        $scope.save.modal.hide();
        $scope.msg('success', '儲存成功!!');
      });
    },
    saveAs: function () {

    }
  };

  $scope.clear = function () {
    $scope.activeDataCom.setDefault();
    $scope.src.list = [];
    $scope.src.tables = [];
    $scope.target.list = [];
    $scope.relation.selectedItems = [];
    $scope.essential.rule = '';
    $scope.essential.input = '';
    $scope.essential.ruleList = [];
    $scope.orderBy.rule = '';
    $scope.orderBy.ruleList = [];
    $scope.userFilter.rule = '';
    $scope.userFilter.input = '';
    $scope.userFilter.ruleList = [];
  };

  $scope.genAssistor = function (inputType, colId, table, srcType, formula) {
    var tp = '',
        col = formula ? formula : table + '.' + colId,
        it = inputType.toLowerCase();
    if (it === 'date') {
      tp =
        '<span title="日期輔助輸入" class="input-group-addon" data-bdd-form-active="' + colId + '" data-bdd-assistor="' + inputType + '" ng-click="advDatePicker.show($event)">' +
          '<span class="glyphicon glyphicon-calendar"></span>' +
        '</span>' +
        '<input type="text" class="form-control" placeholder="請挑選日期" data-aqc="' + col + '" data-src-type="' + srcType + '" ng-model="advQueryPane.form.' + colId + '">';
    } else if (it === 'time') {
      tp =
        '<span title="時間輔助輸入" class="input-group-addon" data-bdd-form-active="' + colId + '" data-bdd-assistor="' + inputType + '" ng-click="advTimePicker.show($event)">' +
          '<span class="glyphicon glyphicon-time"></span>' +
        '</span>' +
        '<input type="text" class="form-control" placeholder="請挑選時間" data-aqc="' + col + '" data-src-type="' + srcType + '" ng-model="advQueryPane.form.' + colId + '">';
    } else if (it === 'input') {
      tp = '<input type="text" class="form-control" placeholder="請輸入資料" data-aqc="' + col + '" data-src-type="' + srcType + '" ng-model="advQueryPane.form.' + colId + '">';
    } else {
      tp =
        '<span title="資料輔助輸入" class="input-group-addon" data-bdd-form-active="' + colId + '" data-bdd-assistor="' + inputType + '" ng-click="assistor.show($event)">' +
          '<span class="glyphicon glyphicon-filter"></span>' +
        '</span>' +
        '<input type="text" class="form-control" placeholder="請挑選' + inputType + '值" data-aqc="' + col + '" data-src-type="' + srcType + '" ng-model="advQueryPane.form.' + colId + '">';
    }
    return tp;
  };

  $scope.genForm = function (cols) {
    var c = '<div id="bdd-adv-query-form" role="form">';
    $.each(cols, function (i, v) {
      if (v.isUK !== 3) {
        c +=
          '<div class="form-group col-lg-12">' +
            '<label for="bdd-aq-filter-col-' + i + '" class="control-label">' + v.colName + '(' + v.colId + ')</label>' +
            '<div class="input-group">' +
              $scope.genAssistor(v.inputType, v.colId, v.table, v.srcType, v.formula) +
              '<span class="input-group-addon" title="清空輸入值" data-aqc-id="' + v.colId + '" ng-click="advQueryPane.removeInput($event)">' +
                '<span class="glyphicon glyphicon-remove" data-aqc-id="' + v.colId + '"></span>' +
              '</span>' +
            '</div>' +
          '</div>';
      }
    });
    return c + '</div>';
  };

  $scope.genCondition = function () {
    var condition = [],
        aqc = $('#bdd-adv-query-form').find('input');
    $.each(aqc, function (i1, v1) {
      var $temp = $(v1),
          tVal = $temp.val(),
          aqcVal = $temp.data('aqc');
      if (tVal) {
        var ts = tVal.split(','),
            wrap = _bdd.util.isStrDataType($temp.data('src-type')) ? "'" : "";
        if (ts.length === 1) {
          var tsr = ts[0].split('~');
          if (tsr.length === 1) condition.push(aqcVal + " = " + wrap + $temp.val() + wrap);
          else condition.push(aqcVal + " BETWEEN " + wrap + tsr[0] + wrap + " AND " + wrap + tsr[1] + wrap);
        } else {
          var orStr = '', orList = [],
              inCond = aqcVal + " IN (";
          $.each(ts, function (i2, v2) {
            var tsr2 = v2.split('~');
            if (tsr2.length === 1) inCond += wrap + v2 + wrap + ",";
            else orList.push(aqcVal + " BETWEEN " + wrap + tsr2[0] + wrap + " AND " + wrap + tsr2[1] + wrap);
          });
          orList.push(inCond.slice(0, -1) + ")");
          $.each(orList, function (i3, v3) {
            orStr += v3 + ' OR ';
          });
          condition.push('(' + orStr.slice(0, -4) + ')');
        }
      }
    });
    return condition;
  };

  $scope.advQueryPane = {
    modal: {},
    selectedItem: {},
    form: {
      active: ''
    },
    rptList: [],
    rptTotal: 0,
    uniList: [],
    uniTotal: 0,
    rowNum: 2000,
    msg: '',
    getData: function (data, page) {
      var res = [];
      for (var i = 0; i < page * 1000 && i < data.length; ++i) {
        res.push(data[i]);
      }
      return res;
    },
    rptGridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      data: 'advQueryPane.rptList'
    }),
    uniGridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      data: 'advQueryPane.uniList'
    }),
    show: function () {
      var self = this,
          cols = $scope.target.list,
          form = $scope.genForm(cols),
          elm = angular.element(form);
      self.modal = $modal({
        template: 'advQueryModal',
        show: false,
        scope: $scope
      });
      $compile(elm)($scope);
      self.modal.$promise.then(function () {
        self.modal.show();
        self.modal.$element.find('#bdd-aq-filter .panel-body').prepend(elm);
      });
    },
    params: {
      get: function (type) {
        return {
          type: type,
          dsId: $scope.activeDataCom.dsId,
          schemaId: $scope.activeDataCom.schemaId,
          table: $scope.src.tables[0],
          relation: $scope.relation.selectedItems,
          limitCol: $scope.target.list,
          where: $scope.essential.getRules().concat($scope.genCondition()),
          orderBy: $scope.orderBy.get()
        };
      }
    },
    getReportData: function () {
      var colDefs = [],
          cols = $scope.target.list;
      $.each(cols, function (i, v) {
        var cellStyle = '',
            row = {
              name: v.colId.toLowerCase(),
              displayName: v.colName
            };
        if (v.srcType && !_bdd.util.isStrDataType(v.srcType)) cellStyle = 'ui-grid-number-cell';
        if (i === cols.length - 1) cellStyle += ' ui-grid-number-rightmost-cell';
        if (cellStyle) row.cellClass = cellStyle;
        colDefs.push(row);
      });
      $scope.advQueryPane.msg = '';
      $scope.advQueryPane.rptTotal = 0;
      $scope.advQueryPane.rptList = [];
      $scope.advQueryPane.rptGridOpts.columnDefs = colDefs;
      $icscRest.post('bdd/dataCom/getLimitColRS', this.params.get('LC')).success(function (rs) {
        $scope.advQueryPane.rptList = rs.data;
        $scope.advQueryPane.rptTotal = rs.total;
        if (rs.total > $scope.advQueryPane.rowNum) $scope.advQueryPane.msg = ' (只顯示前' + $scope.advQueryPane.rowNum + '筆，匯出Excel可查閱全部資料)';
      });
    },
    getUniqueData: function () {
      var colDefs = [],
          cols = $scope.target.list;
      $.each(cols, function (i, v) {
        if (v.isUK === 1) {
          var cellStyle = '',
              row = {
                name: v.colId.toLowerCase(),
                displayName: v.colName
              };
          if (v.srcType && !_bdd.util.isStrDataType(v.srcType)) cellStyle = 'ui-grid-number-cell';
          if (i === cols.length - 1) cellStyle += ' ui-grid-number-rightmost-cell';
          if (cellStyle) row.cellClass = cellStyle;
          colDefs.push(row);
        }
      });
      $scope.advQueryPane.msg = '';
      $scope.advQueryPane.uniTotal = 0;
      $scope.advQueryPane.uniList = [];
      $scope.advQueryPane.uniGridOpts.columnDefs = colDefs;
      $icscRest.post('bdd/dataCom/getLimitColRS', this.params.get('UC')).success(function (rs) {
        $scope.advQueryPane.uniList = rs.data;
        $scope.advQueryPane.uniTotal = rs.total;
        if (rs.total > $scope.advQueryPane.rowNum) $scope.advQueryPane.msg = ' (只顯示前' + $scope.advQueryPane.rowNum + '筆)';
      });
    },
    removeInput: function ($event) {
      var colId = $($event.target).data('aqc-id');
      $scope.advQueryPane.form[colId] = '';
    },
    export: function () {
      $icscRest.post('bdd/exportExcel/save', this.params.get('LC')).success(function (data) {
        $("<iframe/>").attr({
          src: 'http://' + location.host + '/erp/rest/bdd/exportExcel/download/' + data.fileName,
          style: "visibility:hidden;display:none"
        }).appendTo('body');
      });
    }
  };

  $scope.advDatePicker = {
    modal: {},
    format: 'yyyyMMdd',
    inputModel: '',
    show: function ($event) {
      var self = this,
          currentTarget = $event.currentTarget,
          $currentTarget = $(currentTarget),
          top = $currentTarget.offset().top + currentTarget.offsetHeight,
          left = $currentTarget.offset().left,
          dsEle = angular.element('<datepicker ng-model="advDatePicker.default" ng-click="advDatePicker.roller()" min-date="minDate" show-weeks="false"></datepicker>');
      self.inputModel = $currentTarget.next().attr("ng-model").split('.').slice(-1)[0];
      self.modal = $modal({
        template: 'advDatePickerModal',
        backdrop: 'static',
        show: false,
        scope: $scope
      });
      $compile(dsEle)($scope);
      self.modal.$promise.then(function () {
        self.modal.show();
        self.modal.$element.find('.modal-body').append(dsEle);
        self.modal.$element.find('.modal-dialog').offset({top: top, left: left});
      });
    },
    roller: function () {
      var dateStr = $scope.advDatePicker.default ? _bdd.util.getDateStr($scope.advDatePicker.default) : '',
          currentInput = $scope.advDatePicker.inputModel,
          existing = $scope.advQueryPane.form[currentInput];
      if (existing) {
        if (existing.indexOf(dateStr) === -1) {
          if (existing.slice(-1) === '~') $scope.advQueryPane.form[currentInput] += dateStr;
          else $scope.advQueryPane.form[currentInput] += ',' + dateStr;
        }
      } else {
        $scope.advQueryPane.form[currentInput] = dateStr;
      }
    },
    setSymbol: function () {
      var currentInput = $scope.advDatePicker.inputModel,
          existing = $scope.advQueryPane.form[currentInput];
      if (existing && existing.slice(-1) !== '~') {
        $scope.advQueryPane.form[currentInput] += '~';
      }
    }
  };

  $scope.advTimePicker = {
    modal: {},
    inputModel: '',
    show: function ($event) {
      var self = this,
          currentTarget = $event.currentTarget,
          $currentTarget = $(currentTarget),
          top = $currentTarget.offset().top + currentTarget.offsetHeight,
          left = $currentTarget.offset().left,
          dsEle = angular.element('<timepicker ng-model="advTimePicker.default" hour-step="1" minute-step="15" show-meridian="false"></timepicker>');
      $scope.advTimePicker.default = new Date();
      self.inputModel = $currentTarget.next().attr("ng-model").split('.').slice(-1)[0];
      self.modal = $modal({
        template: 'advTimePickerModal',
        backdrop: 'static',
        show: false,
        scope: $scope
      });
      $compile(dsEle)($scope);
      self.modal.$promise.then(function () {
        self.modal.show();
        self.modal.$element.find('.modal-body').append(dsEle);
        self.modal.$element.find('.modal-dialog').offset({top: top, left: left});
      });
    },
    roller: function () {
      var timeStr = _bdd.util.getHMTimeStr($scope.advTimePicker.default),
          currentInput = $scope.advTimePicker.inputModel,
          existing = $scope.advQueryPane.form[currentInput];
      if (existing) {
        if (existing.indexOf(timeStr) === -1) {
          if (existing.slice(-1) === '~') $scope.advQueryPane.form[currentInput] += timeStr;
          else $scope.advQueryPane.form[currentInput] += ',' + timeStr;
        }
      } else {
        $scope.advQueryPane.form[currentInput] = timeStr;
      }
    },
    setSymbol: function () {
      var currentInput = $scope.advTimePicker.inputModel,
          existing = $scope.advQueryPane.form[currentInput];
      if (existing && existing.slice(-1) !== '~') {
        $scope.advQueryPane.form[currentInput] += '~';
      }
    }
  };

  $dmaService.assistQuery.getAssistQueryList().success(function (data, status, headers) {
    $scope.assist.list = $scope.assist.list.concat(data);
  });

  $scope.domainOpts = {
    opts: [
      {value: '-1', label: '請選擇'},
      {value: 'S', label: 'S-銷售'},
      {value: 'T', label: 'T-質量'},
      {value: 'I', label: 'I-存貨'},
      {value: 'M', label: 'M-採購'},
      {value: 'A', label: 'A-財會'}
    ],
    selected: "-1"
  };

  $scope.keywordOpts = {
    opts: [
      {value: '-1', label: '請選擇'},
      {value: '1', label: '結算'},
      {value: '2', label: '訂單'},
      {value: '3', label: '價格'},
      {value: '4', label: '質量'},
      {value: '5', label: '化物性'},
      {value: '6', label: '元素'},
      {value: '7', label: '檢測'},
      {value: '8', label: '試驗'},
      {value: '9', label: '產品'}
    ],
    selected: "-1"
  };

});