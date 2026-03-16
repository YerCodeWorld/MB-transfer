
type WorkdayStatus = "past" | "ongoing" | "upcoming";
type ServiceState = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELED" | "REFUNDED";

export interface WorkdayServiceApiItem {
	id: string;
	code?: string | null;
	clientName: string;
	pickupTime: string;
	state: ServiceState;
	price?: string | number | null;
	driver?: { id: string; name: string } | null;
	route?: { id: string; name: string } | null;
	routeName?: string | null;
	pickup?: { id: string; name: string } | null;
	dropoff?: { id: string; name: string } | null;
	pickupLocationName?: string | null;
	dropoffLocationName?: string | null;
	startsInMinutes: number;
	notifyIn30Min: boolean;
	bucket: WorkdayStatus;
}

export interface WorkdayService {
	id: string;
	code: string;
	time: string;
	passenger: string;
	route: string;
	driverId: string | null;
	driver: string | null;
	state: ServiceState;
	revenue: number;
	startsInMinutes: number;
	notifyIn30Min: boolean;
	timeInMinutes: number;
}

export interface DriverOption {
	id: string;
	name: string;
}

export interface WorkdaySimulation {
	enabled: boolean;
	date: string;
	time: string;
}


