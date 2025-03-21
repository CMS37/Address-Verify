	function callFormApi(addresses, sheet) {
	var apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
	if (!apiKey) {
		Logger.log("API 키가 설정되어 있지 않습니다. 먼저 스크립트 속성에 API_KEY를 설정하세요.");
		return;
	}

	var baseUrl = "https://api.addressy.com/Cleansing/International/Batch/v1.00/json4.ws";

	var requestData = addresses.map(function(address) {
		return {
			"Country": address.country,
			"Address1": address.address,
			"PostalCode": address.postalCode
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

	Logger.log("API Request Options: " + JSON.stringify(options));

	try {
		var response = UrlFetchApp.fetch(baseUrl, options);
		var responseData = JSON.parse(response.getContentText());
		Logger.log("API 호출 성공, 응답: " + JSON.stringify(responseData));
		updateSheetWithResponse(addresses, responseData, sheet);
	} catch (e) {
		Logger.log("API 호출 중 오류 발생: " + e);
	}
}

function updateSheetWithResponse(addresses, responseData, sheet) {
	var item = responseData[0];
	var rowIndex = addresses[0].rowIndex;
	var isFail = false;
	var match = null;

	if (item.Matches && item.Matches.length > 0) {
		match = item.Matches[0];
	} else {
		isFail = true;
	}

	if (match && match.AVC) {
		var firstField = match.AVC.split("-")[0];
		if (firstField && (firstField.charAt(0) === "U" || firstField.charAt(0) === "R")) {
			isFail = true;
		}
	}

	var addressCol = findOrCreateColumnByHeader(sheet, "검증 주소");
	var aqiCol = findOrCreateColumnByHeader(sheet, "AQI");
	var avcCol = findOrCreateColumnByHeader(sheet, "AVC");

	if (isFail) {
		sheet.getRange(rowIndex, addressCol).setValue("Fail");
		sheet.getRange(rowIndex, aqiCol).setValue(match?.AQI || "");
		sheet.getRange(rowIndex, avcCol).setValue(match?.AVC || "");
	} else {
		sheet.getRange(rowIndex, addressCol).setValue(match.Address);
		sheet.getRange(rowIndex, aqiCol).setValue(match.AQI);
		sheet.getRange(rowIndex, avcCol).setValue(match.AVC);
	}
}

function findOrCreateColumnByHeader(sheet, headerName) {
	var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
	var colIndex = headers.indexOf(headerName) + 1;
	if (colIndex === 0) {
		colIndex = headers.length + 1;
		sheet.getRange(1, colIndex).setValue(headerName);
	}
	return colIndex;
}