const log = (message) => Logger.log(message);

const roundToTwo = (num) => Math.round(num * 100) / 100;

const getBody = (fedexData, accessToken, commodities) => {
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
					streetLines: ["SENDER_ADD_1", "SENDER_ADD_2"],
					city: "Sasdfeoul-Si",
					stateOrProvinceCode: "",
					postalCode: "04027",
					countryCode: "KR",
					residential: false
				},
				contact: {
					personName: "SENDER_CONTACT_NAME",
					emailAddress: "testtest",
					phoneExtension: "",
					phoneNumber: "1234567890",
					companyName: "SENDER_COMPANY_NAME"
				},
				tins: [{
					number: "KR123456789012(16)",
					tinType: "BUSINESS_UNION"
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
					number: "KR123456789012(16)",
					tinType: "BUSINESS_UNION"
				}],
				deliveryInstructions: "DELIVERY INSTRUCTIONS"
			}],
			shippingChargesPayment: {
				paymentType: "SENDER",
				payor: {
					responsibleParty: {
						accountNumber: { value: "740561073" }
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
							accountNumber: { value: "740561073" }
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
				labelFormatType: "COMMON2D",
				labelStockType: "STOCK_4X675_TRAILING_DOC_TAB",
				imageType: "ZPLII"
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
		accountNumber: { value: "740561073" }
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
