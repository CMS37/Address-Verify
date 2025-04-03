function fedexHandler(responseData) {
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var fedexSheet = ss.getSheetByName("페덱스");

	if (!fedexSheet) {
		log("페덱스 시트를 찾을 수 없습니다.");
		return;
	}

	var headers = fedexSheet.getRange(1, 1, 1, fedexSheet.getLastColumn()).getValues()[0];
  
	for (var i = 0; i < responseData.length; i++) {
		var resp = responseData[i];
		var groupId = resp.groupId || "N/A";
		var transactionId = resp.transactionId || "N/A";

		// var fullOutput = JSON.stringify(resp, null, 2);
		// var chunkSize = 4000;
		// for (var i = 0; i < fullOutput.length; i += chunkSize) {
		// 	log(fullOutput.substring(i, i + chunkSize));
		// }
		
		log("배송 ID: " + groupId + ", 거래 ID: " + transactionId);

		if(!resp.errors && !resp.output.alerts) {
			log (groupId + " : 배송이 성공적으로 완료 되었습니다")
			continue;
		}

		if (resp.errors) {
			for (var j = 0; j < resp.errors.length; j++) {
				var error = resp.errors[j];
				log(groupId + " 오류코드 : " + error.code);
				handleError(error.code, groupId, fedexSheet);
			}
		}
	}
}
	
function handleError(errorCode, groupId, fedexSheet, headers) {
	switch (errorCode) {
		case "PHONENUMBER.TOO.LONG":
			var telColIndex = headers.indexOf("Receipient Tel #* (15)") + 1;
			var rowNum = getRowByGroupId(groupId, fedexSheet);
			if (rowNum && telColIndex > 0) {
				fedexSheet.getRange(rowNum, telColIndex).setBackground("#FF0000");
			}
			break;
		default:
			log(groupId + " : 알 수 없는 오류 발생 - 코드: " + errorCode);
			break;
	}
}

function handleAlerts(alerts, groupId, fedexSheet) {

}

function getRowByGroupId(groupId, sheet) {
  var lastRow = sheet.getLastRow();
  var data = sheet.getRange(1, 1, lastRow, 1).getValues();
  for (var i = 0; i < data.length; i++) {
	if (data[i][0] == groupId) {
	  return i + 1;
	}
  }
  return null;
}