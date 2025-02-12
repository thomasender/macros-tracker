export type Item = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type Record = { date: string; record: Item[] };
