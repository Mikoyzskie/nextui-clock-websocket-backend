export interface RecentLog {
 id: number;
 date_created: string;
 date_updated: null | string;
 clock_user: number;
 clock_in_utc: string;
 clock_out_utc: null | string;
 local_device_timezone: string;
 timezone_offset: string;
}
