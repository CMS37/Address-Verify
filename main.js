const main = () => {
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const sheet = ss.getActiveSheet();
	const lastRow = sheet.getLastRow();

	const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
	const getColIndex = headerName => headers.indexOf(headerName) + 1;
  
	const countryCol = getColIndex("Your country of residence");
	const addressCol = getColIndex("Street address");
	const postalCol = getColIndex("Postal code");
	const cityCol = getColIndex("City");
	const stateCol = getColIndex("State / Povince");

	if (countryCol === 0 || addressCol === 0 || postalCol === 0) {
	  log("필수 열을 찾을 수 없습니다.");
	  return;
	}

	const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();

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
