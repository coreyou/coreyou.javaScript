/**
 * Created by coreyou on 2015/1/4.
 */
(function() {   // closure is a good habit
    var app = angular.module('memberTab-directives', []); // [] 是 Dependencies of other modules

    // used in tabInitClick.html
    app.directive("tabElement", function() {
        return {
            restrict: 'E', // element name
            templateUrl: 'partition_2.html'
        };
    });

    // used in tabInitClick.html
    app.directive("tabAttribute", function() {
        return {
            restrict: "A",
            templateUrl: "partition_2.html"
        };
    });

    // 將 tabInitClick.html的tab部分程式碼整理到 partition_all.html內
    app.directive("memberTabs", function() {
        return {
            restrict: "E",
            templateUrl: "partition_all.html",
            controller: function() {    // 替代 TabController
                this.tabNo = 1;

                // when tab is clicked, set the value of tab.
                this.setTab = function(newValue){
                    this.tabNo = newValue;
                };

                // check the value of tab, return true or false.
                // combine with ng-show to show the content of tab.
                this.isSet = function(tabName){
                    return this.tabNo === tabName;
                };
            },
            controllerAs: "tabNoCtrl"
        }
    });
})();