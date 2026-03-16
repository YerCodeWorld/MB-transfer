import { WorkdayService, WorkdayServiceApiItem } from "../types";
import { convertIsoStringTo12h, time12ToMinutes } from "@/utils/services";

export const getTimelineRange = (services: WorkdayService[]) => {
	if (services.length === 0) {
		return { min: 8 * 60, max: 18 * 60 };
	}

	const validMinutes = services
		.map((service) => service.timeInMinutes)
		.filter((minutes) => Number.isFinite(minutes) && minutes > 0);

	if (validMinutes.length === 0) {
		return { min: 8 * 60, max: 18 * 60 };
	}

	const min = Math.max(0, Math.min(...validMinutes) - 45);
	const max = Math.min(24 * 60, Math.max(...validMinutes) + 45);

	if (max - min < 120) {
		return {
			min: Math.max(0, min - 30),
			max: Math.min(24 * 60, max + 30),
		};
	}

	return { min, max };
}

export const formatServiceTime = (rawValue: string): string => {
	const normalized = String(rawValue || "").trim();
	if (!normalized) return "--:--";
	return convertIsoStringTo12h(normalized);
}

export const clampIndex = (index: number, length: number): number => {
	if (length <= 0) return 0;
	if (index < 0) return 0;
	if (index > length - 1) return length - 1;
	return index;
}

export const mapRoute = (service: WorkdayServiceApiItem): string => {
	if (service.route?.name) return service.route.name;
	if (service.routeName) return service.routeName;
	const pickup = service.pickup?.name ?? service.pickupLocationName ?? "Origen";
	const dropoff = service.dropoff?.name ?? service.dropoffLocationName ?? "Destino";
	return `${pickup} -> ${dropoff}`;
}

export const mapService = (service: WorkdayServiceApiItem): WorkdayService => {
	const amount = Number(service.price ?? 0);
	const time = formatServiceTime(service.pickupTime);
	return {
		id: service.id,
		code: service.code ?? service.id,
		time,
		passenger: service.clientName,
		route: mapRoute(service),
		driverId: service.driver?.id ?? null,
		driver: service.driver?.name ?? null,
		state: service.state,
		revenue: Number.isFinite(amount) ? amount : 0,
		startsInMinutes: service.startsInMinutes,
		notifyIn30Min: service.notifyIn30Min,
		timeInMinutes: time12ToMinutes(time),
	};
}

export const formatSelectedDateLabel = (date: string): string => {
	const [year, month, day] = date.split("-").map(Number);
	const safeDate = new Date(year, month - 1, day);
	return safeDate.toLocaleDateString("es-DO", {
		weekday: "long",
		day: "2-digit",
		month: "long", year: "numeric",
	});
}

export const formatTimelineTick = (minutes: number): string => {
	const safe = Math.max(0, Math.min(24 * 60, minutes));
	const hours24 = Math.floor(safe / 60);
	const mins = safe % 60;
	const period = hours24 >= 12 ? "PM" : "AM";
	const hours12 = hours24 % 12 || 12;
	return `${hours12}:${String(mins).padStart(2, "0")} ${period}`;
}



