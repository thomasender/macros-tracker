import { useState, useEffect } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../firebase.ts";
import { Record } from "../types";

export const useTodaysRecord = () => {
  const [record, setRecord] = useState<Record>({ date: "", record: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const recordRef = doc(db, "records", today);

    const unsubscribe = onSnapshot(
      recordRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setRecord(snapshot.data() as Record);
        } else {
          setRecord({ date: "", record: [] });
        }
        setLoading(false); // Set loading to false once data is fetched
      },
      (err) => {
        setError("Error fetching todays record: " + err.message);
        setLoading(false);
      },
    );

    // Clean up the listener when the component is unmounted
    return () => unsubscribe();
  }, []);

  return { record, loading, error };
};
