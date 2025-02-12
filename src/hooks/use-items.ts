import { useState, useEffect } from "react";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "../firebase";
import { Item } from "../types";

export const useItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "items"),
      (snapshot) => {
        // Map through snapshot to get the data
        const fetchedItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Update the state with fetched items
        setItems(fetchedItems as Item[]);
        setLoading(false); // Set loading to false once data is fetched
      },
      (err) => {
        setError("Error fetching items: " + err.message);
        setLoading(false);
      },
    );

    // Clean up the listener when the component is unmounted
    return () => unsubscribe();
  }, []);

  return { items, loading, error };
};
