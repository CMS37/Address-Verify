const PHONENUMBER_ERROR = {
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

const EMAIL_ERROR = {
	"EMAILRECIPIENTS.EMAILADDRESS.INVALID": true, // 발송 서류 이메일 수취인에 올바른 이메일 주소를 기입해야 합니다. 업데이트 후 다시 시도하십시오.
	"EMAILLABELDETAIL.RECIPIENTS.MISSING": true, // 이메일 라벨 세부정보 또는 수취인이 누락되었습니다. 업데이트 후 다시 시도하십시오.
	"RECIPIENTS.CONTACTEMAILADDRESS.INVALID": true, // 수취인 이메일 주소가 잘못되었습니다. 업데이트 후 다시 시도하십시오.
}

const POSTALCODE_ERROR = {
	"COUNTRY.POSTALCODEORZIP.INVALID" : true, // 선택한 국가에 대한 우편 번호가 잘못되었습니다. 수정 후 다시 시도하십시오.
	"IMPORTEROFRECORD.POSTALCODE.INVALID": true, // 우편번호가 잘못되었습니다. 업데이트 후 다시 시도하십시오.
}

const ADDRESS_ERROR = {
	"STREETLINE1.EMPTY": true, // 주소가 비어 있습니다.
}

const NAME_ERROR = {
	"PERSONNAME.TOO.LONG": true, // 사람 이름이 너무 깁니다.
	"PERSONNAME.AND.CONTACTNAME.EMPTY": true, // 수취인 이름과 연락처 이름이 비어 있습니다.
}

const ADDRESS_STATE_ERROR = {
	"RECIPIENTS.ADDRESSSTATEORPROVINCECODE.MISMATCH": true // 주소 주/도 코드가 일치하지 않습니다.
}

const POSTALCODE_STATE_ERROR = {
	"IMPORTEROFRECORD.POSTALSTATE.MISMATCH": true // 우편번호가 해당 주소지 주(State)와 일치하지 않습니다. 업데이트 후 다시 시도하십시오.
}

const BATCH_BACKGROUND_COLOR = "#FF0000"; // 배치 오류 시트의 배경색

const queueBackgroundUpdate = (errorCode, groupId, headers, groupIdToRowMap, backgroundUpdates) => {
	const rowNums = groupIdToRowMap.get(groupId);
	if (!rowNums) return;

	let columnsToUpdate = [];

	if (PHONENUMBER_ERROR[errorCode]) {
		const telCol = headers.indexOf("Receipient Tel #* (15)") + 1;
		if (telCol > 0) columnsToUpdate.push(telCol);
	} else if (EMAIL_ERROR[errorCode]) {
		const emailCol = headers.indexOf("Recipient Email (60)") + 1;
		if (emailCol > 0) columnsToUpdate.push(emailCol);
	} else if (POSTALCODE_ERROR[errorCode]) {
		const postalCol = headers.indexOf("Recipient Zip Code* (10)") + 1;
		if (postalCol > 0) columnsToUpdate.push(postalCol);
	} else if (ADDRESS_ERROR[errorCode]) {
		const addressCol = headers.indexOf("Recipient Address Line 1* (35)") + 1;
		if (addressCol > 0) columnsToUpdate.push(addressCol);
	} else if (NAME_ERROR[errorCode]) {
		const nameCol = headers.indexOf("Recipient Contact Name* (35)") + 1;
		if (nameCol > 0) columnsToUpdate.push(nameCol);
	} else if (ADDRESS_STATE_ERROR[errorCode]) {
		const addressCol = headers.indexOf("Recipient Address Line 1* (35)") + 1;
		const stateCol = headers.indexOf("State code") + 1;
		if (addressCol > 0) columnsToUpdate.push(addressCol);
		if (stateCol > 0) columnsToUpdate.push(stateCol);
	} else if (POSTALCODE_STATE_ERROR[errorCode]) {
		const postalCol = headers.indexOf("Recipient Zip Code* (10)") + 1;
		const stateCol = headers.indexOf("State code") + 1;
		if (postalCol > 0) columnsToUpdate.push(postalCol);
		if (stateCol > 0) columnsToUpdate.push(stateCol);
	} else {
		log(`${groupId} : 알 수 없는 오류 발생 - 코드: ${errorCode}`);
	}

	columnsToUpdate.forEach(col => {
		if (!backgroundUpdates[col]) {
			backgroundUpdates[col] = new Set();
		}
		rowNums.forEach(rowNum => backgroundUpdates[col].add(rowNum));
	});
};

const updateBatchBackgrounds = (sheet, backgroundUpdates) => {
	const lastRow = sheet.getLastRow();
	Object.keys(backgroundUpdates).forEach(colStr => {
		const col = parseInt(colStr);
		const range = sheet.getRange(1, col, lastRow, 1);
		const backgrounds = range.getBackgrounds();
		backgroundUpdates[col].forEach(rowNum => {
		if (rowNum - 1 < backgrounds.length) {
			backgrounds[rowNum - 1][0] = BATCH_BACKGROUND_COLOR;
		}
		});
		range.setBackgrounds(backgrounds);
	});
};

const fedexHandler = (responseData, sheet, headers, groupIdData) => {
	if (!sheet) {
		log("페덱스 시트를 찾을 수 없습니다.");
		return;
	}

	const groupIdToRowMap = new Map();
	groupIdData.forEach((row, index) => {
		if (row[0]) {
			if (groupIdToRowMap.has(row[0])) {
				groupIdToRowMap.get(row[0]).push(index + 1);
			} else {
				groupIdToRowMap.set(row[0], [index + 1]);
			}
		}
	});
	
	const backgroundUpdates = {};

	responseData.forEach(resp => {
		const groupId = resp.groupId || "N/A";
		const transactionId = resp.transactionId || "N/A";
		log(`배송 ID: ${groupId}, 거래 ID: ${transactionId}`);

		log(`응답 내용 : ${JSON.stringify(resp)}`);
		
		if (!resp.errors && !(resp.output && resp.output.alerts)) {
			log(`${groupId} : 배송이 성공적으로 완료 되었습니다`);
			return;
		}
		
		if (resp.errors) {
			resp.errors.forEach(error => {
				log(`${groupId} 오류코드 : ${error.code}`);
				queueBackgroundUpdate(error.code, groupId, headers, groupIdToRowMap, backgroundUpdates);
			});
		}
	});
	
	updateBatchBackgrounds(sheet, backgroundUpdates);
};