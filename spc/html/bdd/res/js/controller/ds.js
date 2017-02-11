angular.module('bddApp').controller('dsCtrl', function ($scope, $http, $icscRest, $modal, $alert, $compile, $dmaService, $cookieStore) {
  'use strict';

  var dsCookie = $cookieStore.get('pass-bdd-ds');

  $scope.$on('reface:done', function (event, params) {
    var dsText = $scope.activeDataCom.dsId + ':' + $scope.activeDataCom.schemaId;
    $scope.ds.active.ds = $scope.activeDataCom.dsId;
    $scope.ds.active.schema = $scope.activeDataCom.schemaId;
    $scope.ds.text = dsText;
    $scope.$broadcast('reface:setActiveDS', dsText);
  });

  $scope.$on('reface:setActiveDS', function (event, dsText) {
    $icscRest.post('bdd/dataCom/setActiveDS', dsText).success(function (data, status, headers) {
      $scope.$broadcast('design:getTable', dsText.split(':'));
    });
  });

  $scope.$on('design:getTable', function (event, dsActive) {
    $scope.activeDataCom.dsId = dsActive[0];
    $scope.activeDataCom.schemaId = dsActive[1];
    $dmaService.dataDefinition.getTables({datasourceId: dsActive[0], schema: dsActive[1]}).success(function (data, status, headers) {
      var tableList = [];
      $.each(data, function (i, v) {
        tableList.push({tableId: v.id.srcTable});
      });
      $scope.table.list = tableList;
    });
  });

  if (dsCookie) {
    var dsActive = dsCookie.split(':');
    $scope.$broadcast('design:getTable', dsActive);
  }

  $scope.ds = {
    modal: {},
    text: dsCookie || '選擇資料源',
    active: {
      ds: dsActive ? dsActive[0] : '',
      schema: dsActive ? dsActive[1] : ''
    },
    list: [],
    schemaList: [],
    dsGridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      data: 'ds.list',
      columnDefs: [
        {name: 'datasourceId', displayName: '資料庫'},
        {name: 'driver', displayName: '類型'}
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            $scope.ds.active.ds = row.entity.datasourceId;
            $dmaService.dataDefinition.getSchemas(row.entity.datasourceId).success(function (data, status, headers) {
              var list = [];
              $.each(data, function (i, v) {
                list.push({schema: v});
              });
              $scope.ds.schemaList = list;
            });
          }
        });
      }
    }),
    schemaGridOpts: $.extend(true, {}, _bdd.uiGridOpts, {
      data: 'ds.schemaList',
      columnDefs: [
        {name: 'schema', displayName: 'Schema'}
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var dsText = $scope.ds.active.ds + ':' + row.entity.schema;
            $scope.clear();
            $scope.ds.text = dsText;
            $scope.ds.modal.hide();
            $scope.$broadcast('reface:setActiveDS', dsText);
          }
        });
      }
    }),
    show: function () {
      var self = this;
      self.modal = $modal({
        template: 'dsModal',
        show: false,
        scope: $scope
      });
      $dmaService.dataDefinition.getDatasources().success(function (data, status, headers) {
        $scope.ds.list = data;
        self.modal.$promise.then(self.modal.show);
      });
    }
  };

});