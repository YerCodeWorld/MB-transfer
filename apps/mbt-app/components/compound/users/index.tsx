import SearchTableUsers from "./components/SearchTableUsersOverview";
import Card from "../../single/card";

type RowObj = {
	name: string[];
	email: string;
	username: string;
	date: string;
	type: string;
	actions: any;
};

const tableDataUsersOverview: RowObj[] = [
	
  {
    name: ["Maicol Fee Báez", "https://i.ibb.co/zPxBHYv/241143773-8212166459343985239-7834018950652403662-n-1.jpg"],
    email: "vlad@simmmple.com",
    username: "@vladmihalache",
    date: "Oct 24, 2022",
    type: "Administrador", 
    actions: "Parameter"
  }, 
  {
    name: ["Maiki Rodriguez", "https://i.ibb.co/5r8xc6T/218987537-368849674583041-6903848186366518125-n.jpg"],
    email: "fredy@simmmple.com",
    username: "@fredyandrei",
    date: "Nov 17, 2019",
    type: "Coordinador", 
    actions: "Parameter"
  }, 
  {
    name: ["Yimi Paredes", "https://i.ibb.co/7p0d1Cd/Frame-24.png"],
    email: "mark@yahoo.com",
    username: "@user0215",
    date: "Jan 30, 2021",
    type: "Manejador de Servicios", 
    actions: "Parameter"
  }, 
  {
    name: ["Yahir Adolfo Beras", "https://images.unsplash.com/photo-1628157588553-5eeea00af15c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1780&q=80"],
    email: "yahiradolfo37@gmail.com",
    username: "@marcus.aurelius",
    date: "Aug 02, 2021",
    type: "Desarrollador", 
    actions: "Parameter"
  }, 
  {
    name: ["Lorentz Michael", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1780&q=80"],
    email: "lorentz@gmail.com",
    username: "@lorentz.0002",
    date: "Apr 19, 2021",
    type: "Representante", 
    actions: "Parameter"
  }
];

const UserOverview = () => {
  return (
    <Card extra={"w-full h-full mt-10"}>
      <SearchTableUsers tableData={tableDataUsersOverview} />
    </Card>
  );
};

export default UserOverview;
