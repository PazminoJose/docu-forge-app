export const parseNumberToColumn = (num: number): string => {
	let column = "";
	num += 1;
	while (num > 0) {
		const remainder = (num - 1) % 26;
		column = String.fromCharCode(65 + remainder) + column;
		num = Math.floor((num - 1) / 26);
	}
	return column;
};
