const callApi = (addresses, sheet) => {
	const apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
	if (!apiKey) {
		log("API 키가 설정되어 있지 않습니다. 먼저 스크립트 속성에 API_KEY를 설정하세요.");
		return;
	}

	const baseUrl = "https://api.addressy.com/Cleansing/International/Batch/v1.00/json4.ws";

	const payloadAddresses = addresses.map(addr => ({
		Country: addr.country,
		Address1: addr.address,
		PostalCode: addr.postalCode,
		Locality: addr.city,
		AdministrativeArea: addr.state
	}));

	const payload = {
		Key: apiKey,
		Options: { Certify: true },
		Addresses: payloadAddresses
	};

	const options = {
		method: "post",
		contentType: "application/json",
		payload: JSON.stringify(payload),
	};

	try {
		const response = UrlFetchApp.fetch(baseUrl, options);
		const apiResponse = JSON.parse(response.getContentText());
		addresses.forEach((addr, i) => {
			addr.response = apiResponse[i];
		});

		log("API 호출 성공");
	} catch (e) {
		log(`API 호출 중 오류 발생: ${e}`);
	}

	updateSheetWithResponse(addresses, sheet);
};


const updateSheetWithResponse = (addresses, sheet) => {
	const addressCol = findHeader(sheet, "검증 주소");
	const lastRow = sheet.getLastRow();
	const numRows = lastRow - 1;
	const addrRange = sheet.getRange(2, addressCol, numRows, 1);
	const addrData = addrRange.getValues();
	
	const fedexSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("페덱스");
	if (!fedexSheet) {
		log("페덱스 시트를 찾을 수 없습니다.");
	}
	
	const fedexRowsToAppend = [];
	
	addresses.forEach((addr, i) => {
		if (!addr) return;
		
		const rowIndex = addr.rowIndex;
		const listIndex = rowIndex - 2;
		let isFail = false;

		if (!addr.response) {
			isFail = true;
			addrData[listIndex][0] = "Fail - 응답이 비어있음";
			log(`행 ${rowIndex}: 주소 검증 실패 - 응답이 비어있음`);
		} else {
			const match = (addr.response.Matches && addr.response.Matches[0]) || null;

			if (!match || !match.Address || match.Address.trim() === "") {
				isFail = true;
				addrData[listIndex][0] = "Fail - 주소 정보가 없음";
				log(`행 ${rowIndex}: 주소 검증 실패 - Matches에 주소 정보가 없음`);
			} else if (match.AVC && (match.AVC.charAt(0) === "U" || match.AVC.charAt(0) === "R")) {
				isFail = true;
				addrData[listIndex][0] = "Fail - 검증등급이 U/R ";
				log(`행 ${rowIndex}: 주소 검증 실패 - AVC가 "${match.AVC}" (U/R로 시작)`);
			} else {
				addrData[listIndex][0] = match.Address;
			}
		}

		if (fedexSheet && !isFail) {
			const fedexRow = createFedexRow(addr.response.Matches[0], sheet, fedexSheet, rowIndex, isFail);
			fedexRowsToAppend.push(fedexRow);
		}
	});

	addrRange.setValues(addrData);

	if (fedexSheet && fedexRowsToAppend.length > 0) {
		const startRow = fedexSheet.getLastRow() + 1;
		const numCols = fedexRowsToAppend[0].length;
		fedexSheet.getRange(startRow, 1, fedexRowsToAppend.length, numCols).setValues(fedexRowsToAppend);
	}
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
