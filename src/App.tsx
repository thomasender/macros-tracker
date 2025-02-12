import { useEffect, useState } from "react";
import "./App.css";
import { Item, Record } from "./types";
import { v4 as uuidv4 } from "uuid";
import { auth } from "./firebase.ts";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { useItems } from "./hooks/use-items.ts";
import { db } from "./firebase.ts";
import { doc, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { useTodaysRecord } from "./hooks/use-record.ts";

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { items, error: itemsError, loading: loadingItems } = useItems();
  const [item, setItem] = useState<Item>({
    id: "",
    name: "",
    fat: 0,
    carbs: 0,
    calories: 0,
    protein: 0,
  });
  const [{ record }, setRecord] = useState<Record>({
    date: "",
    record: [],
  });
  const { record: todaysRecord, loading: loadingTodaysRecord } =
    useTodaysRecord();

  const totalCalories = record.reduce((sum, curr) => {
    return Math.ceil(Number(sum) + Number(curr.calories));
  }, 0);
  const totalProtein = record.reduce((sum, curr) => {
    return Math.ceil(Number(sum) + Number(curr.protein));
  }, 0);
  const totalCarbs = record.reduce((sum, curr) => {
    return Math.ceil(Number(sum) + Number(curr.carbs));
  }, 0);
  const totalFats = record.reduce((sum, curr) => {
    return Math.ceil(Number(sum) + Number(curr.fat));
  }, 0);

  const dateString = new Date(Date.now()).toLocaleDateString();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
  }, []);

  useEffect(() => {
    if (!loadingTodaysRecord) {
      setRecord(todaysRecord);
    }
  }, [loadingTodaysRecord, todaysRecord]);

  const onLogin = async () => {
    if (!email || !password) return;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      alert(
        `Something went wrong, please try again ${(e as { code: number; message: string }).message}`,
      );
    }
  };

  const onSignUp = async () => {
    if (!email || !password) return;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) {
      alert(
        `Something went wrong, please try again ${(e as { code: number; message: string }).message}`,
      );
    }
  };

  const onInputChange =
    (property: keyof Item) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setItem((prevEntry) => ({
        ...prevEntry,
        [property]: event.target.value,
      }));
    };

  const addItem = async () => {
    const id = uuidv4();
    const itemRef = doc(db, "items", id);

    try {
      await setDoc(itemRef, { ...item, id });
      setItem({
        id: "",
        name: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
    } catch (e) {
      alert(
        `An error occured trying to save a new item: ${(e as { message: string }).message}`,
      );
    }
  };

  const onAddToRecord = (item: Item) => {
    setRecord((prev) => ({ ...prev, record: [...prev.record, item] }));
  };

  const onRemoveFromRecord = (indexToRemove: number) => {
    setRecord((prev) => ({
      ...prev,
      record: prev.record.filter((_, index: number) => index !== indexToRemove),
    }));
  };

  const onSaveRecord = async () => {
    const today = new Date().toISOString().split("T")[0];
    const recordRef = doc(db, "records", today);

    try {
      const docSnap = await getDoc(recordRef);

      if (docSnap.exists()) {
        await updateDoc(recordRef, {
          date: today,
          record: record,
        });

        alert("Record saved!");
      } else {
        await setDoc(recordRef, {
          date: today,
          record: record,
        });
      }
    } catch (e) {
      alert(`Error saving record: ${(e as { message: string }).message}`);
    }
  };

  const onDeleteItem = async (item: Item) => {
    try {
      if (confirm("Do you really want to delete this item?")) {
        await deleteDoc(doc(db, "items", item.id));
      }
    } catch (e) {
      alert(`Error deleting item: ${(e as { message: string }).message}`);
    }
  };

  return (
    <div className="app-wrapper">
      <h1>Track My Macros</h1>
      {currentUser ? (
        <>
          <div className="top-wrapper">
            <p>
              Hi {currentUser.email}, today is {dateString}
            </p>
            <button onClick={() => auth.signOut()}>Logout</button>
          </div>
          {itemsError && `An error occured fetching the items: ${itemsError}`}
          {loadingItems && !itemsError ? (
            "Loading Items"
          ) : (
            <>
              <div className="add-entry-form">
                <button onClick={addItem}>Create New Item</button>
                <input
                  type="text"
                  value={item.name}
                  placeholder="Name your new item"
                  onChange={onInputChange("name")}
                />
                <input
                  type="number"
                  name="calories"
                  value={item.calories || ""}
                  placeholder="Calories"
                  onChange={onInputChange("calories")}
                />
                <input
                  type="number"
                  name="protein"
                  value={item.protein || ""}
                  placeholder="Protein (g)"
                  onChange={onInputChange("protein")}
                />
                <input
                  type="number"
                  name="fat"
                  value={item.fat || ""}
                  placeholder="Fat (g)"
                  onChange={onInputChange("fat")}
                />
                <input
                  type="number"
                  name="calories"
                  value={item.carbs || ""}
                  placeholder="Carbs (g)"
                  onChange={onInputChange("carbs")}
                />
              </div>
              <div className="items">
                <p>Add Items to todays record</p>
                {items.map((item) => (
                  <div>
                    <button key={uuidv4()} onClick={() => onAddToRecord(item)}>
                      {item.name}
                    </button>
                    <button
                      className="deleteBtn"
                      onClick={() => onDeleteItem(item)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          <button onClick={onSaveRecord}>Save Record</button>
          <table className="record">
            <thead>
              <tr>
                <th>Name</th>
                <th>Calories</th>
                <th>Protein</th>
                <th>Fat</th>
                <th>Carbs</th>
              </tr>
            </thead>
            <tbody>
              {record.map((item: Item, index: number) => (
                <tr key={uuidv4()}>
                  <td>{item.name}</td>
                  <td>{item.calories}</td>
                  <td>{item.protein}</td>
                  <td>{item.fat}</td>
                  <td>{item.carbs}</td>
                  <td onClick={() => onRemoveFromRecord(index)}>X</td>
                </tr>
              ))}
              <tr>
                <td>Total</td>
                <td>{totalCalories}</td>
                <td>{totalProtein}</td>
                <td>{totalFats}</td>
                <td>{totalCarbs}</td>
              </tr>
            </tbody>
          </table>
        </>
      ) : (
        <>
          <div>Log in to track your macros for today</div>
          <input
            type="string"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={onLogin}>Log me in!</button>
          <button onClick={onSignUp}>Sign me up!</button>
        </>
      )}
    </div>
  );
}

export default App;
