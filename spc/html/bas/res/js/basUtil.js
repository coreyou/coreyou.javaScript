/**
 * Created by 184366 on 2014/12/11.
 */
var _bs = {};
(function () {
  "use strict";
  $.extend(_bs, {
    util: {
      //getJSON: function (eventId, param) {
      //  var defer = $.Deferred();
      //  $.ajax({
      //    type: "POST",
      //    url: _bs.util.getURL(eventId),
      //    contentType: "application/json;charset=UTF-8",
      //    data: JSON.stringify(param),
      //    success: function (data) {
      //      if (_bd.util.sessionTimeout(data)) {
      //        var msg = "您的連線已經逾時，請重新登入！";
      //        if (bootbox) bootbox.alert(msg);
      //        else alert(msg);
      //      } else {
      //        defer.resolve(data);
      //      }
      //    },
      //    error: function (xhr, status, error) {
      //      console.log(error);
      //    }
      //  });
      //  return defer.done(function (data) {
      //    return data;
      //  });
      //},

      getJSON: function (eventId, param, callback) {
        $.ajax({
          type: "POST",
          url: _bs.util.getURL(eventId),
          contentType: "application/json;charset=UTF-8",
          data: JSON.stringify(param),
          success: function (data) {
            if (_bd.util.sessionTimeout(data)) {
              var msg = "您的連線已經逾時，請重新登入！";
              if (bootbox) bootbox.alert(msg);
              else alert(msg);
            } else callback(data);
          },
          error: function (xhr, status, error) {
            console.log(error);
          }
        });
      },

      getURL: function (eventId) {
        var url,
            loc = location,
            eventName = '/rest/bas/',
            eventGrain = eventId.split('/'),
            pathGrain = loc.pathname.split('/');
        if (eventGrain[0] === 'http:') {
          url = eventId;
        } else {
          url = loc.protocol + '//' + loc.host + '/' + pathGrain[1] + eventName + eventId;
        }
        return url;
      },

      getBdgJSON: function (eventId, param, callback) {
        $.ajax({
          type: "POST",
          url: _bs.util.getBdgURL(eventId),
          contentType: "application/json;charset=UTF-8",
          data: JSON.stringify(param),
          dataType: "json",
          success: function (data) {
            if (_bd.util.sessionTimeout(data)) {
              var msg = "您的連線已經逾時，請重新登入！";
              if (bootbox) bootbox.alert(msg);
              else alert(msg);
            } else callback(data);
          },
          error: function (xhr, status, error) {
            console.log(error);
          }
        });
      },

      getBdgURL: function (eventId) {
        var url,
            loc = location,
            eventName = '/rest/bdg/',
            eventGrain = eventId.split('/'),
            pathGrain = loc.pathname.split('/');
        if (eventGrain[0] === 'http:') {
          url = eventId;
        } else {
          url = loc.protocol + '//' + loc.host + '/' + pathGrain[1] + eventName + eventId;
        }
        return url;
      },

      getQueryGroupInfoParam: function (type) {
        var param = {};
        switch (type) {
          case "title":
            var groupInputValue = $('#bas-query-group-info-group-name').val();
            var menuItemValue = $('#dropdownGroupTypeMenu').val();
            if (menuItemValue === "groupId") {
              param.groupId = groupInputValue;
            } else if (menuItemValue === "groupName") {
              param.groupName = groupInputValue;
            }
            return param;
        }
      },

      removeGroupInfo: function (trigger) {
        var $grid = $('#bas-query-group-info-grid'),
            tarId = $(trigger).closest('tr').attr('id'),
            tarData = $grid.gk('row', tarId);
        if (tarData) {
          $grid.gk('del', tarId);
          _bs.util.getJSON('userGroup/deleteUserGroup', {userId: tarData.userid, groupId: tarData.groupid});
        }
      },

      reface: function () {
        var $grid = $('#bas-query-group-info-grid'),
            row = $grid.gk('row');
        if (row.groupid) {
          //var group = $('#bas-query-group-info-grid .jqgrow[id="' + row.id + '"]').data('info');
          var groupDeferredObj = _bd.spc.getDefaultGroupInfo(row.groupid, function(data) {
            if (data) {
              $.each(data, function (i, v) {
                v = $.parseJSON($.parseJSON(v.info));
                $.each(v.face, function (faceIndex, faceValue) {
                  _bd.spc.buildChart(true, faceValue);
                })
              });
            }
          });
          //groupDeferredObj.then(function(data) {
          //  if (data) {
          //    $.each(data, function (i, v) {
          //      v = $.parseJSON($.parseJSON(v.info));
          //      $.each(v.face, function (faceIndex, faceValue) {
          //        _bd.spc.buildChart(true, faceValue);
          //      })
          //    });
          //  }
          //});

          $grid.gk('heading', '資訊項清單');
          $('#bas-query-group-info-dialog').dialog('close');
        } else {
          $grid.gk('heading', '資訊項清單：<span style="color:red;">請選擇群組資訊項</span>');
        }
      }
    }
  });
})();