function main() {
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var sheet = ss.getActiveSheet();
	var lastRow = sheet.getLastRow();

	var dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
	var data = dataRange.getValues();

	var addresses = [];

	for (var i = 0; i < data.length; i++) {
		var row = data[i];
		addresses.push({
			country: row[6],
			street: row[9],
			city: row[12],
			state: row[13],
			postalCode: row[15],
			rowIndex: i + 2
		});
	  }
	callApi(addresses);
}
  
/*
	검증을 빡세게 걸고 통과한걸 100%보장하는 대신 실패한것에 대해선 인력?

	검증을 널널하게 걸면 자동완성된걸 100%보장 못함

	구글폼 제출시 외부 api검증에 따라 재작성 요청?
	-> 사용자 입장에선 귀찮아서 재제출 안할 가능성 / 사용자가 잘못한게 아니라 api가 잘못한 경우 CS문제

	실무를 하면서 검증단계를 조정해야함
	최대한 100%를 보장하는 단계에서 실패하는 건에 대해서는 수동으로 처리?

	추후 예외처리 추가 필요

	최소한 필요한 데이터
	나라 / 주소 / 주 / 우편번호
*/