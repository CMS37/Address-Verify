function onFormSubmit(e) {
	var formResponse = e.response;
	var itemResponses = formResponse.getItemResponses();
	
	var country = "";
	var address = "";
	var postalCode = "";
  
	for (var i = 0; i < itemResponses.length; i++) {
		var itemResponse = itemResponses[i];
		var title = itemResponse.getItem().getTitle();
		var response = itemResponse.getResponse();
	  
		if (title === "Your Country") {
		country = response;
		} else if (title === "Address") {
		address = response;
		} else if (title === "Postal code") {
		postalCode = response;
		}
	}
	Logger.log("Country: " + country);
	Logger.log("Address: " + address);
	Logger.log("Postal Code: " + postalCode);

	var destId = FormApp.getActiveForm().getDestinationId();
	if (!destId) {
		Logger.log("응답 스프레드시트가 연결되어 있지 않습니다.");
		return;
	}
	
	var ss = SpreadsheetApp.openById(destId);
	var sheet = ss.getSheets()[0];
	var lastRow = sheet.getLastRow();

	var addresses = [{
		"country": country,
		"address": address,
		"postalCode": postalCode,
		"rowIndex": lastRow
	}];

	callFormApi(addresses, sheet);
}
  