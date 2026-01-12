import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { isAdmin } from "../api/auth";
import { createItem, deleteItem, getItems, updateItem } from "../api/items";

export default function ItemList({ category }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [extra, setExtra] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [deleteItemState, setDeleteItemState] = useState(null);

  const loadItems = useCallback(async () => {
    if (!category) return;
    try {
      setLoading(true);
      const data = await getItems(category.id);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const resetForm = () => {
    setName("");
    setQuantity("");
    setLocation("");
    setExtra("");
  };

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      const payload = {
        name: name.trim(),
        quantity: quantity === "" ? 0 : Number(quantity),
        location: location.trim() === "" ? null : location,
        extra: extra.trim() === "" ? "" : extra,
      };
      const newItem = await createItem(category.id, payload);
      setItems((prev) => [...prev, newItem]);
      setOpenCreate(false);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditDialog = (item) => {
    setEditItem(item);
    setName(item.name);
    setQuantity(String(item.quantity));
    setLocation(item.location || "");
    setExtra(item.extra || "");
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    try {
      const payload = {
        name: name.trim(),
        quantity: quantity === "" ? 0 : Number(quantity),
        location: location.trim() === "" ? null : location,
        extra: extra.trim() === "" ? "" : extra,
      };
      const updated = await updateItem(editItem.id, payload);
      setItems((prev) =>
        prev.map((item) => (item.id === editItem.id ? updated : item)),
      );
      setEditItem(null);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteItemState) return;

    try {
      await deleteItem(deleteItemState.id);
      setItems((prev) => prev.filter((item) => item.id !== deleteItemState.id));
      setDeleteItemState(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (!category) {
    return (
      <Box p={4}>
        <Typography variant="h6">Select a category</Typography>
      </Box>
    );
  }

  return (
    <Box p={4} flex={1}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          {category.name}
        </Typography>

        {isAdmin() && (
          <Button
            variant="contained"
            size="medium"
            onClick={() => setOpenCreate(true)}
          >
            + Add item
          </Button>
        )}
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Paper sx={{ width: "95%", tableLayout: "fixed" }}>
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
                    width: "20%",
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontSize: "1.125rem",
                    fontWeight: "bold",
                    width: "10%",
                  }}
                >
                  Quantity
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontSize: "1.125rem",
                    fontWeight: "bold",
                    width: "20%",
                  }}
                >
                  Location
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontSize: "1.125rem",
                    fontWeight: "bold",
                    width: "40%",
                  }}
                >
                  Extras
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontSize: "1.125rem",
                    fontWeight: "bold",
                    width: "10%",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell
                    align="center"
                    sx={{
                      maxWidth: 200,
                      overflowX: "auto",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.name}
                  </TableCell>
                  <TableCell align="center">{item.quantity}</TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      maxWidth: 200,
                      overflowX: "auto",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.location || "-"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      maxWidth: 200,
                      overflowX: "auto",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.extra || "-"}
                  </TableCell>
                  <TableCell>
                    {isAdmin() && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(item)}
                            sx={{
                              backgroundColor: "primary.light",
                              "&:hover": {
                                backgroundColor: "primary.main",
                              },
                              color: "white",
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
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
                            onClick={() => setDeleteItemState(item)}
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
                        </Box>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog
        open={openCreate}
        onClose={() => {
          setOpenCreate(false);
          resetForm();
        }}
      >
        <DialogTitle>New item</DialogTitle>
        <DialogContent>
          <FormField
            name={name}
            quantity={quantity}
            location={location}
            extra={extra}
            setName={setName}
            setQuantity={setQuantity}
            setLocation={setLocation}
            setExtra={setExtra}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenCreate(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(editItem)}
        onClose={() => {
          setEditItem(null);
          resetForm();
        }}
        fullWidth
      >
        <DialogTitle>Edit item</DialogTitle>
        <DialogContent>
          <FormField
            name={name}
            quantity={quantity}
            location={location}
            extra={extra}
            setName={setName}
            setQuantity={setQuantity}
            setLocation={setLocation}
            setExtra={setExtra}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditItem(null);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUpdate}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteItemState)}
        onClose={() => setDeleteItemState(null)}
      >
        <DialogTitle>Delete item</DialogTitle>
        <DialogContent>
          <Typography>
            Do you want to delete the item{" "}
            <strong>{deleteItemState?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteItemState(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const FormField = ({
  name,
  quantity,
  location,
  extra,
  setName,
  setQuantity,
  setLocation,
  setExtra,
}) => (
  <>
    <TextField
      label="Name"
      fullWidth
      margin="dense"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
    <TextField
      label="Quantity"
      fullWidth
      margin="dense"
      value={quantity}
      onChange={(e) => setQuantity(e.target.value)}
    />
    <TextField
      label="Location"
      fullWidth
      margin="dense"
      value={location}
      onChange={(e) => setLocation(e.target.value)}
    />
    <TextField
      label="Extra"
      fullWidth
      margin="dense"
      value={extra}
      onChange={(e) => setExtra(e.target.value)}
    />
  </>
);
