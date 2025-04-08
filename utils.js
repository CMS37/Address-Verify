const log = (message) => Logger.log(message);

const roundToTwo = (num) => Math.round(num * 100) / 100;

const getMainData = (mainsheet) => {
	const mainData = {
		accountNumber: mainsheet.getRange("고객번호").getValue(),
		city: mainsheet.getRange("도시").getValue(),
		address1: mainsheet.getRange("주소1").getValue(),
		address2: mainsheet.getRange("주소2").getValue(),
		postalCode: mainsheet.getRange("우편번호").getValue(),
		email: mainsheet.getRange("이메일").getValue(),
		phone: mainsheet.getRange("전화번호").getValue(),
		companyName: mainsheet.getRange("회사명").getValue(),
		personName: mainsheet.getRange("사람명").getValue(),
		shipperTinsNumber: mainsheet.getRange("발송인세금번호").getValue(),
		shipperTinsType: mainsheet.getRange("발송인세금타입").getValue(),
		recipientTinsNumber: mainsheet.getRange("수신인세금번호").getValue(),
		recipientTinsType: mainsheet.getRange("수신인세금타입").getValue(),
		labelFormatType: mainsheet.getRange("라벨용지타입").getValue(),
		labelStockType: mainsheet.getRange("라벨저장타입").getValue(),
		imageType: mainsheet.getRange("이미지타입").getValue(),
	}

	return mainData;
}

const getBody = (mainData, fedexData, accessToken, commodities) => {
	const date = new Date().toISOString().slice(0, 10);

	const payload = {
		mergeLabelDocOption: "LABELS_AND_DOCS",
		labelResponseOptions: "URL_ONLY",
		requestedShipment: {
			shipDatestamp: date,
			pickupType: "USE_SCHEDULED_PICKUP",
			serviceType: "FEDEX_INTERNATIONAL_CONNECT_PLUS",
			packagingType: "YOUR_PACKAGING",
			totalWeight: fedexData["Shipment Weight* (13)"],
			shipper: {
				address: {
					streetLines: [
						mainData.address1,
						mainData.address2,
					],
					city: "GYEONGGIDO",
					stateOrProvinceCode: "",
					postalCode: mainData.postalCode,
					countryCode: "KR",
					residential: false
				},
				contact: {
					personName: mainData.personName,
					emailAddress: mainData.email,
					phoneExtension: "",
					phoneNumber: mainData.phone,
					companyName: mainData.companyName
				},
				tins: [{
					number: mainData.shipperTinsNumber,
					tinType: mainData.shipperTinsType
				}]
			},
			recipients: [{
				address: {
					streetLines: [
						fedexData["Recipient Address Line 1* (35)"],
						fedexData["Recipient Address Line 2* (35)"],
					],
					city: fedexData["Recipient City* (35)"],
					stateOrProvinceCode: fedexData["State code"],
					postalCode: fedexData["Recipient Zip Code* (10)"],
					countryCode: fedexData["Recipient Country Code* (2)"],
					residential: false
				},
				contact: {
					personName: fedexData["Recipient Contact Name* (35)"],
					emailAddress: fedexData["Recipient Email (60)"],
					phoneExtension: "",
					phoneNumber: fedexData["Receipient Tel #* (15)"],
					companyName: fedexData["Recipient Company Name (35)"]
				},
				tins: [{
					number: mainData.recipientTinsNumber,
					tinType: mainData.recipientTinsType
				}],
				deliveryInstructions: "DELIVERY INSTRUCTIONS"
			}],
			shippingChargesPayment: {
				paymentType: "SENDER",
				payor: {
					responsibleParty: {
						accountNumber: { value: mainData.accountNumber },
					}
				}
			},
			shipmentSpecialServices: {
				specialServiceTypes: ["ELECTRONIC_TRADE_DOCUMENTS"],
				etdDetail: {
					requestedDocumentTypes: ["COMMERCIAL_INVOICE"]
				}
			},
			customsClearanceDetail: {
				dutiesPayment: {
					payor: {
						responsibleParty: {
							accountNumber: { value: mainData.accountNumber },
						}
					},
					paymentType: "SENDER"
				},
				commodities,
				isDocumentOnly: false,
				totalCustomsValue: {
					amount: fedexData["Total Customs Value"],
					currency: "USD"
				}
			},
			labelSpecification: {
				labelFormatType: mainData.labelFormatType,
				labelStockType: mainData.labelStockType,
				imageType: mainData.imageType,
			},
			shippingDocumentSpecification: {
				shippingDocumentTypes: ["COMMERCIAL_INVOICE"],
				commercialInvoiceDetail: {
					customerImageUsages: [{
						id: "IMAGE_1",
						type: "LETTER_HEAD",
						providedImageType: "LETTER_HEAD"
					}, {
						id: "IMAGE_2",
						type: "SIGNATURE",
						providedImageType: "SIGNATURE"
					}],
					documentFormat: {
						provideInstructions: true,
						stockType: "PAPER_LETTER",
						locale: "en_US",
						docType: "PDF"
					}
				}
			},
			preferredCurrency: "USD",
			requestedPackageLineItems: [{
				groupPackageCount: 1,
				customerReferences: [{
					customerReferenceType: "INVOICE_NUMBER",
					value: "INV_NUM_IN_LABEL"
				}, {
					customerReferenceType: "CUSTOMER_REFERENCE",
					value: fedexData["Transaction ID*"]
				}],
				weight: {
					units: "KG",
					value: fedexData["Shipment Weight* (13)"]
				}
			}]
		},
		accountNumber: { value: mainData.accountNumber },
	};
	
	const options = {
		method: "post",
		contentType: "application/json",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${accessToken}`,
			"X-locale": "en_US"
		},
		payload: JSON.stringify(payload),
		muteHttpExceptions: true
	};
	
	options.groupId = fedexData["Transaction ID*"];
	return options;
};
