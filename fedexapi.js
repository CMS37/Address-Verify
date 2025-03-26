function getFedExOAuthToken() {
	var grantType = "client_credentials"
	var clientId = "YOUR_CLIENT_ID";
	var clientSecret = "YOUR_CLIENT_SECRET";

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

function validataShipment(accessToken) {
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
	}
	if (!fedexData) {
		Logger.log("페덱스 데이터가 없습니다.");
		return null;
	}

	var shipmentUrl = "https://apis-sandbox.fedex.com/ship/v1/shipments/packages/validate";

	var payload = {
		"requestedShipment": {
			"shipper": { //발송인 정보 추후 추가 데이터 필요한 곳
				"contact": {
					"personName": "TEST_Sender_Name",
					"phoneNumber": "9012704839",
					"companyName": "TEST_APISENDER-WSXI6000"
				},
				"address": {
					"city": "Seoul",
					"stateOrProvinceCode": "KR",
					"postalCode": "05224",
					"countryCode": "KR",
					"residential": false,
					"streetLines": [
						"TEST_Sender_Address_Line1",
						"TEST_Sender_Address_Line2"
					]
				}
			},
			"recipients": [{ //수취인 정보 페덱스시트지에서 추출 가능
				"contact": {
					"personName": fedexData["Recipient Contact Name* (35)"] || "TEST_Recipient_Name",
					"phoneNumber": fedexData["Receipient Tel #* (15)"] || "9018549266",
					"companyName": fedexData["Recipient Company Name (35)"] || "TEST_APIRECIPIENT-WSXI6000"
				},
				"address": {
					"city": fedexData["Recipient City* (35)"] || "PITTSBURGH",
					"stateOrProvinceCode": fedexData["State code"] || "PA",
					"postalCode": fedexData["Recipient Zip Code* (10)"] || "15220",
					"countryCode": fedexData["Recipient Country Code* (2)"] || "US",
					"residential": true,
					"streetLines": [
					fedexData["Recipient Address Line 1* (35)"] || "45 NOBLESTOWN RD",
					fedexData["Recipient Address Line 2* (35)"] || ""
					]
				}
			}],
			"shipDatestamp": "2022-11-07", //배송 날짜 (필수x)
			"pickupType": "DROPOFF_AT_FEDEX_LOCATION", //픽업 유형 (???)
			"serviceType": "FEDEX_INTERNATIONAL_PRIORITY_EXPRESS", // 서비스 유형 (FedEx International Priority end-of-day = ?)
			"packagingType": "YOUR_PACKAGING", // 패키지 유형 (자사패키징 사용)
			"blockInsightVisibility": false, // ?
			"shippingChargesPayment": { //지불인 사양?
				"paymentType": "SENDER"
			},
			"labelSpecification": { // 라벨 스펙
				"imageType": "PDF",
				"labelStockType": "PAPER_7X475"
			},
			"requestedPackageLineItems": [ //패키지별 중량
			  {
				"weight": {
					"units": "LB",
					"value": fedexData["Shipment Weight* (13)"] || "50"
				}
			  }
			],
			"customsClearanceDetail": { //통관 정보
				"totalCustomsValue": {
				"amount": 12.45,
				"currency": "USD"
				}
			},
		  },
		  "accountNumber": {
			"value": "740561073"
		  }
	};

	var options = {
		"method": "post",
		"conteType": "application/json",
		"headers": {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + accessToken,
			"X-locale" : "ko-KR",
			"x-customer-transaction-id": "VT250325GW001" // 고객번호?
		},
		"payload": JSON.stringify(payload),
		"muteHttpExceptions": true
	};
	
	try {
		var response = UrlFetchApp.fetch(shipmentUrl, options);
		var responseData = JSON.parse(response.getContentText());

		Logger.log ("Validate Shipment Data 성공");
		Logger.log(responseData);

		return responseData;
	} catch (e) {
		Logger.log("Validate Shipment Data 실패");
		Logger.log(e);

		return null;
	}
}
