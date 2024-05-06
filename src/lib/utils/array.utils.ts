export function removeDuplicates(array: Array<unknown>) {
	return array.filter((item, index) => array.indexOf(item) === index);
}
