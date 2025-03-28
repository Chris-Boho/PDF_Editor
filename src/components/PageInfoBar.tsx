import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface PageInfoBarProps {
	currentPage: number;
	totalPages: number;
	scale: number;
	onScaleChange: (scale: number) => void;
	editMode?: boolean;
	onEditModeToggle?: () => void;
}

const PageInfoBar: React.FC<PageInfoBarProps> = ({
	currentPage,
	totalPages,
	scale,
	onScaleChange,
	editMode = true,
	onEditModeToggle
}) => {
	const { theme } = useTheme();
	const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

	return (
		<div
			className={`w-full ${
				theme === 'light'
					? 'bg-gray-100 border-t border-gray-300 text-gray-800'
					: 'bg-gray-800 border-t border-gray-700 text-gray-200'
			} py-2 fixed bottom-0 left-0 z-50`}
		>
			<div className='px-8 flex justify-between items-center'>
				<span>
					Page {currentPage} of {totalPages}
				</span>
				<div className='flex items-center space-x-4'>
					{onEditModeToggle && (
						<div className="flex items-center space-x-2">
							<span>{editMode ? 'Edit Mode' : 'Preview Mode'}</span>
							<button
								onClick={onEditModeToggle}
								className="relative inline-flex items-center h-6 rounded-full w-12 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								style={{
									backgroundColor: editMode 
										? theme === 'light' ? '#4ade80' : '#22c55e'  
										: theme === 'light' ? '#d1d5db' : '#4b5563'
								}}
							>
								<span className="sr-only">{editMode ? 'Edit Mode' : 'Preview Mode'}</span>
								<span
									className={`${
										editMode ? 'translate-x-6' : 'translate-x-1'
									} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
								/>
							</button>
						</div>
					)}
					<div className='flex items-center space-x-2'>
						<input
							type='range'
							min='50'
							max='400'
							value={scale * 100}
							onChange={(e) => onScaleChange(Number(e.target.value) / 100)}
							className='w-32'
						/>
						<span className='min-w-[4rem]'>{Math.round(scale * 100)}%</span>
						<select
							value={scale}
							onChange={(e) => onScaleChange(Number(e.target.value))}
							className={`${
								theme === 'light' ? 'bg-white border-gray-300' : 'bg-gray-700 border-gray-600'
							} border rounded px-2 py-1`}
						>
							{zoomLevels.map((level) => (
								<option key={level} value={level}>
									{Math.round(level * 100)}%
								</option>
							))}
						</select>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PageInfoBar;
