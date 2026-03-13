import { useMemo } from "react";
import { useNavigation } from "../../contexts/NavigationContext";

import MiniCalendar from "../../components/single/minicalendar";
import Card from "../../components/single/card";

import AT from "./services/AirportTransferService";
import ST from "./services/SacbeTransferService";
import MBT from "./services/MBTransferService";

import { BsArrowRight } from "react-icons/bs";
import { GoCodescan, GoFileDiff } from "react-icons/go";
import { PiAddressBookThin, PiAirplaneBold } from "react-icons/pi";

export interface ServiceCompany {
	id: string;
	bgBox: string;
	icon: any;
	title: string;
	desc: string;
	day: string;
	date: string;
}

export const serviceCompanies: ServiceCompany[] = [
	{
		id: 'at',
		bgBox: "bg-[url('/at-website.png')]",
		icon: GoCodescan,
		title: "AirportTransfer",
		desc: "Consigue los servicios de AT automáticamente con la utilidad que intercepta una solicitud a su base de datos.",
		day: "AT",
		date: "HTTPS",
	},
	{
		id: 'st',
		bgBox: "bg-[url('/st-website.png')]",
		icon: GoFileDiff,
		title: "Sacbé Transfer",
		desc: "Consigue los servicios de ST subiendo el XLSX actualizado. La página a utilizar se detecta automáticamente.",
		day: "ST",
		date: "XLSX",
	},
	{
		id: 'mbt',
		bgBox: "bg-[url('/mbt-website.png')]",
		icon: PiAddressBookThin,
		title: "MB Transfer",
		desc: "Crea los servicios de MBT utilizando los formularios de la plataforma.",
		day: "MBT",
		date: "FORM",
	}
];

const ServiceCreationView = () => {
	const { pushView } = useNavigation();

	const handleServiceClick = (serviceType: string, title: string) => {
		let component;

		switch (serviceType) {
			case 'at':
				component = AT;
				break;
			case 'st':
				component = ST;
				break;
			case 'mbt':
				component = MBT;
				break;
			default:
				component = undefined;
		}

		pushView({
			id: `service-${serviceType}`,
			label: title,
			data: { serviceType, title },
			component
		});
	};

  return (
    <main className="flex w-full flex-col font-dm md:gap-7 lg:flex-row">
      <div className="flex-1 p-5 pt-0 lg:pt-5">
        <div className="mb-6 bg-white p-6 shadow-xl dark:bg-navy-800">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-500">
            Creación de Servicios
          </p>
          <h1 className="mt-2 text-2xl font-bold text-navy-700 dark:text-white">
            Herramientas de captura y creación
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-300">
            Selecciona una herramienta para obtener o crear servicios. Cada opción te lleva al flujo detallado que ya existe para Airport Transfer, Sacbé Transfer y MB Transfer.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {serviceCompanies.map((service) => {
            const ServiceIcon = service.icon;

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => handleServiceClick(service.id, service.title)}
                className="group w-full overflow-hidden rounded-[24px] border border-gray-200 bg-white text-left shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-accent-300 hover:shadow-2xl dark:border-white/10 dark:bg-navy-800 dark:hover:border-accent-500/40"
              >
                <div className="flex flex-col md:flex-row">
                  <div className={`min-h-[180px] md:min-h-[220px] md:w-[240px] m-3 rounded-2xl ${service.bgBox} bg-cover bg-center`} />

                  <div className="flex flex-1 items-center justify-between gap-6 p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 rounded-2xl bg-accent-50 p-4 text-accent-600 transition-colors group-hover:bg-accent-100 dark:bg-accent-900/20 dark:text-accent-200">
                        <ServiceIcon className="text-3xl" />
                      </div>

                      <div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:bg-white/10 dark:text-gray-300">
                            {service.day}
                          </span>
                          <span className="text-xs font-medium uppercase tracking-wide text-accent-500">
                            {service.date}
                          </span>
                        </div>

                        <h2 className="mt-3 text-2xl font-bold text-navy-700 dark:text-white">
                          {service.title}
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                          {service.desc}
                        </p>
                      </div>
                    </div>

                    <div className="hidden shrink-0 items-center gap-3 md:flex">
                      <div className="rounded-full bg-accent-500 p-3 text-white transition-transform duration-200 group-hover:translate-x-1">
                        <BsArrowRight className="text-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </main>
  );
};

export default ServiceCreationView;
