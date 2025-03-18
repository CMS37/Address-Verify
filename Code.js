function myFunction() {
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var sheet = ss.getActiveSheet();

	var lastRow = sheet.getLastRow();

	var dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
	var data = dataRange.getValues();

	var addresses = [];

	for (var i = 0; i < data.length; i++) {
		var row = data[i];
		var streetAddress = row[9];
		var city = row[12];
		var state = row[13];
		var postalCode = row[15];

		addresses.push({
			street: streetAddress,
			city: city,
			state: state,
			postalCode: postalCode
		});
	}

	Logger.log(addresses);
}
  