function fedex() {
	var tokenData = getFedExOAuthToken();

	if (!tokenData || !tokenData.access_token) {
		Logger.log("FedEx OAuth 토큰 발급 실패");
		return ;
	}

	Logger.log("FedEx OAuth 토큰 발급 성공");
	Logger.log(tokenData.access_token);

	var responseData = validataShipment(tokenData.access_token);

	if (!responseData) {
		Logger.log("FedEx 배송 정보 조회 실패");
		return ;
	}

	Logger.log("FedEx 통합 배송 정보 조회 성공");
	Logger.log(responseData);

}