export function generateId(prefix: string = ''): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 11);
	return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}
