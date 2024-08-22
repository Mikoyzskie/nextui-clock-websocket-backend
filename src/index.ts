import { createServer } from "http";
import {
 getEmployees,
 getEmployee,
 verifyPin,
 getRecentClock,
 checkIpAddress,
} from "./directus/directus";
import { Server } from "socket.io";

import moment from "moment";

import { ErrorMessage } from "./common/enums/error.enum";
import { IEmployees, RecentLog } from "./common/types/types";

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

 console.log("User connected", socket.id);

 let recentLog = "";
 let authenticatedUser;

 socket.emit("EMPLOYEE_LIST", JSON.stringify(data, null, 2));

 socket.on("USER_CHECK", async (id, password) => {
  const user: IEmployees = JSON.parse(await getEmployee(id));

  if (user) {
   const isValidPin = await verifyPin(password, user.employee_pin);

   if (!isValidPin) {
    return socket.emit("ERROR", ErrorMessage.AUTH_ERROR);
   }

   authenticatedUser = user;

   const [data]: RecentLog[] = JSON.parse(
    await getRecentClock(authenticatedUser.id)
   );

   const recentTimeIn = moment(data.clock_in_utc);
   const timeAfter14Hours = recentTimeIn.add(14, "hours");
   console.log(recentTimeIn);

   socket.emit("USER_LOGGED");

   socket.emit("LOADING_DONE");
  } else {
   socket.emit("ERROR", ErrorMessage.NOT_FOUND);
  }
 });
});

server.listen(4000, () => {
 console.log("Server started on port", 4000);
});
