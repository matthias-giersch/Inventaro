import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getUserFromToken, isAdmin, logout } from "../api/auth";

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
        <Typography
          variant="h6"
          sx={{
            cursor: "pointer",
            fontWeight: "bold",
          }}
          onClick={() => navigate("/")}
        >
          Inventaro
        </Typography>

        <Box display="flex" alignItems="center" gap={2} marginLeft="auto">
          {isAdmin() && (
            <Button
              color="info"
              variant="contained"
              onClick={() => navigate("/auth/users")}
            >
              Users
            </Button>
          )}
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
