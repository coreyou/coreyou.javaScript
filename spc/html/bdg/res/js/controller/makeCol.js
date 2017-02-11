angular.module('bdgApp').controller('makeColCtrl', function ($scope, $icscModal, $http, uiGridConstants) {
  'use strict';

  $scope.makeNumCol = {
    modal: {},
    rule: '',
    subRule: '',
    row: '',
    colList: [],
    ruleList: [],
    colGridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      data: 'makeNumCol.colList',
      columnDefs: [
        { name: 'table', displayName: '表格', filter: { condition: uiGridConstants.filter.CONTAINS } },
        { name: 'colId', displayName: '欄位ID', filter: { condition: uiGridConstants.filter.CONTAINS } },
        { name: 'title', displayName: '欄位名稱', filter: { condition: uiGridConstants.filter.CONTAINS } },
        { name: 'type', displayName: '資料型態', filter: { condition: uiGridConstants.filter.CONTAINS } },
        { name: 'size', displayName: '資料長度', filter: { condition: uiGridConstants.filter.CONTAINS } }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var e = row.entity,
                colVal = e.table + '.' + e.colId;
            if (_bdg.util.isOp($scope.makeNumCol.subRule.toString().slice(-1))) {
              $scope.makeNumCol.subRule = $scope.makeNumCol.subRule + colVal;
            } else {
              $scope.makeNumCol.subRule = colVal;
            }
            $scope.makeNumCol.row = e;
          }
        });
      }
    }),
    ruleGridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      enableFiltering: false,
      data: 'makeNumCol.ruleList',
      columnDefs: [
        { name: 'rule', displayName: '子公式清單', filter: { condition: uiGridConstants.filter.CONTAINS } },
        { name: 'op', displayName: '操作', width: 100,
          cellTemplate:
            '<div class="ui-grid-cell-contents btn-group">' +
              '<button type="button" class="btn btn-danger btn-xs" bs-tooltip="tooltip" data-title="刪除" ng-click="getExternalScopes().delSubRule(row)">' +
                '<span class="glyphicon glyphicon-remove">' +
              '</button>' +
            '</div>'
        }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var e = row.entity;
            $scope.makeNumCol.subRule = '(' + e.rule + ')';
          }
        });
      }
    }),
    show: function () {
      var filterCols = [],
          srcList = $scope.src.list;
      this.modal = $icscModal({
        template: 'makeNumColModal',
        show: false,
        scope: $scope
      });
      this.modal.show();
      $.each(srcList, function (i, v) {
        if (!_bdg.util.isStrDataType(v.type) && v.table){
          filterCols.push(v);
        }
      });
      $scope.makeNumCol.colList = filterCols;
    },
    op: function (op) {
      var subVal = $scope.makeNumCol.subRule;
      if (subVal) {
        if (_bdg.util.isOp(subVal.slice(-1))) {
          $scope.makeNumCol.subRule = subVal.slice(0, -1) + op;
        } else {
          $scope.makeNumCol.subRule = subVal + op;
        }
      } else {
        $scope.msg('info', '請先選擇欄位運算元！');
      }
    },
    func: function (func) {
      var subVal = $scope.makeNumCol.subRule;
      if (subVal) {
        if ("COUNT_ALL" === func) $scope.makeNumCol.subRule = 'COUNT(*)';
        else $scope.makeNumCol.subRule = func + '(' + subVal + ')';
      } else {
        $scope.msg('info', '請先輸入子公式！');
      }
    },
    fillOpd: function () {
      var subVal = $scope.makeNumCol.subRule,
          inputVal = $scope.makeNumCol.input;
      if (subVal) {
        if (_bdg.util.isOp(subVal.toString().slice(-1))) {
          if (angular.isNumber(inputVal)) $scope.makeNumCol.subRule = subVal + ~~inputVal;
          else $scope.msg('info', '請輸入數字運算元！');
        } else $scope.msg('info', '請選擇欄位運算子！');
      } else $scope.msg('info', '請先選擇欄位運算元！');
    },
    clearSubRule: function () {
      $scope.makeNumCol.subRule = '';
    },
    clearRule: function () {
      $scope.makeNumCol.rule = '';
    },
    addSubRule: function () {
      var subVal = $scope.makeNumCol.subRule.trim();
      if (subVal && !_bdg.util.isOp(subVal.toString().slice(-1))) {
        $scope.makeNumCol.ruleList.push({rule: subVal});
      } else $scope.msg('info', '子公式不完整！');
    },
    delSubRule: function (row) {
      var index = $scope.makeNumCol.ruleList.indexOf(row.entity);
      $scope.makeNumCol.ruleList.splice(index, 1);
    },
    setRule: function () {
      var subVal = $scope.makeNumCol.subRule.trim();
      if (subVal && !_bdg.util.isOp(subVal.toString().slice(-1))) {
        $scope.makeNumCol.rule = subVal;
      } else $scope.msg('info', '子公式不完整！');
    },
    addDefCol: function () {
      debugger;
      var colId = $scope.makeNumCol.colId,
          colName =  $scope.makeNumCol.colName,
          isDuplicated = false;
      if ($scope.makeNumCol.colId && $scope.makeNumCol.colName && $scope.makeNumCol.rule) {
        $.each($scope.src.list, function (i, v) {
          if (v.colId === colId) {
            isDuplicated = true;
            return false;
          }
        });
        if (!isDuplicated) {
          var row = $scope.makeNumCol.row;
          if (row) {
            var col = {
              colId: $scope.makeNumCol.colId,
              title: $scope.makeNumCol.colName,
              type: 'number',
              formula: $scope.makeNumCol.rule
            };
            $scope.src.list.unshift(col);
            $scope.src.defCol.push(col);
            $scope.makeNumCol.modal.hide();
            $scope.msg('success', '新增欄位成功!!');
          } else $scope.msg('danger', '欄位資料錯誤！');
        }else $scope.msg('danger', '欄位ID已存在！');
      } else $scope.msg('danger', '請輸入欄位ID、名稱、與總公式！');
    }
  };

  $scope.makeStrCol = {
    modal: {},
    rule: '',
    subRule: '',
    row: '',
    colList: [],
    colGridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      data: 'makeStrCol.colList',
      columnDefs: [
        { name: 'table', displayName: '表格', filter: { condition: uiGridConstants.filter.CONTAINS } },
        { name: 'colId', displayName: '欄位ID', filter: { condition: uiGridConstants.filter.CONTAINS } },
        { name: 'title', displayName: '欄位名稱', filter: { condition: uiGridConstants.filter.CONTAINS } },
        { name: 'type', displayName: '資料型態', filter: { condition: uiGridConstants.filter.CONTAINS } },
        { name: 'size', displayName: '資料長度', filter: { condition: uiGridConstants.filter.CONTAINS } }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var e = row.entity,
                length = e.size,
                colVal = e.table + '.' + e.colId;
            $scope.makeStrCol.subRule = 'SUBSTR(' + colVal + ',1,' + length + ')';
            $scope.makeStrCol.pos = 1;
            $scope.makeStrCol.length = length;
            $scope.makeStrCol.row = e;
          }
        });
      }
    }),
    show: function () {
      var filterCols = [],
          srcList = $scope.src.list;
      this.modal = $icscModal({
        template: 'makeStrColModal',
        show: false,
        scope: $scope
      });
      this.modal.show();
      $.each(srcList, function (i, v) {
        if (_bdg.util.isStrDataType(v.type) && v.table) filterCols.push(v);
      });
      $scope.makeStrCol.colList = filterCols;
    },
    posLength: function (type) {
      var subVal = $scope.makeStrCol.subRule,
          row = $scope.makeStrCol.row,
          colVal = row.id.tableId + '.' + row.id.columnId,
          pos = ~~$scope.makeStrCol.pos,
          length = ~~$scope.makeStrCol.length,
          reg = /\(.*?\)/;
      if ("pos" === type) {
        if (pos === 0) {
          $scope.makeStrCol.pos = 1;
          $scope.makeStrCol.subRule = subVal.replace(reg, "(" + colVal + "," + 1 + "," + length + ")");
        } else {
          $scope.makeStrCol.subRule = subVal.replace(reg, "(" + colVal + "," + pos + "," + length + ")");
        }
      } else {
        if (length === 0) {
          $scope.makeStrCol.length = 1;
          $scope.makeStrCol.subRule = subVal.replace(reg, "(" + colVal + "," + pos + "," + 1 + ")");
        } else {
          $scope.makeStrCol.subRule = subVal.replace(reg, "(" + colVal + "," + pos + "," + length + ")");
        }
      }
    },
    clearSubRule: function () {
      $scope.makeStrCol.subRule = '';
    },
    clearRule: function () {
      $scope.makeStrCol.rule = '';
    },
    setRule: function () {
      var subVal = $scope.makeStrCol.subRule.trim();
      if (subVal) {
        var origin = $scope.makeStrCol.rule;
        if (origin) $scope.makeStrCol.rule = origin + '+' + subVal;
        else $scope.makeStrCol.rule =  subVal;
      }
    },
    addDefCol: function () {
      debugger;
      var colId = $scope.makeStrCol.colId,
          colName =  $scope.makeStrCol.colName,
          isDuplicated = false;
      if ($scope.makeStrCol.colId && $scope.makeStrCol.colName && $scope.makeStrCol.rule) {
        $.each($scope.src.list, function (i, v) {
          if (v.colId === colId) {
            isDuplicated = true;
            return false;
          }
        });
        if (!isDuplicated) {
          var row = $scope.makeStrCol.row;
          if (row) {
            var col = {
              colId: $scope.makeStrCol.colId,
              title: $scope.makeStrCol.colName,
              type: 'string',
              formula: $scope.makeStrCol.rule
            };
            $scope.src.list.unshift(col);
            $scope.src.defCol.push(col);
            $scope.makeStrCol.modal.hide();
            $scope.msg('success', '新增欄位成功!!');
          } else $scope.msg('danger', '欄位資料錯誤！');
        }else $scope.msg('danger', '欄位ID已存在！');
      } else $scope.msg('danger', '請輸入欄位ID、名稱、與總公式！');
    }
  };

});