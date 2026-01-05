export function getToken() {
	return localStorage.getItem("token");
}

export function parseJwt(token) {
	if (!token) return null;
	try {
		return JSON.parse(atob(token.split(".")[1]));
	} catch {
		return null;
	}
}

export function isAdmin() {
	const token = getToken();
	const payload = parseJwt(token);
	return payload?.role === "admin";
}
