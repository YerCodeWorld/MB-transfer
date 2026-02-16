import Card from "../../../components/single/card";

const routes = [
  { id: "r1", name: "Punta Cana -> Bavaro", services: 318, revenue: "$22,740" },
  { id: "r2", name: "PUJ -> Cap Cana", services: 204, revenue: "$16,120" },
  { id: "r3", name: "Santo Domingo -> La Romana", services: 169, revenue: "$13,560" },
  { id: "r4", name: "Bavaro -> Uvero Alto", services: 147, revenue: "$9,840" },
];

const TopRoutes = () => {
  return (
    <Card extra="h-[360px] p-5">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-navy-700 dark:text-white">
          Rutas con Mayor Volumen
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ranking mensual de demanda e ingresos
        </p>
      </div>

      <div className="space-y-3">
        {routes.map((route, index) => (
          <div
            key={route.id}
            className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-navy-800"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-navy-700 dark:text-white">
                  {index + 1}. {route.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {route.services} servicios
                </p>
              </div>
              <p className="text-sm font-bold text-green-600 dark:text-green-400">
                {route.revenue}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TopRoutes;
