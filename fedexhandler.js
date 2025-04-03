function fedexHandler(responseData) {
	for (var i = 0; i < responseData.length; i++) {
		var resp = responseData[i];
		var transactionId = resp.transactionId || "N/A";

		var shipment = (resp.output && resp.output.transactionShipments && resp.output.transactionShipments.length > 0) ? resp.output.transactionShipments[0] : null;

		var trackingNumber = shipment && shipment.masterTrackingNumber ? shipment.masterTrackingNumber : "N/A";
		var alerts = shipment && shipment.alerts ? shipment.alerts : [];
		
		log("거래 ID : " + transactionId);
		log("배송 추적 번호 : " + trackingNumber);
		for (var j = 0; j < alerts.length; j++) {
			var alert = alerts[j];
			log("결과 " + (j + 1) + ": Code: " + alert.code + ", Alert Type: " + alert.alertType + ", Message: " + alert.message);
		}
		var fullOutput = JSON.stringify(resp, null, 2);
		var chunkSize = 4000;
		for (var i = 0; i < fullOutput.length; i += chunkSize) {
			log(fullOutput.substring(i, i + chunkSize));
		}
	}
}