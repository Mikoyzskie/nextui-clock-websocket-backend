import { createServer } from "http";
import {
 getEmployees,
 getEmployee,
 verifyPin,
 getRecentClock,
 checkIpAddress,
 AttendanceIn,
 ExtendTimeIn,
 AttendanceOut,
 ExtendTimeOut,
} from "./directus/directus";
import { Server } from "socket.io";

import moment from "moment";

import { ErrorMessage } from "./common/enums/error.enum";
import { IEmployees, RecentLog, UserLogDto } from "./common/types/types";

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

 socket.on("USER_CHECK", async (args: string) => {
  const argUser: UserLogDto = JSON.parse(args);
  const user: IEmployees = JSON.parse(await getEmployee(argUser.id));

  const isValidIpAddres = await checkIpAddress(argUser.ipaddress);

  if (isValidIpAddres && isValidIpAddres.length === 0) {
   return socket.emit("ERROR", "IP Address Invalid");
  }

  if (user && argUser) {
   const isValidPin = await verifyPin(argUser.password, user.employee_pin);

   if (!isValidPin) {
    return socket.emit("ERROR", ErrorMessage.AUTH_ERROR);
   }

   authenticatedUser = user;

   const [data]: RecentLog[] = JSON.parse(
    await getRecentClock(authenticatedUser.id)
   );

   const recentTimeIn = moment(data.clock_in_utc);
   const timeAfter14Hours = recentTimeIn.add(14, "hours");
   const has14HoursPassed = moment(argUser.localTime).isAfter(timeAfter14Hours);

   if (data.clock_out_utc) {
    if (has14HoursPassed) {
     await AttendanceIn(
      authenticatedUser.id,
      argUser.localTime,
      argUser.timezoneClient,
      argUser.timezoneOffset
     );
     await ExtendTimeIn(authenticatedUser.id);

     socket.emit("USER_LOGGED", "Timed In. Have a nice day!");
    } else {
     return socket.emit("ERROR", ErrorMessage.LOGGED);
    }
   } else {
    if (has14HoursPassed) {
     await AttendanceIn(
      authenticatedUser.id,
      argUser.localTime,
      argUser.timezoneClient,
      argUser.timezoneOffset
     );
     await AttendanceOut(authenticatedUser.id, "No Log");

     socket.emit("USER_LOGGED", "Timed In. Have a nice day!");
    } else {
     await AttendanceOut(data.id, argUser.localTime);
     await ExtendTimeOut(authenticatedUser.id);

     socket.emit("USER_LOGGED", "Timed Out. See you tomorrow!");
    }
   }
  } else {
   return socket.emit("ERROR", ErrorMessage.NOT_FOUND);
  }
 });
});

server.listen(4000, () => {
 console.log("Server started on port", 4000);
});
