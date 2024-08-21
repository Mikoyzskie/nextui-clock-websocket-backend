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

const attendance: string = "Attendance_Clocks";

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

export async function getEmployee(id: string): Promise<string> {
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

export async function getRecentClock(user: number) {
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

  return data;
 } catch (error) {
  return error;
 }
}
