import {
 createDirectus,
 staticToken,
 rest,
 readItems,
 readItem,
 verifyHash,
 createItem,
 updateItem,
} from "@directus/sdk";

require("dotenv").config();

const apiClient = process.env.DIRECTUS_API_KEY
 ? createDirectus("https://data.zanda.info")
    .with(staticToken("YQRwVAFUn-LlC_IOPoOkpVLeH75QBlyI"))
    .with(rest({ credentials: "include" }))
 : undefined;

const attendance: any = "Attendance_Clocks";

const employees: any = "Employees";

export async function getEmployees() {
 try {
  const data = await apiClient?.request(
   readItems(employees, {
    fields: ["id", "Employee_Username", "employee_pin", "Clock_Status"],
   })
  );
  return data;
 } catch (error) {
  return error;
 }
}

export async function getEmployee(id: number): Promise<string> {
 try {
  const data = await apiClient?.request(
   readItem(employees, id, {
    fields: ["id", "Employee_Username", "employee_pin", "Clock_Status"],
   })
  );

  return JSON.stringify(data, null, 2);
 } catch (error) {
  return JSON.stringify(error, null, 2);
 }
}

export async function verifyPin(pin: string, hash: string) {
 return apiClient?.request(verifyHash(pin, hash));
}

export async function getRecentClock(user: number): Promise<string> {
 try {
  const data = await apiClient?.request(
   readItems(attendance, {
    fields: ["*"],
    filter: {
     clock_user: {
      _eq: user,
     },
    },
    sort: ["-date_created"],
    limit: 1,
   })
  );

  return JSON.stringify(data);
 } catch (error) {
  return JSON.stringify(error, null, 2);
 }
}

const iplist: any = "time_clock_allowed_ips";

export async function checkIpAddress(ip: string) {
 return await apiClient?.request(
  readItems(iplist, {
   fields: ["IP_Address"],
   filter: {
    IP_Address: {
     _eq: ip,
    },
   },
  })
 );
}

const log: any = "Attendance_Clocks";

export async function AttendanceIn(
 user: number,
 timein: string,
 timezone: string,
 offset: string
) {
 try {
  const data = await apiClient?.request(
   createItem(log, {
    clock_user: user,
    clock_in_utc: timein,
    local_device_timezone: timezone,
    timezone_offset: offset,
   })
  );

  return data;
 } catch (error) {
  return error;
 }
}

export async function ExtendTimeIn(user: number) {
 try {
  const data = await apiClient?.request(
   updateItem(employees, user, {
    Clock_Status: true,
   })
  );

  return data;
 } catch (error) {
  return error;
 }
}

export async function AttendanceOut(id: number, timeout: string) {
 try {
  const data = await apiClient?.request(
   updateItem(log, id, {
    clock_out_utc: timeout,
   })
  );

  return data;
 } catch (error) {
  return error;
 }
}

export async function ExtendTimeOut(user: number) {
 try {
  const data = await apiClient?.request(
   updateItem(employees, user, {
    Clock_Status: false,
   })
  );

  return data;
 } catch (error) {
  return error;
 }
}
