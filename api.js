const callApi = (addresses, sheet) => {
	const apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
	if (!apiKey) {
		log("API 키가 설정되어 있지 않습니다. 먼저 스크립트 속성에 API_KEY를 설정하세요.");
		return;
	}

	const baseUrl = "https://api.addressy.com/Cleansing/International/Batch/v1.00/json4.ws";
	const requestData = addresses.map(address => ({
		Country: address.country,
		Address1: address.address,
		PostalCode: address.postalCode,
		Locality: address.city,
		AdministrativeArea: address.state
	}));

	const payload = {
		Key: apiKey,
		Options: {
			Certify: true,
		},
		Addresses: requestData
	};
  
	const options = {
		method: "post",
		contentType: "application/json",
		payload: JSON.stringify(payload)
	};
  
	log(`API Request Options: ${JSON.stringify(options)}`);
	
	try {
		const response = UrlFetchApp.fetch(baseUrl, options);
		const responseData = JSON.parse(response.getContentText());
		log(`API 호출 성공, 응답: ${JSON.stringify(responseData)}`);
		return updateSheetWithResponse(addresses, responseData, sheet);
	} catch (e) {
		log(`API 호출 중 오류 발생: ${e}`);
	}
  };
  
  const updateSheetWithResponse = (addresses, responseData, sheet) => {
	if (!Array.isArray(responseData) || responseData.length === 0) {
		log("API 응답이 비어 있습니다.");
		return;
	}
  
	const addressCol = findHeader(sheet, "검증 주소");
	const lastRow = sheet.getLastRow();
	const numRows = lastRow - 1;
	const addrRange = sheet.getRange(2, addressCol, numRows, 1);
	const addrData = addrRange.getValues();
	const fedexSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("페덱스");
  
	if (!fedexSheet) {
		log("페덱스 시트를 찾을 수 없습니다.");
	}
  
	responseData.forEach((item, i) => {
		const addrMeta = addresses[i];
		if (!addrMeta) return;
		
		const rowIndex = addrMeta.rowIndex;
		const listIndex = rowIndex - 2;
		let isFail = false;
		let match = null;
		
		if (item.Matches && item.Matches.length > 0) {
			match = item.Matches[0];
		} else {
			isFail = true;
		}
		
		if (match && match.AVC) {
			const firstField = match.AVC.split("-")[0];
			if (firstField && (firstField.charAt(0) === "U" || firstField.charAt(0) === "R")) {
				log("주소 검증 실패");
				isFail = true;
				addrData[listIndex][0] = "Fail";
				match = {};
			}
		}
	  
		if (!match) {
			log("주소 검증 실패");
			addrData[listIndex][0] = "Fail";
			match = {};
		} else {
			addrData[listIndex][0] = match.Address;
		}
	  
		if (fedexSheet) {
			recordFedex(match, sheet, rowIndex, fedexSheet, isFail);
		}
	});
	addrRange.setValues(addrData);
};
  
const findHeader = (sheet, headerName) => {
	const lastCol = sheet.getLastColumn();
	const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
	let colIndex = headers.indexOf(headerName) + 1;
	
	if (colIndex === 0) {
		colIndex = headers.length + 1;
		sheet.getRange(1, colIndex).setValue(headerName);
	}
	return colIndex;
};
  