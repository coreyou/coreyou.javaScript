angular.module('bddApp').controller('makeColCtrl', function ($scope, $http, $icscRest, $modal, $alert, $compile, $dmaService) {
  'use strict';

  $scope.makeNumCol = {
    modal: {},
    rule: '',
    subRule: '',
    row: '',
    colList: [],
    ruleList: [],
    colGridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      data: 'makeNumCol.colList',
      columnDefs: [
        { name: 'id.srcTable', displayName: '表格' },
        { name: 'id.srcColumn', displayName: '欄位ID' },
        { name: 'alias', displayName: '欄位名稱' },
        { name: 'srcType', displayName: '資料型態' },
        { name: 'srcSize', displayName: '資料長度' }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var e = row.entity,
                colVal = e.id.srcTable + '.' + e.id.srcColumn;
            if (_bdd.util.isOp($scope.makeNumCol.subRule.toString().slice(-1))) {
              $scope.makeNumCol.subRule = $scope.makeNumCol.subRule + colVal;
            } else {
              $scope.makeNumCol.subRule = colVal;
            }
            $scope.makeNumCol.row = e;
          }
        });
      }
    }),
    ruleGridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      enableFiltering: false,
      data: 'makeNumCol.ruleList',
      columnDefs: [
        { name: 'rule', displayName: '子公式清單' },
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
      this.modal = $modal({
        template: 'makeNumColModal',
        show: false,
        scope: $scope
      });
      this.modal.$promise.then(this.modal.show);
      $.each(srcList, function (i, v) {
        if (!_bdd.util.isStrDataType(v.srcType) && v.id.srcTable) filterCols.push(v);
      });
      $scope.makeNumCol.colList = filterCols;
    },
    op: function (op) {
      var subVal = $scope.makeNumCol.subRule;
      if (subVal) {
        if (_bdd.util.isOp(subVal.slice(-1))) {
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
        if (_bdd.util.isOp(subVal.toString().slice(-1))) {
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
      if (subVal && !_bdd.util.isOp(subVal.toString().slice(-1))) {
        $scope.makeNumCol.ruleList.push({rule: subVal});
      } else $scope.msg('info', '子公式不完整！');
    },
    delSubRule: function (row) {
      var index = $scope.makeNumCol.ruleList.indexOf(row.entity);
      $scope.makeNumCol.ruleList.splice(index, 1);
    },
    setRule: function () {
      var subVal = $scope.makeNumCol.subRule.trim();
      if (subVal && !_bdd.util.isOp(subVal.toString().slice(-1))) {
        $scope.makeNumCol.rule = subVal;
      } else $scope.msg('info', '子公式不完整！');
    },
    addDefCol: function () {
      if ($scope.makeNumCol.colId && $scope.makeNumCol.colName && $scope.makeNumCol.rule) {
        var row = $scope.makeNumCol.row;
        if (row) {
          var col = {
            id: {srcColumn: $scope.makeNumCol.colId},
            alias: $scope.makeNumCol.colName,
            srcType: 'number',
            formula: $scope.makeNumCol.rule
          };
          $scope.src.list.unshift(col);
          $scope.src.defCol.push(col);
          $scope.makeNumCol.modal.hide();
          $scope.msg('success', '新增欄位成功!!');
        } else $scope.msg('danger', '欄位資料錯誤！');
      } else $scope.msg('danger', '請輸入欄位ID、名稱、與總公式！');
    }
  };

  $scope.makeStrCol = {
    modal: {},
    rule: '',
    subRule: '',
    row: '',
    colList: [],
    colGridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      data: 'makeStrCol.colList',
      columnDefs: [
        { name: 'id.srcTable', displayName: '表格' },
        { name: 'id.srcColumn', displayName: '欄位ID' },
        { name: 'alias', displayName: '欄位名稱' },
        { name: 'srcType', displayName: '資料型態' },
        { name: 'srcSize', displayName: '資料長度' }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var e = row.entity,
                length = e.srcSize,
                colVal = e.id.srcTable + '.' + e.id.srcColumn;
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
      this.modal = $modal({
        template: 'makeStrColModal',
        show: false,
        scope: $scope
      });
      this.modal.$promise.then(this.modal.show);
      $.each(srcList, function (i, v) {
        if (_bdd.util.isStrDataType(v.srcType) && v.id.srcTable) filterCols.push(v);
      });
      $scope.makeStrCol.colList = filterCols;
    },
    posLength: function (type) {
      var subVal = $scope.makeStrCol.subRule,
          row = $scope.makeStrCol.row,
          colVal = row.id.srcTable + '.' + row.id.srcColumn,
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
      if ($scope.makeStrCol.colId && $scope.makeStrCol.colName && $scope.makeStrCol.rule) {
        var row = $scope.makeStrCol.row;
        if (row) {
          var col = {
            id: {srcColumn: $scope.makeStrCol.colId},
            alias: $scope.makeStrCol.colName,
            srcType: 'string',
            formula: $scope.makeStrCol.rule
          };
          $scope.src.list.unshift(col);
          $scope.src.defCol.push(col);
          $scope.makeStrCol.modal.hide();
          $scope.msg('success', '新增欄位成功!!');
        } else $scope.msg('danger', '欄位資料錯誤！');
      } else $scope.msg('danger', '請輸入欄位ID、名稱、與總公式！');
    }
  };

});