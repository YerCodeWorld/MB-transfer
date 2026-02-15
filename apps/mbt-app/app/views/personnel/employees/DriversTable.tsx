"use client";

import React from "react";
import Card from "@/components/single/card";
import { FiSearch } from "react-icons/fi";
import { MdChevronRight, MdChevronLeft, MdAdd } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { getAllEmployees } from "./mockEmployees";
import { Employee } from "@/types/auth";
import EmployeeDetail from "./EmployeeDetail";
import EmployeeForm from "./EmployeeForm";

import {
  PaginationState,
  createColumnHelper,
  useReactTable,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

const columnHelper = createColumnHelper<Employee>();

export default function DriversTable() {
  const { pushView } = useNavigation();
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [data, setData] = React.useState<Employee[]>([]);

  // Refresh data on mount - only show drivers
  React.useEffect(() => {
    setData(getAllEmployees().filter(emp => emp.role === 'DRIVER'));
  }, []);

  const [{ pageIndex, pageSize }, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 6,
  });

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const createPages = (count: number) => {
    const arrPageCount: number[] = [];
    for (let i = 1; i <= count; i++) {
      arrPageCount.push(i);
    }
    return arrPageCount;
  };

  const handleViewDriver = (driver: Employee) => {
    pushView({
      id: `driver-detail-${driver.id}`,
      label: driver.name,
      component: EmployeeDetail,
      data: { employeeId: driver.id },
    });
  };

  const handleCreateDriver = () => {
    pushView({
      id: 'driver-create',
      label: 'Nuevo Conductor',
      component: EmployeeForm,
      data: { mode: 'create', defaultRole: 'DRIVER' },
    });
  };

  const columns = [
    columnHelper.accessor("name", {
      id: "name",
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">
          CONDUCTOR
        </p>
      ),
      cell: (info) => {
        const employee = info.row.original;
        return (
          <div className="flex w-full items-center gap-[14px]">
            <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-400 dark:to-brand-500 overflow-hidden">
              {employee.photo ? (
                <img
                  src={employee.photo}
                  alt={info.getValue()}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-white">
                  {info.getValue().charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <p className="font-medium text-navy-700 dark:text-white">
              {info.getValue()}
            </p>
          </div>
        );
      },
    }),
    columnHelper.accessor("email", {
      id: "email",
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">CORREO</p>
      ),
      cell: (info) => (
        <p className="text-sm font-medium text-navy-700 dark:text-white">
          {info.getValue() || <span className="text-gray-400 italic">N/A</span>}
        </p>
      ),
    }),
    columnHelper.accessor("identification", {
      id: "identification",
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">
          IDENTIFICACIÓN
        </p>
      ),
      cell: (info) => (
        <p className="text-sm font-medium text-navy-700 dark:text-white">
          {info.getValue() || <span className="text-gray-400 italic">N/A</span>}
        </p>
      ),
    }),
    columnHelper.accessor("state", {
      id: "state",
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">
          ESTADO
        </p>
      ),
      cell: (info) => {
        const stateColors: Record<string, string> = {
          WORKING: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
          SUSPENDED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
          FIRED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };

        const stateLabels: Record<string, string> = {
          WORKING: 'Activo',
          SUSPENDED: 'Suspendido',
          FIRED: 'Despedido',
        };

        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stateColors[info.getValue()] || 'bg-gray-100 text-gray-700'}`}>
            {stateLabels[info.getValue()] || info.getValue()}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">
          ACCIONES
        </p>
      ),
      cell: (info) => (
        <button
          className="font-medium text-brand-500 dark:text-brand-400 hover:underline cursor-pointer"
          onClick={() => handleViewDriver(info.row.original)}
        >
          Ver detalles
        </button>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });

  return (
    <Card extra={"w-full px-6"}>
      <div className="flex items-center justify-between pt-[20px]">
        <div className="flex h-[38px] w-full max-w-[400px] flex-grow items-center rounded-xl bg-lightPrimary text-sm text-gray-600 dark:!bg-navy-900 dark:text-white gap-2 p-2">
          <FiSearch />
          <input
            value={globalFilter ?? ""}
            onChange={(e: any) => setGlobalFilter(e.target.value)}
            type="text"
            placeholder="Buscar conductor..."
            className="block w-full rounded-full bg-lightPrimary text-base text-navy-700 outline-none dark:!bg-navy-900 dark:text-white"
          />
        </div>
        <button
          onClick={handleCreateDriver}
          className="ml-4 flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
        >
          <MdAdd className="text-lg" />
          Nuevo
        </button>
      </div>

      <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="!border-px !border-gray-400">
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      onClick={header.column.getToggleSortingHandler()}
                      className="cursor-pointer border-b border-gray-200 pt-4 pb-2 pr-4 text-start dark:border-white/30"
                    >
                      <div className="items-center justify-between text-xs text-gray-200">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table
              .getRowModel()
              .rows.map((row) => {
                return (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td
                          key={cell.id}
                          className="min-w-[150px] border-white/0 py-3 pr-4"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="mt-2 flex h-20 w-full items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Mostrando {table.getRowModel().rows.length} de {data.length} conductores
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={`linear flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 p-2 text-lg text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200 disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <MdChevronLeft />
            </button>

            {createPages(table.getPageCount()).map((pageNumber, index) => {
              return (
                <button
                  className={`linear flex h-10 w-10 items-center justify-center rounded-full p-2 text-sm transition duration-200 ${
                    pageNumber === pageIndex + 1
                      ? "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
                      : "border-[1px] border-gray-400 bg-[transparent] dark:border-white dark:text-white"
                  }`}
                  onClick={() => table.setPageIndex(pageNumber - 1)}
                  key={index}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={`linear flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 p-2 text-lg text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200 disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <MdChevronRight />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
