function tryCatch(func) {
	return async (...args) => {
		try {
			return await func(...args);
		} catch (error) {
			return { error };
		}
	};
}

export default tryCatch;
