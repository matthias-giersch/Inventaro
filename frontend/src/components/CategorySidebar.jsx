import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	List,
	ListItemButton,
	ListItemText,
	TextField,
	Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { isAdmin } from "../api/auth";
import { createCategory, getCategories } from "../api/categories";

export default function CategorySidebar({ onSelect }) {
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);

	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [saving, setSaving] = useState(false);

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
					size="small"
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
					{categories.map((cat) => (
						<ListItemButton key={cat.id} onClick={() => onSelect?.(cat)}>
							<ListItemText primary={cat.name} />
						</ListItemButton>
					))}
				</List>
			)}

			<Dialog open={open} onClose={() => setOpen(false)}>
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
		</Box>
	);
}
