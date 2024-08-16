import { createServer } from "http";
import { getEmployees, getEmployee, verifyPin } from "./directus/directus";
import { Server } from "socket.io";

import { IEmployees } from "./common/types/types";

const express = require("express");
const server = createServer();
const socket = new Server(server, {
 cors: {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST"],
 },
});

socket.on("connection", async (socket) => {
 const data = await getEmployees();

 socket.emit("EMPLOYEE_LIST", JSON.stringify(data, null, 2));

 socket.on("USER_CHECK", async (id, password) => {
  const user: IEmployees = JSON.parse(await getEmployee(id));

  if (user.id) {
   const isValidPin = await verifyPin(password, user.employee_pin);

   if (!isValidPin) {
    socket.emit("ERROR", "Pin invalid");
   } else {
    socket.emit("USER_LOGGED");
   }

   socket.emit("LOADING_DONE", false);
  } else {
   socket.emit("ERROR", "User not found");
  }
 });
});

server.listen(4000, () => {
 console.log("Server started on port", 4000);
});
