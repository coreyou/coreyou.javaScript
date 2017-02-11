(function () {
  var bdgApp = angular.module('bdgApp', ['icsc.http', 'ngAnimate', 'ngSanitize', 'mgcrea.ngStrap', 'ui.grid', 'ui.grid.selection', 'ui.grid.resizeColumns']);

  bdgApp.config(function ($alertProvider) {
    angular.extend($alertProvider.defaults, {
      container: 'body',
      keyboard: true,
      placement: 'bottom-right',
      type: 'success',
      duration: 3,
      animation: "am-fade-and-slide-bottom"
    });
  });

  bdgApp.config(function($selectProvider) {
    angular.extend($selectProvider.defaults, {
      sort: false
    });
  });

})();