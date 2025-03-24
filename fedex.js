function recordFedex(match, responseSheet, rowIndex, fedexSheet) {
	var fedexHeaders = fedexSheet.getRange(1, 1, 1, fedexSheet.getLastColumn()).getValues()[0];
	var responseHeaders = responseSheet.getRange(1, 1, 1, responseSheet.getLastColumn()).getValues()[0];
	var telCol = responseHeaders.indexOf("Your Phone Number\n※Without country code") + 1;
	var mailCol = responseHeaders.indexOf("e-mail (ex. @gmail.com/Please write this email address so that we can check record )") + 1;
	
	var tel = "";
	var mail = "";
	if (telCol > 0) {
	  tel = responseSheet.getRange(rowIndex, telCol).getValue();
	}
	if (mailCol > 0) {
	  mail = responseSheet.getRange(rowIndex, mailCol).getValue();
	}
	
	// Logger.log("📦 FedEx 양식 시트에 주소 정보를 추가합니다.");
	// Logger.log("📦 주소 정보: " + JSON.stringify(match));
	// Logger.log("📦 전화번호: " + tel);
	// Logger.log("📦 이메일: " + mail);
  
	var fedexRow = [];
	
	// fedexHeaders를 사용하여 fedexRow 배열 구성
	for (var i = 0; i < fedexHeaders.length; i++) {
	  var header = fedexHeaders[i].trim();
	  switch (header) {
		case "Recipient Address Line 1* (35)":
		  fedexRow.push(match.Address1 || "");
		  break;
		case "Recipient Address Line 2* (35)":
		  fedexRow.push(match.Address2 || "");
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
		case "Receipient Tel #* (15)":
		  fedexRow.push(tel || "");
		  break;
		case "Recipient Email (60)":
		  fedexRow.push(mail || "");
		  break;
		default:
		  fedexRow.push("");
		  break;
	  }
	}
	
	fedexSheet.appendRow(fedexRow);
	Logger.log("📦 FedEx 양식 시트에 주소 정보가 추가되었습니다.");
  }
  