import Course from "../../single/card/Course";
import MiniCalendar from "../../single/minicalendar";

import EtherLogoOutline from "../../icons/EtherLogoOutline";
import { useState } from "react";
import { GoCodescan, GoFileDiff } from "react-icons/go";
import { MdOutlineUpgrade } from "react-icons/md";
import { PiAddressBookThin, PiAirplaneBold } from "react-icons/pi";

import Schedule from "./components/Schedule";
import Hours from "./components/Hours";
import Card from "../../single/card";

const Courses = () => {
  const [toggleState, setToggleState] = useState(1);

  const toggleTab = (index: number) => {
    setToggleState(index);
  };
  return (
    <div className="mt-3 flex h-full w-full flex-col font-dm md:gap-7 lg:flex-row">
      <div className="h-full w-full rounded-[20px] mb-[80px]">                 

        {/* course section */}
        <Course
          extra="mb-5"
          bgBox="bg-[url('/all.jpg')]"
          icon={<PiAirplaneBold />}
          title="All Services"
          desc="Visualize, create, edit, remove and manipulate all the services updated beforehand using the other tools."
          day="ALL"
          date="Platform"
          topics={["Semi-Automatic", "ALL"]}
          time="~25 minutos de trabajo"
        />
        
        <Course
          extra="mb-5"
          bgBox="bg-[url('/at-website.png')]"
          icon={<GoCodescan />}
          title="AirportTransfer"
          desc="Get AT's services by simply intercepting a GET request to their open API endpoint, services are automatically added to the itinerary"
          day="AT"
          date="HTTPS"
          topics={["Automatic", "AT"]}
          time="~10 minutos de trabajo"
        />

        <Course
          extra="mb-5"
          bgBox="bg-[url('/st-website.png')]"
          icon={<GoFileDiff />}
          title="Sacbé Transfer"
          desc="Get ST's services by simply uploading their provided XLSX file, the tools implemented automatically read and manipulate the data to add it into the itinerary."
          day="ST"
          date="XLSX"
          topics={["Semi-Automatic", "ST"]}
          time="~15 minutos de trabajo"
        />
        <Course
          bgBox="bg-[url('/mbt-website.png')] "
          icon={<PiAddressBookThin />}
          title="MB Transfer"
          desc="Create MBT's services by using a built-in form to introduce the data and submit to add to the itinerary"
          day="MBT"
          date="FORM"
          topics={["Manual", "MBT", "Individual"]}
          time="~8 minutos de trabajo"
        />

      </div>
      {/* line */}
      <div className="h-0 w-0 bg-gray-300 dark:!bg-navy-700 lg:h-[1050px] lg:w-px" />

      {/* right section */}
      <div className="mt-1 flex h-full w-full min-w-[50vh] flex-col items-center rounded-[20px] bg-white px-4 py-4 shadow-2xl shadow-gray-100 dark:!bg-navy-800 dark:shadow-none lg:w-[275px] 3xl:w-[470px] relative z-0">
        {/* Calendar */}
        <Card extra={`max-w-full`}>
          <MiniCalendar />
        </Card>
        {/* schedule */}
        <Card extra={"w-full mt-4"}>
          <Schedule />
        </Card>
        {/* Hours */}
        <Card extra={"w-full mt-4"}>
          <Hours />
        </Card>
      </div>
    </div>
  );
};

export default Courses;
