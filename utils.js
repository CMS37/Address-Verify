function log(string) {
  Logger.log(string);
}

function getBody(fedexData, accessToken) {
	var payload = {
		"mergeLabelDocOption": "LABELS_AND_DOCS",
		"labelResponseOptions": "URL_ONLY",
		"requestedShipment": {
		  "shipDatestamp": "2025-03-28",
		  "pickupType": "USE_SCHEDULED_PICKUP",
		  "serviceType": "FEDEX_INTERNATIONAL_PRIORITY",
		  "packagingType": "YOUR_PACKAGING",
		  "totalWeight": 31,
		  "shipper": {
			"address": {
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
			"contact": {
			  "personName": "SENDER_CONTACT_NAME",
			  "emailAddress": "test@test.com",
			  "phoneExtension": "",
			  "phoneNumber": "1234567890",
			  "companyName": "SENDER_COMPANY_NAME"
			},
			"tins": [{
			  "number": "KR123456789012(16)",
			  "tinType": "BUSINESS_UNION"
			}]
		  },
		  "recipients": [{
			"address": {
			  "streetLines": [
				fedexData["Recipient Address Line 1* (35)"] || "RECIPIENT_ADD_1",
				fedexData["Recipient Address Line 2* (35)"] || "RECIPIENT_ADD_2",
				fedexData["Recipient Address Line 3 (35) ) - v13"] || "RECIPIENT_ADD_3"
			  ],
			  "city": fedexData["Recipient City* (35)"] || "new york",
			  "stateOrProvinceCode": fedexData["State code"] || "NY",
			  "postalCode": fedexData["Recipient Zip Code* (10)"] || "10001",
			  "countryCode": fedexData["Recipient Country Code* (2)"] || "US",
			  "residential": false
			},
			"contact": {
			  "personName": fedexData["Recipient Contact Name* (35)"] || "RECEIVER_CONTACT_NAME",
			  "emailAddress": fedexData["Recipient Email (60)"] || "Crisauravasquez@gmail.ocm",
			  "phoneExtension": "",
			  "phoneNumber": fedexData["Receipient Tel #* (15)"] || "1234567890",
			  "companyName": fedexData["Recipient Company Name (35)"] || "RECEIVER_COMPANY_NAME"
			},
			"tins": [{
			  "number": "KR123456789012(16)",
			  "tinType": "BUSINESS_UNION"
			}],
			"deliveryInstructions": "DELIVERY INSTRUCTIONS"
		  }],
		  "shippingChargesPayment": {
			"paymentType": "SENDER",
			"payor": {
			  "responsibleParty": {
				"accountNumber": {
				  "value": "*********"
				}
			  }
			}
		  },
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
					"value": "123456789"
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
		  "labelSpecification": {
			"labelFormatType": "COMMON2D",
			"labelStockType": "STOCK_4X675_TRAILING_DOC_TAB",
			"imageType": "ZPLII"
		  },
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
			"preferredCurrency": "USD",
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
				"value": fedexData["Shipment Weight* (13)"] || 31.0
			}
		  }]
		},
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