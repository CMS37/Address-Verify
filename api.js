function callApi(addresses, sheet) {
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
			"PostalCode": address.postalCode,
			"Locality": address.city,
			"AdministrativeArea": address.state
		};
	});

	var payload = {
		"Key": apiKey,
		"Options": {
			"Certify": true,
			"ServerOptions": {
				"OutputScript": "EN"
			}
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

		return updateSheetWithResponse(addresses, responseData, sheet);
	} catch (e) {
		Logger.log("API 호출 중 오류 발생: " + e);
	}
}

function updateSheetWithResponse(addresses, responseData, sheet) {
	if (!Array.isArray(responseData) || responseData.length === 0) {
		Logger.log("API 응답이 비어 있습니다.");
		return;
	}

	var addressCol = findHeader(sheet, "검증 주소");

	var lastRow = sheet.getLastRow();
	var numRows = lastRow - 1;

	var addrRange = sheet.getRange(2, addressCol, numRows, 1);

	var addrData = addrRange.getValues();

	var fedexSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("페덱스");

	if (!fedexSheet) {
		Logger.log("페덱스 시트를 찾을 수 없습니다.");
	}

	for (var i = 0; i < responseData.length; i++) {
		var item = responseData[i];
		var addrMeta = addresses[i];

		if (!addrMeta) continue;
		
		var rowIndex = addrMeta.rowIndex;
		var listIndex = rowIndex - 2;
		
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

		if (isFail || !match) {
			addrData[listIndex][0] = "Fail";
			Logger.log("주소 검증 실패");
			Logger.log("Match: " + JSON.stringify(match));

		} else {
			addrData[listIndex][0] = match.Address;

			if (fedexSheet) {
				recordFedex(match, sheet, rowIndex, fedexSheet);
			}
		}
	}
	addrRange.setValues(addrData);
}

function findHeader(sheet, headerName) {
	var lastCol = sheet.getLastColumn();
	var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
	var colIndex = headers.indexOf(headerName) + 1;
	
	if (colIndex === 0) {
	  colIndex = headers.length + 1;
	  sheet.getRange(1, colIndex).setValue(headerName);
	}
	return colIndex;
  }