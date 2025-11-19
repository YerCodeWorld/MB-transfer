import { MdOutlineTimer } from "react-icons/md";
import { GoCodescan, GoFileDiff } from "react-icons/go";
import { PiAddressBookThin, PiAirplaneBold } from "react-icons/pi";

const Course = (props: {
  bgBox: string;
  icon: React.ReactElement;
  title: string;
  desc: string;
  day: string;
  date: string;
  topics: string[];
  time: string;
  extra?: string;
  onClick?: () => void;
}) => {
  const { bgBox, icon, title, desc, day, date, topics, time, extra, onClick } = props;
  const serviceIcon = (compName: string): React.ReactElement => {
    switch (compName) {
      case 'MB Transfer':
        return <PiAddressBookThin/>;
        
      case 'AirportTransfer':
        return <GoCodescan/>;
        
      case 'Sacbé Transfer':
        return <GoFileDiff/>;

      default:
        return <PiAirplaneBold />;
    }
  }
  
  return (
    <div
      className={`cursor-pointer flex h-fit w-full flex-col rounded-[20px] bg-white bg-clip-border p-4 !pb-10 shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none 2xl:flex-row 3xl:h-[310px] ${extra}`}
      onClick={onClick}
    >
      <div
        className={`${bgBox} bg-center bg-no-repeat bg-cover object-cover transition duration-300 ease-out group-hover:scale-105 mr-8 flex min-h-[200px] min-w-full items-center justify-center rounded-xl text-[100px] 2xl:min-w-[470px]`}
      >
        <span className=" bg-accent-50/80 dark:bg-accent-400/80 text-accent-300 dark:text-accent-50 p-4 rounded-lg">
          {serviceIcon(title)}
        </span>
      </div>

      <div className="w-full justify-between pt-6 3xl:ml-8">
        <div>
          <div className="flex flex-col 2xl:flex-row">
            <div>
              <h2 className="font-bold leading-7 text-accent-700 dark:text-accent-200 md:text-[2rem]">
                {title}
              </h2>
              <p className="mt-6 mb-[10vh] text-base text-gray-600 dark:text-white">{desc} </p>
            </div>            
          </div>

          <div className="flex flex-col gap-1 text-sm font-medium text-navy-700 dark:text-white">
            <p className="flex items-center gap-2">              
              <MdOutlineTimer />
              <i>Time</i>              
            </p>
            <p> {time} </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Course;
