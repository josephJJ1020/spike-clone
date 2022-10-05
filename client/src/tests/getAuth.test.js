import { getAuth } from "../controllers/getAuth";

test("Login test", async () => {
  const email = "joseph.joseph10@outlook.com";
  const password = ".Newpassword10";

  const results = await getAuth({
    email,
    password,
    action: "LOGIN",
  });

  await expect(results.userData.user.email).toEqual(email);
});
