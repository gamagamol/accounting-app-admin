import { w as writable } from "./index.js";
import { u as currentUser } from "./dataStore.js";
const initialUsers = [
  currentUser,
  {
    id: "usr-002",
    name: "Siti Aminah",
    email: "siti.aminah@byond.co.id",
    role: "SALES_ADMIN",
    avatar: ""
  },
  {
    id: "usr-003",
    name: "Bambang Soepomo",
    email: "bambang.s@byond.co.id",
    role: "ACCOUNTING_ADMIN",
    avatar: ""
  },
  {
    id: "usr-004",
    name: "Dewi Sartika",
    email: "dewi.sartika@byond.co.id",
    role: "OWNER",
    avatar: ""
  }
];
const user = writable(currentUser);
const systemUsers = writable(initialUsers);
export {
  systemUsers as s,
  user as u
};
