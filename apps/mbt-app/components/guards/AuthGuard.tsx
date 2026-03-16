"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import LoadingStep from '../shared/loading-step';

interface AuthGuardProps {
	children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {

	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/');
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			<LoadingStep
				isLoading
				variant="page"
				title="Verificando sesión"
				description="Confirmando que sus credenciales sigan siendo válidas."
				currentStep="Validando acceso a la plataforma"
				steps={[
					{ label: 'Leyendo sesión local', status: 'completed' },
					{ label: 'Validando token', status: 'active' },
					{ label: 'Cargando plataforma', status: 'pending' },
				]}
			/>
		);
	}

	if (!isAuthenticated) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-white dark:bg-navy-900">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
						Acceso no autorizado
					</h2>
					<p className="text-gray-600 dark:text-gray-300">
						Redirigiendo a la página de autorización...
					</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
