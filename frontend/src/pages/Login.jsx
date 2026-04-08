import StorageIcon from "@mui/icons-material/Storage";
import {
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { initAuth, login, saveToken } from "../api/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();

    try {
      const data = await login(email, password);

      saveToken(data.access_token, data.refresh_token, data.refresh_expires_at);

      initAuth();
      nav("/dashboard");
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      if (err.response) {
        console.error("STATUS:", err.response.status);
        console.error("DATA:", JSON.stringify(err.response.data, null, 2));
      }
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{ mb: 1 }}
        >
          <StorageIcon color="primary" sx={{ fontSize: 36 }} />
          <Typography variant="h5" gutterBottom>
            Inventaro
          </Typography>
        </Stack>
        <form onSubmit={submit}>
          <TextField
            fullWidth
            label="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              type="button"
              variant="outlined"
              onClick={() => nav("/register")}
            >
              Not Registered?
            </Button>
            <Button type="submit" variant="contained">
              Login
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
