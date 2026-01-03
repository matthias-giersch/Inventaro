import React, { useState } from "react";
import {
  Stack,
  TextField,
  Button,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import api from "../api";
import { saveToken } from "../auth";
import { useNavigate } from "react-router-dom";
import StorageIcon from "@mui/icons-material/Storage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", {
        email: email,
        password: password,
      });
      saveToken(res.data.access_token);
      nav("/dashboard");
    } catch (err) {
      console.error("Login failed", err);
      alert("Login failed: " + (err.response?.data?.detail || err.message));
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
