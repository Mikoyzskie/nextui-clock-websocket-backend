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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmployees = getEmployees;
exports.getEmployee = getEmployee;
exports.verifyPin = verifyPin;
exports.getRecentClock = getRecentClock;
exports.checkIpAddress = checkIpAddress;
exports.AttendanceIn = AttendanceIn;
exports.ExtendTimeIn = ExtendTimeIn;
exports.AttendanceOut = AttendanceOut;
exports.ExtendTimeOut = ExtendTimeOut;
const sdk_1 = require("@directus/sdk");
require("dotenv").config();
const apiClient = process.env.DIRECTUS_API_KEY
    ? (0, sdk_1.createDirectus)("https://data.zanda.info")
        .with((0, sdk_1.staticToken)("YQRwVAFUn-LlC_IOPoOkpVLeH75QBlyI"))
        .with((0, sdk_1.rest)({ credentials: "include" }))
    : undefined;
const attendance = "Attendance_Clocks";
const employees = "Employees";
function getEmployees() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (apiClient === null || apiClient === void 0 ? void 0 : apiClient.request((0, sdk_1.readItems)(employees, {
                fields: ["id", "Employee_Username", "employee_pin", "Clock_Status"],
            })));
            return data;
        }
        catch (error) {
            return error;
        }
    });
}
function getEmployee(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (apiClient === null || apiClient === void 0 ? void 0 : apiClient.request((0, sdk_1.readItem)(employees, id, {
                fields: ["id", "Employee_Username", "employee_pin", "Clock_Status"],
            })));
            return JSON.stringify(data, null, 2);
        }
        catch (error) {
            return JSON.stringify(error, null, 2);
        }
    });
}
function verifyPin(pin, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiClient === null || apiClient === void 0 ? void 0 : apiClient.request((0, sdk_1.verifyHash)(pin, hash));
    });
}
function getRecentClock(user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (apiClient === null || apiClient === void 0 ? void 0 : apiClient.request((0, sdk_1.readItems)(attendance, {
                fields: ["*"],
                filter: {
                    clock_user: {
                        _eq: user,
                    },
                },
                sort: ["-date_created"],
                limit: 1,
            })));
            return JSON.stringify(data);
        }
        catch (error) {
            return JSON.stringify(error, null, 2);
        }
    });
}
const iplist = "time_clock_allowed_ips";
function checkIpAddress(ip) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (apiClient === null || apiClient === void 0 ? void 0 : apiClient.request((0, sdk_1.readItems)(iplist, {
            fields: ["IP_Address"],
            filter: {
                IP_Address: {
                    _eq: ip,
                },
            },
        })));
    });
}
const log = "Attendance_Clocks";
function AttendanceIn(user, timein, timezone, offset) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (apiClient === null || apiClient === void 0 ? void 0 : apiClient.request((0, sdk_1.createItem)(log, {
                clock_user: user,
                clock_in_utc: timein,
                local_device_timezone: timezone,
                timezone_offset: offset,
            })));
            return data;
        }
        catch (error) {
            return error;
        }
    });
}
function ExtendTimeIn(user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (apiClient === null || apiClient === void 0 ? void 0 : apiClient.request((0, sdk_1.updateItem)(employees, user, {
                Clock_Status: true,
            })));
            return data;
        }
        catch (error) {
            return error;
        }
    });
}
function AttendanceOut(id, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (apiClient === null || apiClient === void 0 ? void 0 : apiClient.request((0, sdk_1.updateItem)(log, id, {
                clock_out_utc: timeout,
            })));
            return data;
        }
        catch (error) {
            return error;
        }
    });
}
function ExtendTimeOut(user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (apiClient === null || apiClient === void 0 ? void 0 : apiClient.request((0, sdk_1.updateItem)(employees, user, {
                Clock_Status: false,
            })));
            return data;
        }
        catch (error) {
            return error;
        }
    });
}
