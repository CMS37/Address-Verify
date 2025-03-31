function log(string) {
  Logger.log(string);
}

function getBody(fedexData, accessToken) {
	var payload = {
		"mergeLabelDocOption": "LABELS_AND_DOCS",
		"labelResponseOptions": "URL_ONLY",
		"requestedShipment": {
		  "shipDatestamp": "2025-03-31", // 배송날짜 현재 날짜보다 전이면 오류 발생 
		  "pickupType": "USE_SCHEDULED_PICKUP",
		  "serviceType": "FEDEX_INTERNATIONAL_PRIORITY",
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
				fedexData["Recipient Address Line 3 (35) ) - v13"]
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
			"commercialInvoice": {
			  "originatorName": "originator Name",
			  "comments": [
				"optional comments for the commercial invoice"
			  ],
			  "customerReferences": [{
				"customerReferenceType": "DEPARTMENT_NUMBER",
				"value": "3686"
			  }],
			  "freightCharge": {
				"amount": 12.45,
				"currency": "USD"
			  },
			  "packingCosts": {
				"amount": 12.45,
				"currency": "USD"
			  },
			  "handlingCosts": {
				"amount": 12.45,
				"currency": "USD"
			  },
			  "termsOfSale": "FCA",
			  "specialInstructions": "specialInstructions",
			  "shipmentPurpose": "REPAIR_AND_RETURN"
			},
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
			"commodities": [{
			  "quantity": 2,
			  "quantityUnits": "EA",
			  "countryOfManufacture": "KR",
			  "description": "Product1",
			  "weight": {
				"units": "KG",
				"value": 16
			  },
			  "unitPrice": {
				"amount": 7,
				"currency": "USD"
			  }
			},
			{
			  "quantity": 3,
			  "quantityUnits": "EA",
			  "countryOfManufacture": "KR",
			  "description": "Product2",
			  "weight": {
				"units": "KG",
				"value": 15
			  },
			  "unitPrice": {
				"amount": 4,
				"currency": "USD"
			  }
			}],
			"isDocumentOnly": false,
			"totalCustomsValue": {
			  "amount": 26,
			  "currency": "USD"
			}
		  },

		  // 라벨 정보
		  "labelSpecification": {
			"labelFormatType": "COMMON2D",
			"labelStockType": "STOCK_4X675_TRAILING_DOC_TAB",
			"imageType": "ZPLII"
		  },

		  // ?
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

			// 배송물품 정보란
			"requestedPackageLineItems": [{ 
				"groupPackageCount": 1,
				"customerReferences": [{
					"customerReferenceType": "INVOICE_NUMBER",
					"value": "INV_NUM_IN_LABEL"
				},
				{
					"customerReferenceType": "CUSTOMER_REFERENCE",
					"value": "REFERENCE_IN_LABEL"
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

	return options;
}