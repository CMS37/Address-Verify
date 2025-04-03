function fedex() {
	var tokenData = getFedExOAuthToken();

	if (!tokenData || !tokenData.access_token) {
		log("FedEx OAuth 토큰 발급 실패");
		return ;
	}

	log("FedEx OAuth 토큰 발급 성공");

	var responseData = validataShipment(tokenData.access_token);

	if (!responseData) {
		log("FedEx 배송 정보 조회 실패");
		return ;
	}

	log("모든 FedEx 배송요청 완료 후 응답 분석 중");
	fedexHandler(responseData);
}