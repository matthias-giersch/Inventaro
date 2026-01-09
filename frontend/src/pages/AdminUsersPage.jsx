import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { isAdmin } from "../api/auth";
import {
  deleteUser,
  getUsers,
  promoteAdminToUser,
  promoteUserToAdmin,
} from "../api/users";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteUserState, setDeleteUserState] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.status === 403
          ? "You are not an admin"
          : "User can't be loaded",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggleAdmin = async (user) => {
    try {
      let updatedUser;
      if (user.role === "admin") {
        updatedUser = await promoteAdminToUser(user.id);
      } else {
        updatedUser = await promoteUserToAdmin(user.id);
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, role: updatedUser.role } : u,
        ),
      );
      setSuccess(`User "${user.email}" is now ${updatedUser.role}`);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.status === 403 ? "You are not an admin" : "Action failed",
      );
    }
  };

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDeleteUser = async () => {
    if (!deleteUserState) return;
    try {
      await deleteUser(deleteUserState.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserState.id));
      setSuccess(`User ${deleteUserState.email} deleted`);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteUserState(null);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>

      <Paper sx={{ width: "50%", mx: "auto" }}>
        <Table
          size="small"
          sx={{
            tableLayout: "fixed",
            "& th, & td": {
              borderRight: "1px solid #e0e0e0",
            },
            "& th:last-child, & td:last-child": {
              borderRight: "none",
            },
          }}
        >
          <TableHead sx={{ backgroundColor: "info.light" }}>
            <TableRow>
              <TableCell
                align="center"
                sx={{
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  width: "25%",
                }}
              >
                ID
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  width: "25%",
                }}
              >
                Email
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  width: "25%",
                }}
              >
                Role
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  width: "25%",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell
                  align="center"
                  sx={{
                    maxWidth: 200,
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.id}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    maxWidth: 200,
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.email}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    maxWidth: 200,
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.role}
                </TableCell>
                <TableCell>
                  {isAdmin() && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Switch
                          checked={user.role === "admin"}
                          onChange={() => handleToggleAdmin(user)}
                          color="primary"
                          disabled={user.email === "admin@example.com"}
                        />
                        <Typography variant="body2">Admin</Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <IconButton
                          size="small"
                          disabled={user.email === "admin@example.com"}
                          onClick={() => setDeleteUserState(user)}
                          sx={{
                            backgroundColor: "error.light",
                            "&:hover": {
                              backgroundColor: "error.main",
                            },
                            color: "white",
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2">Delete</Typography>
                      </Box>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={!!deleteUserState} onClose={() => setDeleteUserState(null)}>
        <DialogTitle>Delete user</DialogTitle>
        <DialogContent>
          <Typography>
            Do you want to delete the user{" "}
            <strong>{deleteUserState?.email}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUserState(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleDeleteUser}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </Box>
  );
}
