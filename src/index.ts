import { createServer } from "http";
import {
 getEmployees,
 getEmployee,
 verifyPin,
 getRecentClock,
} from "./directus/directus";
import { Server } from "socket.io";

import { ErrorMessage } from "./common/enums/error.enum";
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

 socket.on("RECENT_LOG", async (id: number) => {
  try {
   const data = await getRecentClock(id);

   if (!data) {
    socket.emit("ERROR", ErrorMessage.SERVER_ERROR);
    return;
   }
   return data;
  } catch (error) {
   socket.emit("ERROR", ErrorMessage.SERVER_ERROR);
  }
 });

 socket.on("CLOCK_IN", async (id: number) => {
  try {
  } catch (error) {
   socket.emit("ERROR", ErrorMessage.SERVER_ERROR);
  }
 });

 socket.on("USER_CHECK", async (id, password) => {
  const user: IEmployees = JSON.parse(await getEmployee(id));

  if (user) {
   const isValidPin = await verifyPin(password, user.employee_pin);

   if (!isValidPin) {
    socket.emit("ERROR", ErrorMessage.AUTH_ERROR);
   } else {
    socket.emit("USER_LOGGED");
   }
   socket.emit("LOADING_DONE");
  } else {
   socket.emit("ERROR", ErrorMessage.NOT_FOUND);
  }
 });
});

server.listen(4000, () => {
 console.log("Server started on port", 4000);
});
