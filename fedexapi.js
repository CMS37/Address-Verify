function getFedExOAuthToken() {
	var grantType = "client_credentials"
	var clientId = "YOUT CLIENT ID";
	var clientSecret = "YOUR CLIENT SECRET";

	var tokenUrl = "https://apis-sandbox.fedex.com/oauth/token";

	var payload = "grant_type=" + encodeURIComponent(grantType) +
				  "&client_id=" + encodeURIComponent(clientId) +
				  "&client_secret=" + encodeURIComponent(clientSecret);
	
	var options = {
	  "method": "post",
	  "contentType": "application/x-www-form-urlencoded",
	  "payload": payload
	};
	
	try {
	  var response = UrlFetchApp.fetch(tokenUrl, options);
	  var tokenData = JSON.parse(response.getContentText());
	  return tokenData;
	} catch (e) {
	  Logger.log("FedEx OAuth 토큰 발급 중 오류 발생: " + e);
	  return null;
	}
}

function getConsolidatedShipmentData(accessToken) {
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var fedexSheet = ss.getSheetByName("페덱스");

	if (!fedexSheet) {
		Logger.log("페덱스 시트를 찾을 수 없습니다.");
		return null;
	}

	var headers = fedexSheet.getRange(1, 1, 1, fedexSheet.getLastColumn()).getValues()[0];
	var data = fedexSheet.getRange(4, 1, 1, fedexSheet.getLastColumn()).getValues()[0];
	var fedexData = {};

	for (var i = 0; i < headers.length; i++) {
		fedexData[headers[i].trim()] = data[i];
		if (data[i]) {
			Logger.log("페덱스 데이터: " + headers[i].trim() + " - " + data[i]);
		}
	}
	return fedexData;
}
