import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getUserFromToken, logout } from "../api/auth";

export default function AppHeader() {
	const navigate = useNavigate();
	const user = getUserFromToken();

	if (!user) return null;

	const handleLogout = () => {
		logout();
		navigate("/login", { replace: true });
	};

	return (
		<AppBar position="static">
			<Toolbar>
				<Typography variant="h6" sx={{ flexGrow: 1 }}>
					Inventaro
				</Typography>

				<Box display="flex" alignItems="center" gap={2}>
					<Typography variant="body1">
						<strong>{user.email}</strong>
					</Typography>

					<Button color="error" variant="contained" onClick={handleLogout}>
						Logout
					</Button>
				</Box>
			</Toolbar>
		</AppBar>
	);
}
