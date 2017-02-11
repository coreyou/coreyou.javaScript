/**
 * angular-icsc
 * @version v0.1.0 - 2014-09-05
 */
(function () {
  'use strict';
  angular.module('icsc', ['icsc.common', 'icsc.advQuery']);
  angular.module('icsc.service', ['icsc.service.dma']);
  var commonModule = angular.module('icsc.common', ['icsc.http', 'icsc.rest', 'icsc.service', 'icsc.alert', 'ngAnimate', 'ngSanitize', 'ui.router', 'mgcrea.ngStrap', 'ui.grid', 'angular-loading-bar', 'ui.select', 'ui.validate']);

  commonModule.run(function ($rootScope, $alert, $state) {
    $rootScope.$on('icsc.http.err', function (event, err) {
      $alert({
        title: '錯誤訊息',
        type: 'danger',
        duration: false,
        content: err
      });
    });

    $rootScope.$state = $state;
  });

  commonModule.config(function ($modalProvider, $alertProvider, $tabProvider, $tooltipProvider, uiSelectConfig) {
    angular.extend($modalProvider.defaults, {
      html: true,
      backdropAnimation: 'fade in' // Use todc bootstrap default style , disable angular-motion style
    });

    angular.extend($alertProvider.defaults, {
      container: 'body',
      keyboard: true,
      placement: 'bottom-right',
      type: 'success',
      duration: 5,
      animation: "am-fade-and-slide-bottom",
      template: '../pass/res/lib/ng-icsc/tpl/alert.html'
    });

    angular.extend($tabProvider.defaults, {
      navClass: 'nav-tabs nav-tabs-google'
    });

    angular.extend($tooltipProvider.defaults, {
      container: 'body'
    });

    uiSelectConfig.theme = 'bootstrap';
  });

  commonModule.filter('propsFilter', function () {
    return function (items, props) {
      var out = [];

      if (angular.isArray(items)) {
        items.forEach(function (item) {
          var itemMatches = false;

          var keys = Object.keys(props);
          for (var i = 0; i < keys.length; i++) {
            var prop = keys[i];
            var text = props[prop].toLowerCase();
            if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
              itemMatches = true;
              break;
            }
          }

          if (itemMatches) {
            out.push(item);
          }
        });
      } else {
        // Let the output be the input untouched
        out = items;
      }

      return out;
    };
  });

  angular.module('icsc.http', []).config(['$provide', function ($provide) {
    //Override $http.post to fit eventbus
    // configure http provider
    $provide.decorator('$http', ['$delegate', '$rootScope', function ($http, $rootScope) {
      // create function which overrides $http function
      var httpStub = function (url, data, config) {
        // AngularJS $http.delete takes 2nd argument as 'config' object
        // 'data' will come as 'config.data'

        if (url.match(/\/rest\//)) {
          return $http(angular.extend({}, {
            method: 'POST',
            headers: {'Content-Type': 'application/json; charset=UTF-8'},
            url: url,
            data: data
          })).error(function (data, status, headers, config) {
            if (data.indexOf('dsjccom') !== -1) {
              $rootScope.$broadcast('icsc.http.err', '未登入或登入逾時！');
            } else {
              $rootScope.$broadcast('icsc.http.err', data);
            }
          });
        } else {
          var sendData = {};

          config || (config = {});
          config.method = 'POST';

          if (data) {
            sendData.i = data;
            if (angular.isArray(data)) {
              sendData.t = "list";
            } else if (angular.isObject(data)) {
              sendData.t = "map";
            } else {
              sendData.t = "string";
            }
          }

          url = location.pathname.match(/\/dma\//ig)
              ? '/erp/event/put/dma/' + url + '.go?json'
              : '/erp/event/put/bd/' + url + '.go?json';

          var options = {
            url: url,
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
          };

          if (data) {
            options.data = $.param({j: JSON.stringify(sendData)})
          }
          return $http(angular.extend(config, options)).success(function (data, status, headers, config) {
            if (data.err) {
              $rootScope.$broadcast('icsc.http.err', data.err);
            } else if (data._gk_js_ && data._gk_js_.indexOf('gk.sessionTimeOutHandler') !== -1) {
              $rootScope.$broadcast('icsc.http.err', '未登入或登入逾時！');
            }
          });
        }
      };

      $http.post = httpStub;
      return $http;
    }]);
  }]);

  angular.module('icsc.rest', []).provider('$icscRest', function () {
    this.$get = ["$http", "$rootScope", function ($http, $rootScope) {
      return {
        get: function (url, data) {
          url = '/erp/rest/' + url;
          return $http.get(url, data).error(function (data, status, headers, config) {
            if (status === 401) {
              $rootScope.$broadcast('icsc.http.err', '未登入或登入逾時！');
            }
          });
        },
        post: function (url, data) {
          url = '/erp/rest/' + url;
          return $http.post(url, data).error(function (data, status, headers, config) {
            if (status === 401) {
              $rootScope.$broadcast('icsc.http.err', '未登入或登入逾時！');
            }
          });
        }
      };
    }];
  });

  angular.module('icsc.alert', []).provider('$icscAlert', function () {
    this.$get = ["$alert", function ($alert) {
      function alert(args, type) {
        var options = {
          type: type
        };

        if (args.length > 1) {
          options.title = args[0];
          options.content = args[1];
        } else {
          options.content = args[0]
        }

        $alert(options);
      }

      return {
        info: function (title, content) {
          alert.call(this, Array.prototype.slice.call(arguments), 'info');
        },
        success: function (title, content) {
          alert.call(this, Array.prototype.slice.call(arguments), 'success');
        },
        warn: function (title, content) {
          alert.call(this, Array.prototype.slice.call(arguments), 'warning');
        },
        error: function (title, content) {
          alert.call(this, Array.prototype.slice.call(arguments), 'danger');
        }
      };
    }];
  });

  angular.module('icsc.service.dma', ['icsc.rest']).provider('$dmaService', function () {
    this.$get = ["$icscRest", function ($icscRest) {
      return {
        dataDefinition: {
          getDatasources: function () {
            return $icscRest.get('dma/dataDefinition/getDSList');
          },
          addDS: function (datasourceObj) {
            return $icscRest.post('dma/dataDefinition/addDS', datasourceObj);
          },
          updateDS: function (datasourceObj) {
            return $icscRest.post('dma/dataDefinition/updateDS', datasourceObj);
          },
          deleteDS: function (datasourceId) {
            return $icscRest.post('dma/dataDefinition/deleteDS', datasourceId);
          },
          getSchemas: function (datasourceId) {
            return $icscRest.post('dma/dataDefinition/getSchemas', datasourceId);
          },
          getTables: function (paramObj) {
            return $icscRest.post('dma/dataDefinition/getTables', paramObj);
          },
          getUnImportTables: function (datasourceObj) {
            return $icscRest.post('dma/dataDefinition/getUnImportTables', datasourceObj);
          },
          updateTable: function (tableObj) {
            return $icscRest.post('dma/dataDefinition/updateTable', tableObj);
          },
          deleteTable: function (tableObj) {
            return $icscRest.post('dma/dataDefinition/deleteTable', tableObj);
          },
          importTable: function (tables) {
            return $icscRest.post('dma/dataDefinition/importTable', tables);
          },
          getColumns: function (paramObj) {
            return $icscRest.post('dma/dataDefinition/getColumns', paramObj);
          },
          updateColumns: function (columns) {
            return $icscRest.post('dma/dataDefinition/updateColumns', columns);
          },
          deleteColumn: function (columnObj) {
            return $icscRest.post('dma/dataDefinition/deleteColumn', columnObj);
          },
          getPreviewData: function (paramObj) {
            return $icscRest.post('dma/dataDefinition/getPreviewDataList', paramObj);
          }
        },
        db: {
          testConnect: function (datasourceObj) {
            return $icscRest.post('dma/db/testConnect', datasourceObj)
          },
          connect: function (datasourceId) {
            return $icscRest.post('dma/db/connect', datasourceId)
          },
          getSchemas: function (datasourceId) {
            return $icscRest.post('dma/db/getSchemas', datasourceId);
          },
          getTables: function (datasourceId, schema) {
            return $icscRest.post('dma/db/getTables', {datasourceId: datasourceId, schema: schema});
          },
          getColumnsInfo: function (datasourceId, schema, table) {
            return $icscRest.post('dma/db/getColumnsInfo', {datasourceId: datasourceId, schema: schema, table: table});
          },
          getColumnsInfoBySQL: function (datasourceId, sql) {
            return $icscRest.post('dma/db/getColumnsInfoBySQL', {datasourceId: datasourceId, sql: sql});
          }
        },
        basicDataMgr: {
          addDomain: function (domainObj) {
            return $icscRest.post('dma/basicDataMgr/addDomain', domainObj);
          },
          updateDomain: function (domainObj) {
            return $icscRest.post('dma/basicDataMgr/updateDomain', domainObj);
          },
          deleteDomain: function (domainId) {
            return $icscRest.post('dma/basicDataMgr/deleteDomain', domainId);
          }
        },
        basicData: {
          getDomains: function () {
            return $icscRest.get('dma/basicData/getDomainList');
          },
          getSystems: function () {
            return $icscRest.get('dma/basicData/getSystemList');
          },
          getPublicTables: function () {
            return $icscRest.get('dma/basicData/getPublicTableList');
          }
        },
        assistQuery: {
          getAssistQuery: function (assistId) {
            return $icscRest.post('dma/assistQuery/getAssistQuery', assistId);
          },
          getAssistQueryList: function () {
            return $icscRest.get('dma/assistQuery/getAssistQueryList');
          }
        },
        assistQueryMgr: {
          add: function (assistQueryObj) {
            return $icscRest.post('dma/assistQueryMgr/add', assistQueryObj);
          },
          update: function (assistQueryObj) {
            return $icscRest.post('dma/assistQueryMgr/update', assistQueryObj);
          },
          delete: function (assistId) {
            return $icscRest.post('dma/assistQueryMgr/delete', assistId);
          },
          getAssistQueryList: function () {
            return $icscRest.get('dma/assistQueryMgr/getAssistQueryList');
          }
        },
        tableRelation: {
          getRelations: function (queryObj) {
            return $icscRest.post('dma/tableRelation/getRelationList', queryObj);
          }
        },
        tableRelationMgr: {
          add: function (relationObj) {
            return $icscRest.post('dma/tableRelationMgr/add', relationObj);
          },
          delete: function (id) {
            return $icscRest.post('dma/tableRelationMgr/delete', id);
          },
          getRelations: function (queryObj) {
            return $icscRest.post('dma/tableRelationMgr/getRelationList', queryObj);
          }
        }
      };
    }];
  });
}());
