function fedex() {
	var tokenData = getFedExOAuthToken();

	if (!tokenData || !tokenData.access_token) {
		log("FedEx OAuth 토큰 발급 실패");
		return ;
	}

	log("FedEx OAuth 토큰 발급 성공");

	validataShipment(tokenData.access_token);

	log("Fedex 배송 요청 완료");
}