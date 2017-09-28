$(function() {
	var cookieNameFirstTime = $("td.header-csc-trans").text().trim() + "FirstTime";
	// 取作業名稱來設定歡迎畫面的標題
	$("#welcomeModalTitle").html($("td.header-csc-title").text().trim());
	
	// 顯示歡迎畫面(只有設定每次都會開、第一次開的時候，才會顯示畫面)
	if (isAlwaysOpenWelcome() && isFirstTime()) {
		$(".modal#welcomeModal").modal({
			backdrop: "static"
		});
		$(".modal#welcomeModal").modal("show");
		// 第一次使用，寫cookie，避免每次submit都會開啟歡迎畫面
		document.cookie = cookieNameFirstTime + "=true;";
	}
	
	// 在歡迎畫面按下[使用指引]
	var bootstroInitParam = {};
	$("#welcomeHelpBtn").click(function(bootstroInitParam) {
		$("#welcomeModal").modal("hide");
		bootstro.start(".bootstro", bootstroInitParam);
	});
	
	// 在歡迎畫面設定是否永遠顯示
	$("#alwaysOpenCheckbox").click(function() {
		if($("#" + this.id).attr("checked") == "checked") { // 取消勾選[總是顯示]
			$("#" + this.id).removeAttr("checked");
			// create cookie
			//document.cookie = "alwaysOpenWelcome=false;";
			localStorage.setItem("alwaysOpenWelcome", "false");
			console.log(document.cookie);
		} else { // 勾選[總是顯示]
			$("#" + this.id).attr("checked", "");
			// delete cookie
			//document.cookie = "alwaysOpenWelcome=false; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
			localStorage.removeItem("alwaysOpenWelcome");
			console.log(document.cookie);
		}
	});
	
	// 在歡迎畫面按下[直接開啟]
	$("#directStartBtn").click(function() {
		$("#welcomeModal").modal("hide");
	});
	
	// 檢查是否設定永遠開啟歡迎畫面
	function isAlwaysOpenWelcome() {
		// 檢查是否支援localStorage，再檢查是否已設定不再開啟歡迎畫面
		return !(typeof(Storage) !== "undefined" && localStorage.getItem("alwaysOpenWelcome") == "false");
	}
	
	function isFirstTime() {
		// 檢查是否有第一次使用的cookie
		return !(document.cookie != "" && document.cookie != undefined && document.cookie.indexOf(cookieNameFirstTime) != -1);
	}
});