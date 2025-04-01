function main() {
	var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
	var lastRow = sheet.getLastRow();
	var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

	var countryCol = headers.indexOf("Your country of residence") + 1;
	var addressCol = headers.indexOf("Street address") + 1;
	var postalCol = headers.indexOf("Postal code") + 1;
	var cityCol = headers.indexOf("City") + 1;
	var stateCol = headers.indexOf("State / Povince") + 1;

	if (countryCol === 0 || addressCol === 0 || postalCol === 0) {
		Logger.log("필수 열을 찾을 수 없습니다.");
		return;
	}

	var dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
	var data = dataRange.getValues();

	var targets = [];

	for (var i = 0; i < data.length; i++) {
		var row = data[i];
		targets.push({
			country: row[countryCol - 1],
			address: row[addressCol - 1],
			postalCode: row[postalCol - 1],
			city: row[cityCol - 1],
			state: row[stateCol - 1],
			rowIndex: i + 2
		});
	}

	if (targets.length === 0) {
		Logger.log("검증할 주소가 없습니다.");
		return;
	}

	callApi(targets, sheet);
}
