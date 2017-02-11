var _bdd = {
  constants: {
    MASTER_PAGE_FIXED_HEIGHT: 227
  },
  uiGridOpts: {
    multiSelect: false,
    enableFiltering: true,
    enableColumnResizing: true,
    enableCellEditOnFocus: true,
    enableRowHeaderSelection: false
  }
};

(function () {
  var bddApp = angular.module('bddApp', ['icsc', 'ngCookies', 'ui.bootstrap.tpls', 'ui.bootstrap.datepicker', 'ui.bootstrap.timepicker', 'ui.grid.selection', 'ui.grid.resizeColumns', 'ui.grid.edit', 'ui.grid.cellNav', 'ui.grid.autoResize']);

  bddApp.filter('mapIsUK', function () {
    var isUKHash = {
      1: '1-鍵值',
      2: '2-過濾',
      3: '3-顯示'
    };
    return function(input) {
      if (!input){
        return '';
      } else {
        return isUKHash[input];
      }
    };
  });

}());
