function log(string) {
  Logger.log(string);
}

function roundToTwo(num) {
	return Math.round(num * 100) / 100;
}

function getBody(fedexData, accessToken, commodities) {

	// 현재 날짜를 YYYY-MM-DD 형식으로 가져오기 -> 배송날짜 기입용
	var date = new Date().toISOString().slice(0, 10);

	var payload = {
		"mergeLabelDocOption": "LABELS_AND_DOCS",
		"labelResponseOptions": "URL_ONLY",
		"requestedShipment": {
			"shipDatestamp": date,
			"pickupType": "USE_SCHEDULED_PICKUP",
			"serviceType": "FEDEX_INTERNATIONAL_CONNECT_PLUS", // AH열에 대한입력에따라 분기 필요? 현재   EC) FICP =  FEDEX_INTERNATIONAL_CONNECT_PLUS 고정 
			"packagingType": "YOUR_PACKAGING",
			"totalWeight": fedexData["Shipment Weight* (13)"],

			// 발송인 정보란
			"shipper": {
				"address": { // 발송인 주소 채워 넣기
					"streetLines": [
						"SENDER_ADD_1",
						"SENDER_ADD_2" 
					],
					"city": "Sasdfeoul-Si",
					"stateOrProvinceCode": "",
					"postalCode": "04027",
					"countryCode": "KR",
					"residential": false
				},
				"contact": { // 발송인 정보 채워 넣기
					"personName": "SENDER_CONTACT_NAME",
					"emailAddress": "testtest",
					"phoneExtension": "",
					"phoneNumber": "1234567890",
					"companyName": "SENDER_COMPANY_NAME"
				},
				"tins": [{ // 발송인 세금 정보?
					"number": "KR123456789012(16)",
					"tinType": "BUSINESS_UNION"
				}]
			},

			// 수신인 정보란
			"recipients": [{
				"address": {
					"streetLines": [
						fedexData["Recipient Address Line 1* (35)"],
						fedexData["Recipient Address Line 2* (35)"],
					],
					"city": fedexData["Recipient City* (35)"],
					"stateOrProvinceCode": fedexData["State code"],
					"postalCode": fedexData["Recipient Zip Code* (10)"],
					"countryCode": fedexData["Recipient Country Code* (2)"],
					"residential": false
				},
				"contact": {
					"personName": fedexData["Recipient Contact Name* (35)"],
					"emailAddress": fedexData["Recipient Email (60)"],
					"phoneExtension": "",
					"phoneNumber": fedexData["Receipient Tel #* (15)"],
					"companyName": fedexData["Recipient Company Name (35)"]
				},
				"tins": [{ // 수신인 세금 정보?
					"number": "KR123456789012(16)",
					"tinType": "BUSINESS_UNION"
				}],
				"deliveryInstructions": "DELIVERY INSTRUCTIONS" // 수신인 배송지시사항
			}],

			// 배송비 결제 정보
			"shippingChargesPayment": {
				"paymentType": "SENDER", 
				"payor": {
					"responsibleParty": {
						"accountNumber": {
							"value": "740561073" // 발송인 계정?계좌? 번호 입력
						}
					}
				}
			},
			// 배송특별서비스 -> 페덱스 송장 자동 생성 
			"shipmentSpecialServices": {
				"specialServiceTypes": [
					"ELECTRONIC_TRADE_DOCUMENTS"  
				],
				"etdDetail": {
					"requestedDocumentTypes": [
						"COMMERCIAL_INVOICE"
					]
				}
			},

			// 배송물품 정보란
			"customsClearanceDetail": {
				"dutiesPayment": {
					"payor": {
						"responsibleParty": {
							"accountNumber": {
								"value": "740561073"
							}
						}
					},
					"paymentType": "SENDER"
				},
				"commodities": commodities,
				"isDocumentOnly": false,
				"totalCustomsValue": {
					"amount": fedexData["Total Customs Value"], // 총 세관 가치
					"currency": "USD"
				}
			},

			// 라벨 정보
			"labelSpecification": {
				"labelFormatType": "COMMON2D",
				"labelStockType": "STOCK_4X675_TRAILING_DOC_TAB",
				"imageType": "ZPLII"
			},

			// 배송문서 추가 정보 필요하면 추가하는곳
			"shippingDocumentSpecification": {
				"shippingDocumentTypes": [
					"COMMERCIAL_INVOICE"
				],
				"commercialInvoiceDetail": {
					"customerImageUsages": [{
						"id": "IMAGE_1",
						"type": "LETTER_HEAD",
						"providedImageType": "LETTER_HEAD"
					},
					{
						"id": "IMAGE_2",
						"type": "SIGNATURE",
						"providedImageType": "SIGNATURE"
					}],
					"documentFormat": {
						"provideInstructions": true,
						"stockType": "PAPER_LETTER",
						"locale": "en_US",
						"docType": "PDF"
					}
				}
			},
			"preferredCurrency": "USD", // 통화

			// 배송물품패키지 정보란
			"requestedPackageLineItems": [{ 
				"groupPackageCount": 1,
				"customerReferences": [{
					"customerReferenceType": "INVOICE_NUMBER",
					"value": "INV_NUM_IN_LABEL"
				},
				{
					"customerReferenceType": "CUSTOMER_REFERENCE",
					"value": fedexData["Transaction ID*"]
				}],
				"weight": {
					"units": "KG",
					"value": fedexData["Shipment Weight* (13)"]
				}
			}]
		},
		// 고객번호
		"accountNumber": {
			"value": "740561073"
		}
	};

	var options = {
		"method": "post",
		"contentType": "application/json",
		"headers": {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + accessToken,
			"X-locale": "en_US"
		},
		"payload": JSON.stringify(payload),
		"muteHttpExceptions": true
	};

	options.groupId = fedexData["Transaction ID*"];

	return options;
}