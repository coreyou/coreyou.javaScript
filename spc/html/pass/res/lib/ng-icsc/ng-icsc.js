/**
 * angular-icsc
 * @version v0.1.0 - 2014-09-05
 */
(function () {
  'use strict';
  angular.module('third-party', ['ngAnimate', 'ngSanitize', 'ui.router', 'mgcrea.ngStrap', 'ui.grid', 'angular-loading-bar', 'ui.select', 'ui.validate']);
  angular.module('icsc', ['icsc.common', 'icsc.advQuery']);
  angular.module('icsc.service', ['icsc.service.pass', 'icsc.service.dma']);

  var commonModule = angular.module('icsc.common', ['third-party', 'icsc.http', 'icsc.rest', 'icsc.service', 'icsc.alert', 'icsc.confirm', 'icsc.modal']);
  commonModule.run(function ($rootScope, $alert, $icscModal, loginFactory) {
    $rootScope.$on('icsc.http.err', function (event, err) {
      $alert({
        title: '錯誤訊息',
        type: 'danger',
        duration: false,
        content: err
      });
    });

    $rootScope.$on('reLogin', function () {
      if (!loginFactory.modal) {
        loginFactory.modal = $icscModal({
          template: '../pass/res/lib/ng-icsc/tpl/login.html',
          show: true,
          scope: $rootScope,
          backdrop: 'static',
          keyboard: false
        });
      }
    });
  });

  commonModule.factory('loginFactory', function () {
    return {
      modal: null
    };
  }).controller('loginCtrl', loginCtrlFunction);

  function loginCtrlFunction($rootScope, $scope, $icscRest, loginFactory) {
    $scope.reLogin = {
      modal: loginFactory.modal,
      login: function () {
        var params = {userId: $scope.reLogin.userId, password: $scope.reLogin.password};
        $icscRest.post('pass/account/login', params).success(function (data, status, headers) {
          $scope.reLogin.result = data;
          if (data.approve) {
            $rootScope.$broadcast('reLogin:approve');
            $scope.reLogin.modal.hide();
          }
        });
      }
    };
    $scope.keyPress = keyPress;
    function keyPress(event) {
      if (event.keyCode == 13 && $scope.reLogin.userId.length > 0 && $scope.reLogin.password.length > 0) {
        $scope.reLogin.login();
      }
    }
  }

  commonModule.config(function ($alertProvider, $tabProvider, $tooltipProvider, uiSelectConfig) {
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
    // Override $http.post to fit eventbus
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
            if (data && data.indexOf('dsjccom') !== -1) {
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

          var options = {
            url: '/erp/event/put/dma/' + url + '.go?json',
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
    this.$get = ["$http", "$rootScope", function ($http) {
      return {
        get: function (url, data) {
          url = '/erp/rest/' + url;
          return $http.get(url, data);
        },
        post: function (url, data) {
          url = '/erp/rest/' + url;
          return $http.post(url, data);
        }
      };
    }];
  }).factory('authHttpResponseInterceptor', ['$q', '$rootScope', function ($q, $rootScope) {
    return {
      responseError: function (rejection) {
        if (rejection.status === 401) {
          $rootScope.$broadcast('reLogin');
        }
        return $q.reject(rejection);
      }
    }
  }]).config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('authHttpResponseInterceptor');
  }]);

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

  angular.module('icsc.confirm', []).provider('$icscConfirm', function () {
    this.$get = [function () {
      function confirm(args, type) {
        var defaultOptions = {
          title: args[0],
          type: type,
          allowOutsideClick: true,
          showCancelButton: true,
          confirmButtonClass: 'btn-' + (type === 'error' ? 'danger' : type)
        };

        if (args.length > 2) {
          defaultOptions.text = args[1];
        }

        swal(defaultOptions, args[args.length - 1]);
      }

      return {
        info: function (title, text, confirmCallback) {
          confirm.call(this, Array.prototype.slice.call(arguments), 'info');
        },
        success: function (title, text, confirmCallback) {
          confirm.call(this, Array.prototype.slice.call(arguments), 'success');
        },
        warn: function (title, text, confirmCallback) {
          confirm.call(this, Array.prototype.slice.call(arguments), 'warning');
        },
        error: function (title, text, confirmCallback) {
          confirm.call(this, Array.prototype.slice.call(arguments), 'error');
        }
      };
    }];
  });

  angular.module('icsc.modal', []).provider('$icscModal', function ($modalProvider) {
    var defaults = angular.extend($modalProvider.defaults, {
      html: true,
      backdropAnimation: 'fade in' // Use todc bootstrap default style , disable angular-motion style
    });

    this.$get = ["$modal", function ($modal) {
      function ModalFactory(options) {
        var config = angular.extend(angular.copy(defaults), options),
            instance = $modal(config),
            originShow = instance.show;

        instance.show = function ($event) {
          var self = this;
          if ($event && $event.currentTarget) {
            var currentTarget = $event.currentTarget,
                $currentTarget = $(currentTarget),
                top = $currentTarget.offset().top + currentTarget.offsetHeight,
                left = $currentTarget.offset().left;

            self.$promise.then(function () {
              originShow();
              self.$element.find('.modal-dialog').offset({top: top, left: left});
            });
          } else {
            self.$promise.then(originShow);
          }
        };

        instance.$scope.$on(config.prefixEvent + '.hide', function (event, modal) {
          modal.destroy();
        });

        return instance;
      }

      return ModalFactory;
    }];
  });

  angular.module('icsc.service.dma', ['icsc.rest']).provider('$dmaService', function () {
    this.$get = ["$icscRest", function ($icscRest) {
      return {
        dataDefinition: {
          getDatasourceList: function () {
            return $icscRest.get('dma/dataDefinition/getDatasourceList');
          },
          getDatasources: function () {
            return $icscRest.get('dma/dataDefinition/getDatasources');
          },
          getSchemaList: function (datasourceId) {
            return $icscRest.post('dma/dataDefinition/getSchemaList', datasourceId);
          },
          getTableList: function (paramObj) {
            return $icscRest.post('dma/dataDefinition/getTableList', paramObj);
          },
          getTables: function (paramObj) {
            return $icscRest.post('dma/dataDefinition/getTables', paramObj);
          },
          getColumnList: function (paramObj) {
            return $icscRest.post('dma/dataDefinition/getColumnList', paramObj);
          },
          getColumns: function (paramObj) {
            return $icscRest.post('dma/dataDefinition/getColumns', paramObj);
          }
        },
        dataDefinitionMgr: {
          getDatasources: function () {
            return $icscRest.get('dma/dataDefinitionMgr/getDatasources');
          },
          addDS: function (datasourceObj) {
            return $icscRest.post('dma/dataDefinitionMgr/addDS', datasourceObj);
          },
          updateDS: function (datasourceObj) {
            return $icscRest.post('dma/dataDefinitionMgr/updateDS', datasourceObj);
          },
          deleteDS: function (datasourceId) {
            return $icscRest.post('dma/dataDefinitionMgr/deleteDS', datasourceId);
          },
          getTables: function (paramObj) {
            return $icscRest.post('dma/dataDefinitionMgr/getTables', paramObj);
          },
          getUnImportTables: function (datasourceObj) {
            return $icscRest.post('dma/dataDefinitionMgr/getUnImportTables', datasourceObj);
          },
          updateTable: function (tableObj) {
            return $icscRest.post('dma/dataDefinitionMgr/updateTable', tableObj);
          },
          deleteTable: function (tableObj) {
            return $icscRest.post('dma/dataDefinitionMgr/deleteTable', tableObj);
          },
          importTable: function (tables) {
            return $icscRest.post('dma/dataDefinitionMgr/importTable', tables);
          },
          publishTable: function (tableObj) {
            return $icscRest.post('dma/dataDefinitionMgr/publishTable', tableObj);
          },
          getUnauthorizedTables: function (tableObj) {
            return $icscRest.post('dma/dataDefinitionMgr/getUnauthorizedTables', tableObj);
          },
          getColumns: function (paramObj) {
            return $icscRest.post('dma/dataDefinitionMgr/getColumns', paramObj);
          },
          updateColumns: function (columns) {
            return $icscRest.post('dma/dataDefinitionMgr/updateColumns', columns);
          },
          deleteColumn: function (columnObj) {
            return $icscRest.post('dma/dataDefinitionMgr/deleteColumn', columnObj);
          },
          hasEditableColumn: function (tableObj) {
            return $icscRest.post('dma/dataDefinitionMgr/hasEditableColumn', tableObj);
          },
          getPreviewData: function (paramObj) {
            return $icscRest.post('dma/dataDefinitionMgr/getPreviewDataList', paramObj);
          }
        },
        db: {
          testConnect: function (datasourceObj) {
            return $icscRest.post('dma/db/testConnect', datasourceObj)
          },
          getSchemaList: function (datasourceId) {
            return $icscRest.post('dma/db/getSchemaList', datasourceId);
          },
          getTables: function (datasourceId, schema) {
            return $icscRest.post('dma/db/getTables', {datasourceId: datasourceId, schemaId: schema});
          },
          getColumnsInfo: function (datasourceId, schema, table) {
            return $icscRest.post('dma/db/getColumnsInfo', {
              datasourceId: datasourceId,
              schemaId: schema,
              tableId: table
            });
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
          getAssistQuery: function (assistId, offset, pageSize, filterColumnObj) {
            return $icscRest.post('dma/assistQuery/getAssistQuery', {
              assistId: assistId,
              offset: offset,
              pageSize: pageSize,
              filterColumn: filterColumnObj
            });
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
        },
        authority: {
          getGroups: function () {
            return $icscRest.get('dma/authority/getGroups');
          },
          isOperator: function () {
            return $icscRest.get('dma/authority/isOperator');
          },
          isInGroups: function (groupIds) {
            return $icscRest.post('dma/authority/isInGroups', groupIds);
          }
        }
      };
    }];
  });

  angular.module('icsc.service.pass', ['icsc.rest']).provider('$passService', function () {
    this.$get = ["$icscRest", function ($icscRest) {
      return {
        basicData: {
          getUserInfo: function () {
            return $icscRest.get('pass/basicData/getUserInfo');
          }
        }
      };
    }];
  });
}());
