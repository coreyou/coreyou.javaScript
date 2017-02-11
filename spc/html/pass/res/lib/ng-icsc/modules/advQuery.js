/**
 * angular-icsc advanced query module
 */
'use strict';
angular.module('icsc.advQuery', ['mgcrea.ngStrap.modal'])

  .directive('icscAdvQuery', ["$modal", function ($modal) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attr, controller) {

      }
    };
  }]);