var PHONENUMBER_ERROR = {
	"PHONENUMBER.TOO.LONG": true, // 전화 번호가 너무 깁니다.
	"PHONENUMBER.TOO.SHORT": true, // 전화 번호가 너무 짧습니다.
	"PHONE.NUMBER.INVALID": true, // 전화번호가 유효하지 않습니다. 업데이트 후 다시 시도하십시오.
	"PHONE.NUMBER.REQUIRED": true, // 전화번호를 입력해야 합니다. 업데이트 후 다시 시도하십시오.
	"RECIPIENTCONTACT.PHONENUMBER.INVALID": true, //수취인 전화번호 형식과 국가 코드가 일치하지 않아 편리한 배송 옵션을 이용할 수 없습니다. 계속 진행하려면 유효한 휴대전화 번호를 알려주세요.
	"SHIPMENT.SHIPPERPHONENUMBER.REQUIRED": true, // 전화번호를 입력해야 합니다.
	"TELEPHONE.NUMBER.REQUIRED": true, // 전화번호를 입력해야 합니다. 업데이트 후 다시 시도하십시오.
	"SHIPPER.CONTACTPHONENUMBER.INVALID": true, // 유효한 전화번호를 입력해야 합니다. 업데이트 후 다시 시도하십시오.
	"RECIPIENT.CONTACTPHONENUMBER.INVALID": true, // 요청된 발송물의 수취인 전화번호가 유효하지 않습니다. 업데이트 후 다시 시도하십시오.
}

var EMAIL_ERROR = {
	"EMAILRECIPIENTS.EMAILADDRESS.INVALID": true, // 발송 서류 이메일 수취인에 올바른 이메일 주소를 기입해야 합니다. 업데이트 후 다시 시도하십시오.
	"EMAILLABELDETAIL.RECIPIENTS.MISSING": true, // 이메일 라벨 세부정보 또는 수취인이 누락되었습니다. 업데이트 후 다시 시도하십시오.
	"RECIPIENTS.CONTACTEMAILADDRESS.INVALID": true, // 수취인 이메일 주소가 잘못되었습니다. 업데이트 후 다시 시도하십시오.
}

var POSTALCODE_ERROR = {
	"COUNTRY.POSTALCODEORZIP.INVALID" : true, // 선택한 국가에 대한 우편 번호가 잘못되었습니다. 수정 후 다시 시도하십시오.
	"IMPORTEROFRECORD.POSTALCODE.INVALID": true, // 우편번호가 잘못되었습니다. 업데이트 후 다시 시도하십시오.
}

var ADDRESS_ERROR = {
	"STREETLINE1.EMPTY": true, // 주소가 비어 있습니다.
}

var NAME_ERROR = {
	"PERSONNAME.TOO.LONG": true, // 사람 이름이 너무 깁니다.
	"PERSONNAME.AND.CONTACTNAME.EMPTY": true, // 수취인 이름과 연락처 이름이 비어 있습니다.
}

var ADDRESS_STATE_ERROR = {
	"RECIPIENTS.ADDRESSSTATEORPROVINCECODE.MISMATCH": true // 주소 주/도 코드가 일치하지 않습니다.
}

var POSTALCODE_STATE_ERROR = {
	"IMPORTEROFRECORD.POSTALSTATE.MISMATCH": true // 우편번호가 해당 주소지 주(State)와 일치하지 않습니다. 업데이트 후 다시 시도하십시오.
}





function fedexHandler(responseData) {
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var fedexSheet = ss.getSheetByName("페덱스");

	if (!fedexSheet) {
		log("페덱스 시트를 찾을 수 없습니다.");
		return;
	}

	var headers = fedexSheet.getRange(1, 1, 1, fedexSheet.getLastColumn()).getValues()[0];
  
	for (var i = 0; i < responseData.length; i++) {
		var resp = responseData[i];
		var groupId = resp.groupId || "N/A";
		var transactionId = resp.transactionId || "N/A";

		// var fullOutput = JSON.stringify(resp, null, 2);
		// var chunkSize = 4000;
		// for (var i = 0; i < fullOutput.length; i += chunkSize) {
		// 	log(fullOutput.substring(i, i + chunkSize));
		// }
		
		log("배송 ID: " + groupId + ", 거래 ID: " + transactionId);

		if(!resp.errors && !resp.output.alerts) {
			log (groupId + " : 배송이 성공적으로 완료 되었습니다")
			continue;
		}

		if (resp.errors) {
			for (var j = 0; j < resp.errors.length; j++) {
				var error = resp.errors[j];
				log(groupId + " 오류코드 : " + error.code);
				handleError(error.code, groupId, fedexSheet, headers);
			}
		}
	}
}
	
function handleError(errorCode, groupId, fedexSheet, headers) {

	var rowNum = getRowByGroupId(groupId, fedexSheet);

	switch (true) {
		case PHONENUMBER_ERROR[errorCode] === true:
			var telColIndex = headers.indexOf("Receipient Tel #* (15)") + 1;
			if (rowNum && telColIndex > 0) {
				fedexSheet.getRange(rowNum, telColIndex).setBackground("#FF0000");
			}
			break;
		case EMAIL_ERROR[errorCode] === true:
			var emailColIndex = headers.indexOf("Recipient Email (60)") + 1;
			if (rowNum && emailColIndex > 0) {
				fedexSheet.getRange(rowNum, emailColIndex).setBackground("#FF0000");
			}
			break;

		case POSTALCODE_ERROR[errorCode] === true:
			var postalCodeColIndex = headers.indexOf("Recipient Zip Code* (10)") + 1;
			if (rowNum && postalCodeColIndex > 0) {
				fedexSheet.getRange(rowNum, postalCodeColIndex).setBackground("#FF0000");
			}
			break;
		case ADDRESS_ERROR[errorCode] === true:
			var addressColIndex = headers.indexOf("Recipient Address Line 1* (35)") + 1;
			if (rowNum && addressColIndex > 0) {
				fedexSheet.getRange(rowNum, addressColIndex).setBackground("#FF0000");
			}
			break;
		case NAME_ERROR[errorCode] === true:
			var nameColIndex = headers.indexOf("Recipient Contact Name* (35)") + 1;
			if (rowNum && nameColIndex > 0) {
				fedexSheet.getRange(rowNum, nameColIndex).setBackground("#FF0000");
			}
			break;
		
		case ADDRESS_STATE_ERROR[errorCode] === true:
			var addressColIndex = headers.indexOf("Recipient Address Line 1* (35)") + 1;
			var stateColIndex = headers.indexOf("State code") + 1;
			if (rowNum && addressColIndex > 0) {
				fedexSheet.getRange(rowNum, addressColIndex).setBackground("#FF0000");
			}
			if (rowNum && stateColIndex > 0) {
				fedexSheet.getRange(rowNum, stateColIndex).setBackground("#FF0000");
			}
			break;
		
		case POSTALCODE_STATE_ERROR[errorCode] === true:
			var postalCodeColIndex = headers.indexOf("Recipient Zip Code* (10)") + 1;
			var stateColIndex = headers.indexOf("State code") + 1;
			if (rowNum && postalCodeColIndex > 0) {
				fedexSheet.getRange(rowNum, postalCodeColIndex).setBackground("#FF0000");
			}
			if (rowNum && stateColIndex > 0) {
				fedexSheet.getRange(rowNum, stateColIndex).setBackground("#FF0000");
			}
			break;


		default:
			log(groupId + " : 알 수 없는 오류 발생 - 코드: " + errorCode);
			break;
	}
}

function handleAlerts(alerts, groupId, fedexSheet) {

}

function getRowByGroupId(groupId, sheet) {
  var lastRow = sheet.getLastRow();
  var data = sheet.getRange(1, 1, lastRow, 1).getValues();
  for (var i = 0; i < data.length; i++) {
	if (data[i][0] == groupId) {
	  return i + 1;
	}
  }
  return null;
}