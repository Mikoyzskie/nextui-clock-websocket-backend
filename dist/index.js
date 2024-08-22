"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const directus_1 = require("./directus/directus");
const socket_io_1 = require("socket.io");
const moment_1 = __importDefault(require("moment"));
const error_enum_1 = require("./common/enums/error.enum");
const express = require("express");
const server = (0, http_1.createServer)();
const socket = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST"],
    },
});
socket.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, directus_1.getEmployees)();
    console.log("User connected", socket.id);
    let recentLog = "";
    let authenticatedUser;
    socket.emit("EMPLOYEE_LIST", JSON.stringify(data, null, 2));
    socket.on("USER_CHECK", (id, password) => __awaiter(void 0, void 0, void 0, function* () {
        const user = JSON.parse(yield (0, directus_1.getEmployee)(id));
        if (user) {
            const isValidPin = yield (0, directus_1.verifyPin)(password, user.employee_pin);
            if (!isValidPin) {
                return socket.emit("ERROR", error_enum_1.ErrorMessage.AUTH_ERROR);
            }
            authenticatedUser = user;
            const [data] = JSON.parse(yield (0, directus_1.getRecentClock)(authenticatedUser.id));
            const recentTimeIn = (0, moment_1.default)(data.clock_in_utc);
            const timeAfter14Hours = recentTimeIn.add(14, "hours");
            console.log(recentTimeIn);
            socket.emit("USER_LOGGED");
            socket.emit("LOADING_DONE");
        }
        else {
            socket.emit("ERROR", error_enum_1.ErrorMessage.NOT_FOUND);
        }
    }));
}));
server.listen(4000, () => {
    console.log("Server started on port", 4000);
});
