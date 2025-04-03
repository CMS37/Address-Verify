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
	var dataRows = fedexSheet.getRange(4, 1, fedexSheet.getLastRow() - 3, fedexSheet.getLastColumn()).getValues();
	var groups = {};

	for (var i = 0; i < dataRows.length; i++) {
		var row = dataRows[i];
		var groupId = row[0];

		if (!groupId) {
			continue;
		}

		if (!groups[groupId]) {
			groups[groupId] = [];
		}

		groups[groupId].push(row);
	}

	var payloadOptionsArray = [];

	for (var groupId in groups) {
		var groupRows = groups[groupId];
		var fedexData = {};

		for (var j = 0; j < headers.length; j++) {
			fedexData[headers[j].trim()] = groupRows[0][j];
		}

		var commodities = [];
		// var totalWeight = 0;
		var totalCustomsValue = 0;

		for (var k = 0; k < groupRows.length; k++) {
			var rowData = {};
			var row = groupRows[k];

			for (var j = 0; j < headers.length; j++) {
				rowData[headers[j].trim()] = row[j];
			}

			var value = roundToTwo(rowData["Unit Value* (15)"]);
			var commodity = {
				"quantity": rowData["Qty* (7)"], //수량
				"quantityUnits": "EA", //수량 단위
				"countryOfManufacture": rowData["Country of Manufacture* (2)"], // 제조국
				"description": rowData["Product Description* (148)"], // 상품 이름
				"weight": {
					"units": "KG", // 무게 단위
					"value": rowData["Commodity Unit Weight (16)"] // 무게
				},
				"unitPrice": {
					"amount": value, // 세관 가치
					"currency": "USD" // 통화
				}
			};

			commodities.push(commodity);
			var commodityValue = parseFloat(value) * parseFloat(rowData["Qty* (7)"]);
			totalCustomsValue += commodityValue;
		}

		// 총 세관 가치는 소수점 둘째자리까지 반올림
		// totalCustomsValue = Math.round(totalCustomsValue * 100) / 100;

		log("배송 번호 : " + groupId);
		log("수신인 이름 : " + fedexData["Recipient Contact Name* (35)"]);
		log("상품 정보 : " + JSON.stringify(commodities));
		log("총 세관 가치 : " + totalCustomsValue);


		fedexData["Total Customs Value"] = totalCustomsValue;

		var payloadOptions = getBody(fedexData, accessToken, commodities);
		payloadOptionsArray.push(payloadOptions);
	}

	// 배송검증 api
	// var shipmentUrl = "https://apis-sandbox.fedex.com/ship/v1/shipments/packages/validate";
	// log ("배송검증 API 호출 중");

	// 배송 api
	var shipmentUrl = "https://apis-sandbox.fedex.com/ship/v1/shipments";
	log ("배송 API 호출 중");

	var responses = [];
	for (var i = 0; i < payloadOptionsArray.length; i++) {
		var options = payloadOptionsArray[i];

		try {
			var httpResponse  = UrlFetchApp.fetch(shipmentUrl, options);

			log("배송 API 호출 성공")

			var parsedResponse = JSON.parse(httpResponse.getContentText());
			parsedResponse.groupId = options.groupId;
			responses.push(parsedResponse);
		} catch (e) {
			log("배송검증 API 호출 중 오류 발생: " + e);
			responses.push({ groupID: options.groupId, error: e.toString() });
		}
	}
	log("모든 FedEx 배송요청 완료 후 응답 분석 중");
	fedexHandler(responses);
}
