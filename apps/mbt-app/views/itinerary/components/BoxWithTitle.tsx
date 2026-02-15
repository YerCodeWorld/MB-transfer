import { ReactNode } from 'react';

export const BoxWithTitle = ({
	title,
	children
}: {
	title: string;
	children?: ReactNode;
}) => {
	return (
		<div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
			<h3 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">
				{title ?? "Bloque"}
			</h3>
			<div className="space-y-4">
				{children}
			</div>
		</div>
	)
}


