import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
import { getItems, createItem } from "../api/items";
import { isAdmin } from "../api/auth";

export default function ItemList({ category }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [extra, setExtra] = useState("");

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

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      await createItem(category.id, {
        name,
        quantity: Number(quantity),
        location: location || null,
        extra,
      });
      setOpen(false);
      setName("");
      setQuantity(0);
      setLocation("");
      setExtra("");
      loadItems();
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
            onClick={() => setOpen(true)}
          >
            + Add item
          </Button>
        )}
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Paper>
          <Table
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
                    width: "45%",
                  }}
                >
                  Extras
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>New item</DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
