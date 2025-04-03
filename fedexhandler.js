function fedexHandler(responseData) {
	for (var i = 0; i < responseData.length; i++) {
		var resp = responseData[i];
		var transactionId = resp.transactionId || "N/A";

		var shipment = (resp.output && resp.output.transactionShipments && resp.output.transactionShipments.length > 0) ? resp.output.transactionShipments[0] : null;

		var trackingNumber = shipment && shipment.masterTrackingNumber ? shipment.masterTrackingNumber : "N/A";
		var alerts = shipment && shipment.alerts ? shipment.alerts : [];
		var errors = resp.errors || [];
		log("거래 ID : " + transactionId);
		log("배송 추적 번호 : " + trackingNumber);

		if (alerts.length === 0 && errors.length === 0) {
			log("배송 성공");
			continue;
		}

		for (var j = 0; j < errors.length; j++) {
			var error = errors[j];
			log("오류 " + (j + 1) + ": Code: " + error.code + ", Message: " + error.message);
			handleError(error.code);
		}
		for (var j = 0; j < alerts.length; j++) {
			var alert = alerts[j];
			log("알림 " + (j + 1) + ": Code: " + alert.code + ", Alert Type: " + alert.alertType + ", Message: " + alert.message);
		}
		// 응답 전문 보기
		var fullOutput = JSON.stringify(resp, null, 2);
		var chunkSize = 4000;
		for (var i = 0; i < fullOutput.length; i += chunkSize) {
			log(fullOutput.substring(i, i + chunkSize));
		}
	}
}

function handleError(errorCode) {
	switch (errorCode) {
		case "PHONENUMBER.TOO.LONG":
			log("전화번호가 너무 깁니다.");
			break;
		default:
			log("알 수 없는 오류: " + errorCode);
	}
}