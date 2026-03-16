import { WorkdaySimulation, DriverOption, WorkdayStatus, WorkdayServiceApiItem } from "../types";

function combineDateAndTime(date: string, time: string): Date {
	const [year, month, day] = date.split("-").map(Number);
	const [hours, minutes] = time.split(":").map(Number);
	return new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
}

function createMockService(
	id: string,
	code: string,
	clientName: string,
	route: string,
	pickupTime: string,
	now: Date,
	driver?: { id: string; name: string } | null,
	price?: number
): WorkdayServiceApiItem {
	const pickupDate = new Date(pickupTime);
	const startsInMinutes = Math.round((pickupDate.getTime() - now.getTime()) / 60000);

	let bucket: WorkdayStatus = "upcoming";
	let state: ServiceState = "UPCOMING";

	if (startsInMinutes < -45) {
		bucket = "past";
		state = "COMPLETED";
	} else if (startsInMinutes <= 20) {
		bucket = "ongoing";
		state = "ONGOING";
	}

	return {
		id,
		code,
		clientName,
		pickupTime,
		state,
		price: price ?? 45,
		driver: driver ?? null,
		routeName: route,
		startsInMinutes,
		notifyIn30Min: startsInMinutes >= 0 && startsInMinutes <= 30,
		bucket,
	};
}

function formatTimeForIso(time: string): string {
	const [hours, minutes] = time.split(":");
	return `${String(hours || "00").padStart(2, "0")}:${String(minutes || "00").padStart(2, "0")}:00.000Z`;
}

export function buildMockWorkdayData(simulation: WorkdaySimulation, drivers: DriverOption[]) {
	const now = combineDateAndTime(simulation.date, simulation.time);
	const driverPool = drivers.length ? drivers : [
		{ id: "mock-driver-1", name: "Carlos M." },
		{ id: "mock-driver-2", name: "Luisa P." },
		{ id: "mock-driver-3", name: "Rafael S." },
	];

	const services = [
		createMockService(
			"mock-1",
			"MBT-101",
			"Mia Rivas",
			"Punta Cana Airport -> Westin Puntacana",
			`${simulation.date}T06:40:00.000Z`,
			now,
			driverPool[0] ?? null,
			48
		),
		createMockService(
			"mock-2",
			"AT-204",
			"Ethan Brooks",
			"Lopesan -> Airport",
			`${simulation.date}T08:15:00.000Z`,
			now,
			driverPool[1] ?? null,
			52
		),
		createMockService(
			"mock-3",
			"ST-331",
			"Sofia Herrera",
			"Zel Cap Cana -> BlueMall",
			`${simulation.date}T${formatTimeForIso("09:45")}`,
			now,
			driverPool[2] ?? null,
			39
		),
		createMockService(
			"mock-4",
			"MBT-402",
			"Nathan Cole",
			"Airport -> Eden Roc",
			`${simulation.date}T${formatTimeForIso(simulation.time)}`,
			now,
			driverPool[0] ?? null,
			90
		),
		createMockService(
			"mock-5",
			"MBT-417",
			"Valentina Cruz",
			"Secrets Cap Cana -> Marina",
			`${simulation.date}T${formatTimeForIso("14:10")}`,
			now,
			null,
			63
		),
		createMockService(
			"mock-6",
			"AT-589",
			"Oliver Kent",
			"Airport -> Hyatt Ziva",
			`${simulation.date}T${formatTimeForIso("14:30")}`,
			now,
			driverPool[1] ?? null,
			59
		),
		createMockService(
			"mock-7",
			"ST-610",
			"Isabella Peña",
			"Hard Rock -> BlueMall",
			`${simulation.date}T${formatTimeForIso("16:05")}`,
			now,
			null,
			41
		),
		createMockService(
			"mock-8",
			"MBT-777",
			"Noah Vega",
			"Airport -> Tortuga Bay",
			`${simulation.date}T${formatTimeForIso("18:20")}`,
			now,
			null,
			72
		),
	];

	const buckets: Record<WorkdayStatus, WorkdayServiceApiItem[]> = {
		past: [],
		ongoing: [],
		upcoming: [],
	};

	services.forEach((service) => {
		buckets[service.bucket].push(service);
	});

	return {
		date: simulation.date,
		itineraryId: "mock-itinerary",
		buckets,
		counts: {
			total: services.length,
			past: buckets.past.length,
			ongoing: buckets.ongoing.length,
			upcoming: buckets.upcoming.length,
			notifyIn30Min: services.filter((service) => service.notifyIn30Min).length,
		},
	};
}


