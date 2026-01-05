import { Alert, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminRoute({ children }) {
	const [isAdmin, setIsAdmin] = useState(null);
	const [showAlert, setShowAlert] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("token");

		let timeout;
		try {
			if (!token) throw new Error("No token");

			const payload = JSON.parse(atob(token.split(".")[1]));

			if (payload.role === "admin") {
				setIsAdmin(true);
			} else {
				setIsAdmin(false);
				setShowAlert(true);

				timeout = setTimeout(() => {
					navigate("/dashboard", { replace: true });
				}, 3000);
			}
		} catch {
			setIsAdmin(false);
			setShowAlert(true);

			timeout = setTimeout(() => {
				navigate("/dashboard", { replace: true });
			}, 3000);
		}

		return () => clearTimeout(timeout);
	}, [navigate]);

	if (!isAdmin) {
		return (
			<Snackbar
				open={showAlert}
				autoHideDuration={3000}
				onClose={() => setShowAlert(false)}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
			>
				<Alert severity="error" sx={{ width: "100%" }}>
					You don't have the required credentials!
				</Alert>
			</Snackbar>
		);
	}

	return children;
}
