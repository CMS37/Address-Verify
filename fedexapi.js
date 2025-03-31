function getFedExOAuthToken() {
	var grantType = "client_credentials"
	var clientId = "l7b543253d524c449e8588a7c12941a57d";
	var clientSecret = "b37fd2fa1c9147b0a277a339cfb227ac";

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
	  log("FedEx OAuth 토큰 발급 중 오류 발생: " + e);
	  return null;
	}
}

function validataShipment(accessToken) {
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var fedexSheet = ss.getSheetByName("페덱스");

	if (!fedexSheet) {
		log("페덱스 시트를 찾을 수 없습니다.");
		return null;
	}

	var headers = fedexSheet.getRange(1, 1, 1, fedexSheet.getLastColumn()).getValues()[0];
	var data = fedexSheet.getRange(4, 1, 1, fedexSheet.getLastColumn()).getValues()[0];
	var fedexData = {};

	for (var i = 0; i < headers.length; i++) {
		fedexData[headers[i].trim()] = data[i];
	}
	if (!fedexData) {
		log("페덱스 데이터가 없습니다.");
		return null;
	}

	// 배송검증 api
	var shipmentUrl = "https://apis-sandbox.fedex.com/ship/v1/shipments/packages/validate";

	// 배송 api
	// var shipmentUrl = "https://apis-sandbox.fedex.com/ship/v1/shipments";


	var body = getBody(fedexData, accessToken);

	try {
		var response = UrlFetchApp.fetch(shipmentUrl, body);
		var responseData = JSON.parse(response.getContentText());

		return responseData;
	} catch (e) {
		log(e);
		return null;
	}
}
