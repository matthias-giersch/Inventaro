import { Box } from "@mui/material";
import { useState } from "react";
import CategorySidebar from "../components/CategorySidebar";
import ItemList from "../components/ItemList";

export default function Dashboard() {
  const [selectedCategory, setSelectedCatgory] = useState(null);
  return (
    <Box display="flex">
      <CategorySidebar onSelect={setSelectedCatgory} />
      <ItemList category={selectedCategory} />
    </Box>
  );
}
