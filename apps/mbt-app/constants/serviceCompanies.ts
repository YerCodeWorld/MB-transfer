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
  topics: string[];
  time: string;
}

export const serviceCompanies: ServiceCompany[] = [
  {
    id: 'all',
    bgBox: "bg-[url('/all.jpg')]",
    icon: PiAirplaneBold,
    title: "All Services",
    desc: "Visualize, create, edit, remove and manipulate all the services updated beforehand using the other tools.",
    day: "ALL",
    date: "Platform",
    topics: ["Semi-Automatic", "ALL"],
    time: "~25 minutos de trabajo"
  },
  {
    id: 'at',
    bgBox: "bg-[url('/at-website.png')]",
    icon: GoCodescan,
    title: "AirportTransfer",
    desc: "Get AT's services by simply intercepting a GET request to their open API endpoint, services are automatically added to the itinerary",
    day: "AT",
    date: "HTTPS",
    topics: ["Automatic", "AT"],
    time: "~10 minutos de trabajo"
  },
  {
    id: 'st',
    bgBox: "bg-[url('/st-website.png')]",
    icon: GoFileDiff,
    title: "Sacbé Transfer",
    desc: "Get ST's services by simply uploading their provided XLSX file, the tools implemented automatically read and manipulate the data to add it into the itinerary.",
    day: "ST",
    date: "XLSX",
    topics: ["Semi-Automatic", "ST"],
    time: "~15 minutos de trabajo"
  },
  {
    id: 'mbt',
    bgBox: "bg-[url('/mbt-website.png')]",
    icon: PiAddressBookThin,
    title: "MB Transfer",
    desc: "Create MBT's services by using a built-in form to introduce the data and submit to add to the itinerary",
    day: "MBT",
    date: "FORM",
    topics: ["Manual", "MBT", "Individual"],
    time: "~8 minutos de trabajo"
  }
];
