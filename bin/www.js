const app = require("../app");
app.listen(process.env.PORT, () =>
  console.log(`Listning at http://localhost:${process.env.PORT}`)
);
console.log(process.env.SOCKET_PORT);
