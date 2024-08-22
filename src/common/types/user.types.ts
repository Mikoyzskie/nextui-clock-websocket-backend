interface IEmployees {
 id: number;
 employee_pin: string;
 Employee_Username: string;
 Clock_Status: boolean;
}

interface UserLogDto {
 id: number;
 password: string;
 ipaddress: string;
 localTime: string;
 timezoneOffset: string;
 timezoneClient: string;
}

export { IEmployees, UserLogDto };
