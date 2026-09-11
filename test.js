import "dotenv/config";
import { login } from "./src/modules/auth/auth.service.js";

await login({
  email: "admin@hrm.dev",
  password: "admin123",
});


console.log(` ------------------------------`);
console.log(` --------Test finished---------`);
console.log(` ------------------------------`);

