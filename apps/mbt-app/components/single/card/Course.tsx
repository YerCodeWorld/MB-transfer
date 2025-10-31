import { MdOutlineTimer } from "react-icons/md";

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
  return (
    <div
      className={`cursor-pointer flex h-fit w-full flex-col rounded-[20px] bg-white bg-clip-border p-4 !pb-10 shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none 2xl:flex-row 3xl:h-[310px] ${extra}`}
      onClick={onClick}
    >
      <div
        className={`${bgBox} bg-center bg-no-repeat bg-cover object-cover transition duration-300 ease-out group-hover:scale-105 mr-8 flex min-h-[200px] min-w-full items-center justify-center rounded-xl text-[100px] 2xl:h-[270px] 2xl:min-w-[470px]`}
      >
        <span className=" bg-accent-50/80 dark:bg-accent-400/80 text-accent-300 dark:text-accent-50 p-4 rounded-lg">
          {icon}
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
            <div className="flex w-max justify-end gap-1 font-medium">
              <p className="mt-2 w-max text-gray-600"> {day} •</p>
              <p className="mt-2 w-max text-base text-navy-700 dark:text-white">
                {" "}
                {date}{" "}
              </p>
            </div>
          </div>

          {/* marketing button */}
          <div className="mt-4 flex flex-col flex-wrap items-center gap-2 md:flex-row">
            <div className="flex h-7 w-max items-center justify-center rounded-lg bg-neutral-200 px-2 text-xs font-bold uppercase tracking-wide text-brand-500 dark:bg-white/5 dark:text-white">
              {topics[0]}
            </div>
            <div className="flex h-7 w-max items-center justify-center rounded-lg bg-neutral-200 px-2 text-xs font-bold uppercase tracking-wide text-brand-500 dark:bg-white/5 dark:text-white">
              {topics[1]}
            </div>
            <div
              className={`flex h-7 w-max items-center justify-center rounded-lg px-2 text-xs font-bold uppercase tracking-wide ${
                topics[2]
                  ? "bg-neutral-200 text-brand-500 dark:bg-white/5 dark:text-white"
                  : "!hidden"
              } `}
            >
              {topics[2]}
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-navy-700 dark:text-white 2xl:ml-auto">
              <p>
                <MdOutlineTimer />
              </p>
              <p> {time} </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Course;
