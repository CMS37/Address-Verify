const getFedExOAuthToken = () => {
	const scriptProperties = PropertiesService.getScriptProperties();
	const clientId = scriptProperties.getProperty("FEDEX_CLIENT_ID");
	const clientSecret = scriptProperties.getProperty("FEDEX_CLIENT_SECRET");

	if (!clientId || !clientSecret) {
		log("스크립트 속성에서 FEDEX_CLIENT_ID 또는 FEDEX_CLIENT_SECRET 찾을 수 없습니다.");
		return null;
	}

	const grantType = "client_credentials";
	const tokenUrl = "https://apis.fedex.com/oauth/token";
	// const tokenUrl = "https://apis-sandbox.fedex.com/oauth/token";
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
	const groupIdData = fedexSheet.getRange(1, 1, fedexSheet.getLastRow(), 1).getValues();
	
	const dataRows = fedexSheet.getRange(4, 1, fedexSheet.getLastRow() - 3, fedexSheet.getLastColumn()).getValues();
	const groups = {};
	
	dataRows.forEach(row => {
		const groupId = row[0];
		if (!groupId) return;
		groups[groupId] = groups[groupId] || [];
		groups[groupId].push(row);
	});

	const shipmentUrl = "https://apis.fedex.com/ship/v1/shipments";
	// const shipmentUrl = "https://apis-sandbox.fedex.com/ship/v1/shipments";
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
	  
		log(`배송 번호 : ${groupId} 수신인 이름 : ${fedexData["Recipient Contact Name* (35)"]} 총 세관 가치 : ${totalCustomsValue}`);
		
		fedexData["Total Customs Value"] = totalCustomsValue;
		const payloadOptions = getBody(fedexData, accessToken, commodities);
		payloadOptions.url = shipmentUrl;
		payloadOptionsArray.push(payloadOptions);
	}

	log("배송 API 호출 중");

	const responses = [];

	const BATCH_SIZE = 40;
	for (let i = 0; i < payloadOptionsArray.length; i += BATCH_SIZE) {
		const batch = payloadOptionsArray.slice(i, i + BATCH_SIZE);
		try {
			const results = UrlFetchApp.fetchAll(batch);
			results.forEach((result, j) => {
				const parsedResponse = JSON.parse(result.getContentText());
				parsedResponse.groupId = batch[j].groupId;
				responses.push(parsedResponse);
			});
		} catch (e) {
			log(`배치 ${i + 1} 부터 호출 중 오류 발생: ${e}`);
		}
		Utilities.sleep(500); // 0.5초 대기
	}

	log("모든 FedEx 배송요청 완료 후 응답 분석 중");
	fedexHandler(responses, fedexSheet, headers, groupIdData);
};