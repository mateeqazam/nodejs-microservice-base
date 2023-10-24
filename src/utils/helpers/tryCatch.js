async function tryCatch(asyncFunction) {
	try {
		const result = await asyncFunction();
		return { result };
	} catch (error) {
		return { error };
	}
}

export default tryCatch;
