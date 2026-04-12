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
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { isAdmin } from "../api/auth";
import {
  createCategory,
  deleteCategory,
  getCategories,
} from "../api/categories";

export default function CategorySidebar({ onSelect, selectedCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteCategoryState, setDeleteCategoryState] = useState(null);

  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState("");
  const [openDeleteBlockedDialog, setOpenDeleteBlockedDialog] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      setSaving(true);
      await createCategory(name.trim());
      setName("");
      setOpen(false);
      loadCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryState) return;

    try {
      await deleteCategory(deleteCategoryState.id);

      setCategories((prev) =>
        prev.filter((cat) => cat.id !== deleteCategoryState.id),
      );
      if (selectedCategory?.id === deleteCategoryState.id) {
        onSelect?.(null);
      }

      setSuccess(`Category "${deleteCategoryState.name}" deleted.`);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      if (err.response?.status === 409) {
        setDeleteBlockedMessage(
          detail ||
            "This category can't be deleted because it still contains items.",
        );
        setOpenDeleteBlockedDialog(true);
      } else {
        setError(detail || "Category could not be deleted.");
      }
    } finally {
      setDeleteCategoryState(null);
    }
  };

  return (
    <Box
      sx={{
        width: 260,
        borderRight: "1px solid #e0e0e0",
        height: "calc(100vh - 64px)",
        p: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Categories
      </Typography>

      {isAdmin() && (
        <Button
          fullWidth
          variant="contained"
          size="medium"
          sx={{ mb: 2 }}
          onClick={() => setOpen(true)}
        >
          + Add category
        </Button>
      )}

      <Divider sx={{ mb: 1 }} />

      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <List>
          {categories.map((cat) => {
            const isSelected = selectedCategory?.id === cat.id;

            return (
              <Box
                key={cat.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ListItemButton
                  selected={isSelected}
                  onClick={() => onSelect?.(cat)}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemText primary={cat.name} />
                </ListItemButton>

                {isAdmin() && (
                  <IconButton
                    size="small"
                    onClick={() => setDeleteCategoryState(cat)}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            );
          })}
        </List>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>New category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={saving}>
            create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteCategoryState)}
        onClose={() => setDeleteCategoryState(null)}
      >
        <DialogTitle>Delete category</DialogTitle>
        <DialogContent>
          <Typography>
            Do you want to delete the category{" "}
            <strong>{deleteCategoryState?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCategoryState(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteCategory}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>
      <Dialog
        open={openDeleteBlockedDialog}
        onClose={() => setOpenDeleteBlockedDialog(false)}
      >
        <DialogTitle>Category can't be deleted</DialogTitle>
        <DialogContent>
          <Typography>{deleteBlockedMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => setOpenDeleteBlockedDialog(false)}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
