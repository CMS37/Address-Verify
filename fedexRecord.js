const recordFedex = (match, responseSheet, rowIndex, fedexSheet, isFail) => {
	const fedexHeaders = fedexSheet.getRange(1, 1, 1, fedexSheet.getLastColumn()).getValues()[0];
	const responseHeaders = responseSheet.getRange(1, 1, 1, responseSheet.getLastColumn()).getValues()[0];

	const telCol = responseHeaders.indexOf("Your Phone Number\n※Without country code") + 1;
	const mailCol = responseHeaders.indexOf("e-mail (ex. @gmail.com/Please write this email address so that we can check record )") + 1;

	const tel = telCol > 0 ? responseSheet.getRange(rowIndex, telCol).getValue() : "";
	const mail = mailCol > 0 ? responseSheet.getRange(rowIndex, mailCol).getValue() : "";
	
	const fedexRow = fedexHeaders.map(header => {
		header = header.trim();

		switch (header) {
			case "Recipient Address Line 1* (35)":
				return match.Address1 || "";
			case "Recipient Address Line 2* (35)":
				const address2 = (match.Address2 || "").replace(/-\d{4}$/, "");
				return address2;
			case "Recipient Address Line 3 (35) ) - v13":
				return "";
			case "Recipient City* (35)":
				return match.Locality || "";
			case "State code":
				return match.AdministrativeArea || "";
			case "Recipient Country Code* (2)":
				return match.Country || "";
			case "Recipient Zip Code* (10)":
				const postal = match.PostalCodePrimary ? match.PostalCodePrimary.toString() : "";
				return "'" + postal;
			case "Receipient Tel #* (15)":
				return tel || "";
			case "Recipient Email (60)":
				return mail || "";
			default:
				return "";
		}
	});
	
	fedexSheet.appendRow(fedexRow);
	
	if (isFail) {
		const lastRow = fedexSheet.getLastRow();
		const colCount = fedexSheet.getLastColumn();
		fedexSheet.getRange(lastRow, 1, 1, colCount).setBackground("#FF0000");
	}
	
	Logger.log("📦 FedEx 양식 시트에 주소 정보가 추가되었습니다.");
};
  