function recordFedex(match, fedexSheet) {
	var headers = fedexSheet.getRange(1, 1, 1, fedexSheet.getLastColumn()).getValues()[0];
	var fedexRow = [];

	Logger.log("페덱스 양식 추가 중...");
	Logger.log("Match: " + JSON.stringify(match));
	Logger.log("Headers: " + JSON.stringify(headers));
	for (var i = 0; i < headers.length; i++) {
		var header = headers[i].trim();
		switch (header) {
			case "Recipient Address Line 1* (35)":
				fedexRow.push(match.Address1);
				break;
			case "Recipient Address Line 2* (35)":
				fedexRow.push(match.Address2);
				break;
			case "Recipient Address Line 3 (35) ) - v13":
				fedexRow.push("");
				break;
			case "Recipient City* (35)":
				fedexRow.push(match.Locality || "");
				break;
			case "State code":
				fedexRow.push(match.AdministrativeArea || "");
				break;
			case "Recipient Country Code* (2)":
				fedexRow.push(match.Country || "");
				break;
			case "Recipient Zip Code* (10)":
				fedexRow.push(match.PostalCode || "");
				break;
			default:
				fedexRow.push("");
				break;
		}
	}

	fedexSheet.appendRow(fedexRow);
	Logger.log("페덱스 양식 추가 완료.");
}
