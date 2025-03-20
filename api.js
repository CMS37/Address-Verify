function callApi(addresses) {
	var apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
	if (!apiKey) {
	  Logger.log("API 키가 설정되어 있지 않습니다. 먼저 스크립트 속성에 API_KEY를 설정하세요.");
	  return;
	}

	var baseUrl = "https://api.addressy.com/Cleansing/International/Batch/v1.00/json4.ws";
	
	var requestData = addresses.map(function(address) {
		return {
			"Address1": address.street,
			"Address2": address.city,
			"AdminstrativeArea": address.state,
			"PostalCode": address.postalCode,
			"Country": address.country,
		};
	});

	var payload = {
		"Key": apiKey,
		"Options": {
			"Certify": true
		},
		"Addresses": requestData
	};

	var options = {
		"method": "post",
		"contentType": "application/json",
		"payload": JSON.stringify(payload)
	};

	try {
		var response = UrlFetchApp.fetch(baseUrl, options);
		var responseData = JSON.parse(response.getContentText());
		Logger.log("API 호출 성공");
		updateSheetWithResponse(addresses, responseData);
	} catch (e) {
		Logger.log("API 호출 중 오류 발생: " + e);
	}
}

function updateSheetWithResponse(addresses, responseData) {
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var sheet = ss.getActiveSheet();

	responseData.forEach(function(item, index) {
		Logger.log("index: " + index);
		Logger.log("item: " + JSON.stringify(item));
		var rowIndex = addresses[index].rowIndex;
		var isFail = false;
		
		if (!item.Matches || item.Matches.length === 0 || item.Matches[0].ID === "") {
			isFail = true;
		} else {
			var match = item.Matches[0];
		}

		// if (match.AQI === "E")
			// isFail = true;

		if (match.AVC) {
			var firstField = match.AVC.split("-")[0];

			if (firstField && (firstField.charAt(0) === "U" || firstField.charAt(0) === "R")) {
				isFail = true;
			}
		}
		if (isFail) {
			sheet.getRange(rowIndex, 17).setValue(false);
			sheet.getRange(rowIndex, 18).setValue("");
		} else {
			sheet.getRange(rowIndex, 17).setValue(true);
			sheet.getRange(rowIndex, 18).setValue(item.Matches[0].Address);
			sheet.getRange(rowIndex, 19).setValue(item.Matches[0].AQI);
			sheet.getRange(rowIndex, 20).setValue(item.Matches[0].AVC);
		}
	});
}