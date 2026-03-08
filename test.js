import "dotenv/config";
import { login } from "./src/modules/auth/auth.service.js";

await login({
  email: "test@test.com",
  password: "123456",
});

console.log("Test finished");
