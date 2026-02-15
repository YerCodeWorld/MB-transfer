"use client";

import { useState, useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { useBottomBar } from '@/contexts/BottomBarContext';

import { MdPeople, MdBusiness, MdDirectionsCar, MdLocalShipping } from 'react-icons/md';

import EmployeesTable from './employees/EmployeesTable';
import DriversTable from './employees/DriversTable';
import AlliesGrid from './allies/AlliesGrid';
import VehiclesGrid from './vehicles/VehiclesGrid';

export default function PersonnelView() {

	const { employee } = useAuth();
	const { navigation } = useNavigation();
	const { setActions } = useBottomBar();

	const [activeTab, setActiveTab] = useState<'employees' | 'drivers' | 'allies' | 'vehicles'>('employees');
	const hasAccess = employee?.role === 'ADMINISTRATOR' || employee?.role === 'MANAGER';

	useEffect(() => {
		if (!hasAccess) return;

		// Only set actions when we're at the root level (no stacked views)
		if (navigation.stack.length === 0) {

			setActions([
				{
				  key: 'employees',
				  label: 'Empleados',
				  Icon: MdPeople,
				  variant: activeTab === 'employees' ? 'primary' : 'secondary',
				  onClick: () => setActiveTab('employees'),
				},
				{
				  key: 'drivers',
				  label: 'Conductores',
				  Icon: MdLocalShipping,
				  variant: activeTab === 'drivers' ? 'primary' : 'secondary',
				  onClick: () => setActiveTab('drivers'),
				},
				{
				  key: 'allies',
				  label: 'Aliados',
				  Icon: MdBusiness,
				  variant: activeTab === 'allies' ? 'primary' : 'secondary',
				  onClick: () => setActiveTab('allies'),
				},
				{
				  key: 'vehicles',
				  label: 'Vehículos',
				  Icon: MdDirectionsCar,
				  variant: activeTab === 'vehicles' ? 'primary' : 'secondary',
				  onClick: () => setActiveTab('vehicles'),
				},
			]);
		}

		// Cleanup: clear actions when component unmounts or access is lost
		return () => {
			if (navigation.stack.length === 0) {
				setActions([]);
			}
		};

	}, [activeTab, hasAccess, navigation.stack.length, setActions]);

	// Access denied screen
	if (!hasAccess) {
		return (
			<div className="flex items-center justify-center h-full p-8">
				<div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800 max-w-md">
					<h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">
						 Acceso Denegado
					</h2>
					<p className="text-red-500 dark:text-red-300">Esta sección requiere privilegios de Administrador o Gerente.</p>
					<p className="text-sm text-red-400 dark:text-red-400 mt-2">
						Su rol actual: <strong>{employee?.role || 'Desconocido'}</strong>
					</p>
				</div>
			</div>
			);
	}

	// If in stacked view, render the component from navigation
	if (navigation.stack.length > 0) {
		const currentView = navigation.stack[navigation.stack.length - 1];
		const Component = currentView.component;
		return Component ? <Component {...currentView.data} /> : null;
	}

	return (
		<div className="w-full h-full pb-24">
			{activeTab === 'employees' && <EmployeesTable />}
			{activeTab === 'drivers' && <DriversTable />}
			{activeTab === 'allies' && <AlliesGrid />}
			{activeTab === 'vehicles' && <VehiclesGrid />}
		</div>
	);
}
