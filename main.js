function main() {
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var sheet = ss.getActiveSheet();
	var lastRow = sheet.getLastRow();

	var dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
	var data = dataRange.getValues();

	var addresses = [];

	for (var i = 0; i < data.length; i++) {
		var row = data[i];
		addresses.push({
			country: row[6],
			street: row[9],
			city: row[12],
			state: row[13],
			postalCode: row[15],
			rowIndex: i + 2
		});
	  }
	callApi(addresses);
}
  