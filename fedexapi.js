const getFedExOAuthToken = () => {
	const grantType = "client_credentials";
	const clientId = "l7b543253d524c449e8588a7c12941a57d";
	const clientSecret = "b37fd2fa1c9147b0a277a339cfb227ac";
	const tokenUrl = "https://apis-sandbox.fedex.com/oauth/token";

	const payload = `grant_type=${encodeURIComponent(grantType)}&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`;
	const options = {
		method: "post",
		contentType: "application/x-www-form-urlencoded",
		payload
	};

	try {
		const response = UrlFetchApp.fetch(tokenUrl, options);
		return JSON.parse(response.getContentText());
	} catch (e) {
		log(`FedEx OAuth 토큰 발급 중 오류 발생: ${e}`);
		return null;
	}
};

const validataShipment = (accessToken) => {
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const fedexSheet = ss.getSheetByName("페덱스");

	if (!fedexSheet) {
		log("페덱스 시트를 찾을 수 없습니다.");
		return null;
	}

	const headers = fedexSheet.getRange(1, 1, 1, fedexSheet.getLastColumn()).getValues()[0];
	const dataRows = fedexSheet.getRange(4, 1, fedexSheet.getLastRow() - 3, fedexSheet.getLastColumn()).getValues();
	const groups = {};

	dataRows.forEach(row => {
		const groupId = row[0];
		if (!groupId) return;
		groups[groupId] = groups[groupId] || [];
		groups[groupId].push(row);
	});

	const payloadOptionsArray = [];
	for (const groupId in groups) {
		const groupRows = groups[groupId];
		const fedexData = {};

		headers.forEach((header, j) => {
			fedexData[header.trim()] = groupRows[0][j];
		});

		const commodities = [];
		let totalCustomsValue = 0;

		groupRows.forEach(row => {
			const rowData = {};

			headers.forEach((header, j) => {
				rowData[header.trim()] = row[j];
			});

			const value = roundToTwo(rowData["Unit Value* (15)"]);
			const commodity = {
				quantity: rowData["Qty* (7)"],
				quantityUnits: "EA",
				countryOfManufacture: rowData["Country of Manufacture* (2)"],
				description: rowData["Product Description* (148)"],
				weight: {
					units: "KG",
					value: rowData["Commodity Unit Weight (16)"]
				},
				unitPrice: {
					amount: value,
					currency: "USD"
				}
			};

			commodities.push(commodity);
			totalCustomsValue += parseFloat(value) * parseFloat(rowData["Qty* (7)"]);
		});

		log(`배송 번호 : ${groupId}`);
		log(`수신인 이름 : ${fedexData["Recipient Contact Name* (35)"]}`);
		log(`상품 정보 : ${JSON.stringify(commodities)}`);
		log(`총 세관 가치 : ${totalCustomsValue}`);

		fedexData["Total Customs Value"] = totalCustomsValue;
		const payloadOptions = getBody(fedexData, accessToken, commodities);
		payloadOptionsArray.push(payloadOptions);
	}

	const shipmentUrl = "https://apis-sandbox.fedex.com/ship/v1/shipments";
	log("배송 API 호출 중");

	const responses = [];

	payloadOptionsArray.forEach((options, i) => {
		try {
			const httpResponse = UrlFetchApp.fetch(shipmentUrl, options);
			log(`${i + 1} 번째 배송 API 호출 성공`);
			const parsedResponse = JSON.parse(httpResponse.getContentText());
			parsedResponse.groupId = options.groupId;
			responses.push(parsedResponse);
		} catch (e) {
		log(`배송검증 API 호출 중 오류 발생: ${e}`);
			responses.push({ groupID: options.groupId, error: e.toString() });
		}
	});

	log("모든 FedEx 배송요청 완료 후 응답 분석 중");
	fedexHandler(responses);
};
