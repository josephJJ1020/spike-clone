const { controller } = require("../controllers/controller");

it("Test creating user", async () => {
  const email = "email@email.com";
  const password = "samplepassword10";
  const emailService = "HOTMAIL";
  const inboundHost = "outlook.office365.com";
  const inboundPort = 993;

  const results = await controller.createUser({
    email,
    password,
    appPassword: null,
    emailService,
    inboundHost,
    inboundPort,
    outboundHost: null,
    outboundPort: null,
  });
  
  await expect(results.email).toEqual(email);
});
