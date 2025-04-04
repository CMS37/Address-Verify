const main = () => {
	const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
	const lastRow = sheet.getLastRow();
	const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
	const countryCol = headers.indexOf("Your country of residence") + 1;
	const addressCol = headers.indexOf("Street address") + 1;
	const postalCol = headers.indexOf("Postal code") + 1;
	const cityCol = headers.indexOf("City") + 1;
	const stateCol = headers.indexOf("State / Povince") + 1;
  
	if (countryCol === 0 || addressCol === 0 || postalCol === 0) {
		log("필수 열을 찾을 수 없습니다.");
		return;
	}
  
	// 데이터 영역을 한 번만 읽어 옵니다.
	const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  
	const targets = data.map((row, i) => ({
		country: row[countryCol - 1],
		address: row[addressCol - 1],
		postalCode: row[postalCol - 1],
		city: row[cityCol - 1],
		state: row[stateCol - 1],
		rowIndex: i + 2
	}));
  
	if (targets.length === 0) {
		log("검증할 주소가 없습니다.");
		return;
	}
  
	callApi(targets, sheet);
};
  