

angular.module('bdgApp').controller('bdgRefaceCtrl', function ($scope, $http,$modal,$alert, uiGridConstants) {
  "use strict";

 //TODO 撰寫$scope.$on事件
  $scope.$on('reface:getColumn', function (event, table) {
     
  });
  $scope.clearInfo = function () {
     //
    //$scope.activeDataCom.setDefault();
    $scope.src.list = [];
    $scope.src.tables = [];
    $scope.target.list = [];
    $scope.query.param ={};
    $scope.query.list = [];
    //$scope.relation.selectedItems = [];
    //$scope.essential.rule = '';
    //$scope.essential.input = '';
    //$scope.essential.ruleList = [];
    //$scope.orderBy.rule = '';
    //$scope.orderBy.ruleList = [];
    //$scope.userFilter.rule = '';
    //$scope.userFilter.input = '';
    //$scope.userFilter.ruleList = [];
  };
  //$scope.query = {
  //  modal: {},
  //  list: [],
  //  selectedRow: '',
  //  title:'',
  //  param:{},
  //  gridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
  //    data: 'query.list',
  //    //TODO  bdg api 修改完成下方name須改小寫
  //    columnDefs: [
  //      { name: 'INFOID', displayName: '資訊項ID', filter: { condition: uiGridConstants.filter.CONTAINS } },
  //      { name: 'CHARTTYPE', displayName: '圖型種類', filter: { condition: uiGridConstants.filter.CONTAINS } },
  //      { name: 'CHARTTITLE', displayName: '圖型標題', filter: { condition: uiGridConstants.filter.CONTAINS } },
  //      { name: 'CHARTSIZE', displayName: '寬高比例', filter: { condition: uiGridConstants.filter.CONTAINS } },
  //      { name: 'UPDATEEMP', displayName: '最後更新者', filter: { condition: uiGridConstants.filter.CONTAINS } },
  //      { name: 'DATE', displayName: '更新日期', filter: { condition: uiGridConstants.filter.CONTAINS } },
  //      { name: 'TIME', displayName: '更新時間', filter: { condition: uiGridConstants.filter.CONTAINS } },
  //      { name: 'REMOVE', displayName: '刪除', enableFiltering: false,
  //        cellTemplate:
  //        '<div class="ui-grid-cell-contents btn-group">' +
  //        '<button type="button" class="btn btn-danger btn-xs" bs-tooltip="tooltip" data-title="刪除" ng-click="getExternalScopes().removeInfo(row)">' +
  //        '<span class="glyphicon glyphicon-remove">' +
  //        '</button>' +
  //        '</div>'
  //      }
  //
  //    ],
  //    onRegisterApi: function (gridApi) {
  //      gridApi.selection.on.rowSelectionChanged($scope, function (row) {
  //
  //        if (row.isSelected) {
  //          $scope.query.selectedRow = row.entity;
  //
  //          $scope.query.modal.$promise.then(function () {
  //            //$scope.clear();
  //            //TODO 等bdg api 改版完須改成小寫
  //            var table = row.entity.INFOID;
  //           // $scope.clearInfo();
  //            //$scope.query.modal.hide();
  //            $scope.src.tables = [table];
  //            //$scope.$broadcast('design:master:getColumn', table);
  //            //$scope.$broadcast('reface:getColumn', table);
  //            //$scope.$broadcast('reface:getRelation', table);
  //          });
  //        }
  //      });
  //    }
  //  }),
  //  show: function () {
  //    $scope.query.selectedRow = '';
  //    $scope.query.list = [];
  //    $scope.query.modal = $modal({
  //      template: 'queryModal',
  //      show: false,
  //      scope: $scope,
  //      prefixEvent: 'query'
  //    });
  //    $scope.query.modal.$promise.then($scope.query.modal.show);
  //  },
  //  getQueryInfoParam: function (type,infoId) {
  //    switch (type) {
  //      case "id":
  //        if (infoId) {
  //          this.param.infoId = infoId;
  //        }
  //        break;
  //      case "title":
  //        $scope.query.param.chartTitle = this.title;
  //        break;
  //      case "key":
  //        var keywordGroup = $scope.domainOpts.selected,
  //            keyword = $scope.keywordOpts.selected;
  //        $scope.query.param.keywordGroup = keywordGroup;
  //        $scope.query.param.keyword = keyword;
  //        break;
  //
  //
  //    }
  //  },
  //  doQueryInfoById: function (infoId) {
  //    $scope.query.getQueryInfoParam('id',infoId);
  //    _bdg.util.getJSON('bdgcLogic.getInfo', $scope.query.param, function (data) {
  //
  //      $scope.query.doReface(data);
  //    });
  //  },
  //  doQueryInfoByTitle: function () {
  //    $scope.query.getQueryInfoParam('title',$scope.query.title);
  //     _bdg.util.getJSON('bdgcLogic.getInfo', $scope.query.param, function (data) {
  //       //debugger;
  //       $scope.query.list = [];
  //       $scope.query.list = data;
  //    });
  //  },
  //  removeInfo: function (row) {
  //
  //
  //    var index = $scope.query.list.indexOf(row.entity);
  //    var infoId =$scope.query.list[index].INFOID;
  //    alert('INFOID:'+ infoId);
  //    // TODO remove
  //
  //    //_bdg.util.getJSON('bdgcLogic.removeInfo', {infoId: infoId}, function (data) {
  //    //  console.log(data);
  //    //});
  //    $scope.query.list.splice(index, 1);
  //
  //
  //  },
  //  reface: function () {
  //    var row = $scope.query.selectedRow;
  //
  //    $scope.clearInfo();
  //    if (row) {
  //      //try
  //      debugger;
  //      $scope.src.infoId = row.INFOID;
  //      $scope.query.doQueryInfoById(row.INFOID);
  //      $scope.query.modal.hide();
  //      $scope.msg('success', row.CHARTTYPE + '圖形種類已開啟！');
  //      $scope.clearInfo();
  //      //$scope.$broadcast('reface:done');
  //    }
  //  },
  //  doReface: function (data) {
  //
  //    var face = data[0];
  //    //    $store = $('#bdg-axes-tab');
  //    //this.faceBasic(face);
  //    //// init main table will clear everything
  //    $scope.query.faceDataSrc(face);
  //    //$store.data('infoId', face.INFOID);
  //    //$store.data('reface', true);
  //    (function() {
  //      var timer = $.Deferred(), i = 0;
  //      var wait = function(timer) {
  //        var task = function() {
  //          var data = $scope.src.list;
  //          i++;
  //          if (data && data.length > 0) {
  //            timer.resolve();
  //          } else if (i > 10) {
  //            timer.reject();
  //          } else {
  //            setTimeout(task, 500);
  //          }
  //        };
  //        setTimeout(task, 0);
  //        return timer;
  //      };
  //      $.when(wait(timer)).done(function() {
  //        $scope.query.faceStep2(face);
  //        //$scope.query.faceStep3(face);
  //    //    _bdg.reface.faceStep3(face);
  //        console.log('Reface Done!!!');
  //      }).fail(function() {
  //        console.log('Reface Break!!!');
  //      });
  //    })();
  //  },
  //  faceDataSrc: function (face) {
  //
  //    if (face.TABLEID) {
  //      var table = $.parseJSON(face.TABLEID);
  //      $scope.query.initMainTable(table[0], false);
  //      //this.storeTable('reface', table);
  //      $.each(table, function (idx, val) {
  //        $scope.query.queryColumns(val);
  //      });
  //    }
  //
  //    if (face.RELATION) {
  //      var rel = $.parseJSON(face.RELATION);
  //      $scope.query.faceRel(rel);
  //    }
  //  },
  //  queryColumns: function (tbId) {
  //   // var $colGrid = $('#bdg-axes-setup-src-grid');
  //
  //    _bdg.util.getJSON('bdgcDMA.getColumn', {tableId: tbId}, function (data) {
  //      var colList = [];
  //      $.each(data, function (i, v) {
  //        var colObj = {
  //          table: v.DEFTABLENAME,
  //          colId: v.SRCCOLUMNNAME,
  //          colName: v.COLUMNNAME,
  //          dataType: v.SRCDATATYPE,
  //          dataSize: v.SRCLENGTH,
  //          axis: '0'
  //        };
  //        colList.push(colObj);
  //      });
  //      if (colList) {
  //
  //        $scope.src.list = colList;
  //
  //      }
  //    });
  //  },
  //  decideChartType: function (type) {
  //    $scope.setChartType(type);
  //  },
  //  sizingState: function (state) {
  //    var $store = $('#bdg-basic');
  //    if (state === 'resize') {
  //      $store.removeData();
  //    } else if (state) {
  //      $store.data('sizing', state);
  //    } else {
  //      return $store.data('sizing');
  //    }
  //  },
  //  chartTitle: function (title) {
  //   // var $ct = $('#bdg-chart-title');
  //    if (title) {
  //      //$ct.val(title);
  //      $scope.query.title = title;
  //    }
  //    else {
  //      return  $scope.query.title;
  //    }
  //  },
  //  initMainTable: function (tbId, doQuery) {
  //    //var infoId = $('#bdg-axes-tab').data('infoId');
  //    //this.clearAxes();
  //    //this.clearAxesGrid();
  //    //$('.bdg-step2-func-btn').removeClass('disabled');
  //    //$('#bdg-axes-tab').removeData('lcInit');
  //    //// restore infoId: means do not generate new infoId when change the main table.
  //    //if (infoId) $('#bdg-axes-tab').data('infoId', infoId);
  //   // this.storeTable('main', tbId);
  //
  //    if (doQuery) {
  //      $scope.query.queryColumns(tbId);
  //    }
  //  },
  //
  //  pickRel: function (data) {
  //    _bdg.reface.queryColumns(data.tarTable);
  //    _bdg.reface.storeTable('sub', data.tarTable);
  //    _bdg.reface.storeRel(data);
  //  },
  //  storeTable: function (type, data) {
  //    var $store = $('#bdg-axes-tab');
  //    switch (type) {
  //      case "main":
  //        $store.data('table', [data]);
  //        break;
  //      case "sub":
  //        var storeTable = $store.data('table');
  //        if (storeTable.indexOf(data) === -1) {
  //          storeTable.push(data);
  //          $store.data('table', storeTable);
  //        }
  //        break;
  //      case "reface":
  //        $store.data('table', data);
  //        break;
  //    }
  //  },
  //  doFaceAxes: function (axes) {
  //
  //    var src = [];
  //   // $.extend(true, src, $scope.src);
  //    src = $scope.src.list;
  //    _bdg.designer.switchDataPrevBtn(true);
  //    axesLoop:
  //        for (var i = 0; i < axes.length; i++) {
  //          for (var j = 0; j < src.length; j++) {
  //            if ((axes[i].table === '' || axes[i].table.toLowerCase() === src[j].table.toLowerCase()) && axes[i].colId.toLowerCase() === src[j].colId.toLowerCase()) {
  //              src[j].axis = axes[i].axis;
  //              src[j].func = '0';
  //
  //
  //              $scope.target.list.push(src[j]);
  //
  //              continue axesLoop;
  //            }
  //          }
  //        }
  //  },
  //
  //  clearAxes: function () {
  //    var $store = $('#bdg-axes-tab');
  //    $store.removeData();
  //  },
  //
  //  faceAxes: function (face) {
  //    var axes = [];
  //
  //    if (face.AXISX) {
  //      var x = $.parseJSON(face.AXISX);
  //      axes = axes.concat(_bdg.util.setAxisData('1', x));
  //    }
  //    if (face.AXISYL) {
  //      var yl = $.parseJSON(face.AXISYL);
  //      axes = axes.concat(_bdg.util.setAxisData('2', yl));
  //    }
  //    if (face.AXISYR) {
  //      var yr = $.parseJSON(face.AXISYR);
  //      axes = axes.concat(_bdg.util.setAxisData('3', yr));
  //    }
  //    if (face.SERIES) {
  //      var s = $.parseJSON(face.SERIES);
  //      axes = axes.concat(_bdg.util.setAxisData('4', s));
  //    }
  //
  //    if (axes.length > 0) {
  //      $scope.query.doFaceAxes(axes);
  //    }
  //  },
  //
  //  setAxisFunc: function () {
  //    var colRow = $('#bdg-axes-setup-tar-grid').gk('row'),
  //        axis = _bdg.util.getAxisKey(colRow.axis),
  //        store = $('#bdg-axes-tab').data(axis),
  //        func = $('#' + colRow.id + '_func option:selected').val();
  //    $.each(store, function (idx, val) {
  //      if (val.table === colRow.table && val.colId === colRow.colId) {
  //        val.func = func.toUpperCase();
  //      }
  //    });
  //  },
  //  faceRel: function (data) {
  //    //$('#bdg-axes-tab').data('rel', data);
  //
  //    //$scope.target.list = data;
  //  },
  //  faceStep2: function (face) {
  //    // add make columns
  //    if (face.DEFCOL) {
  //
  //
  //      $scope.query.faceDefCol($.parseJSON(face.DEFCOL));
  //      //test this
  //
  //    }
  //    // essential rule
  //    if (face.MUSTWHERE) {
  //      var essential = $.parseJSON(face.MUSTWHERE);
  //      $scope.query.faceEssential(essential);
  //    } else {
  //      $scope.query.faceEssential([]);
  //    }
  //    // shift axes
  //    $scope.query.faceAxes(face);
  //    // clear stuff
  //    $('#bdg-axes-tab').removeData('dataOrder');
  //  },
  //  faceDefCol: function (defCol) {
  //    $.each(defCol, function (i, v) {
  //      v.colName = v.title;
  //      v.axis = '請選擇';
  //    });
  //    //$('#bdg-axes-setup-src-grid').gk('add', defCol);
  //    //_bdg.designer.paintSubTable('#bdg-axes-setup-src-grid');
  //    $scope.src.defCol = defCol;
  //  },
  //  faceEssential: function (data) {
  //    var essList = [],
  //        $grid = $('#bdg-essential-col-rule-grid');
  //    $.each(data, function (idx, val) {
  //      var ess = {rule: val};
  //      essList.push(ess);
  //    });
  //    //$grid.gk('clear');
  //    //$grid.gk('add', essList);
  //    //$('#bdg-axes-tab').data('essential', data);
  //  }
  //};
  //



});