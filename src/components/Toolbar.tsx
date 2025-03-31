import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ToolbarProps {
	pdfTitle?: string | null;
	isTextToolActive?: boolean;
	onTextToolToggle?: () => void;
	onExportPdf?: () => void;
	fontFamily?: string;
	fontSize?: number;
	onFontFamilyChange?: (fontFamily: string) => void;
	onFontSizeChange?: (fontSize: number) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
	pdfTitle,
	isTextToolActive = false,
	onTextToolToggle,
	onExportPdf,
	fontFamily = 'Arial',
	fontSize = 12,
	onFontFamilyChange,
	onFontSizeChange
}) => {
	const { theme, toggleTheme } = useTheme();
	return (
		<div
			className={`w-full ${
				theme === 'light'
					? 'bg-gray-100 border-b border-gray-300 text-gray-800'
					: 'bg-gray-800 border-b border-gray-700 text-gray-200'
			} py-1 fixed top-0 left-0 z-10`}
		>
			<div className='px-8'>
				{/* Document title */}
				<div className='py-1'>
					<span className='text-lg'>{pdfTitle || 'Untitled document'}</span>
				</div>
				{/* Main toolbar container */}
				<div className='flex items-center border-t border-gray-300 pt-1 mt-1'>
					{/* File operations section */}
					<div className='flex items-center space-x-4 mr-6'>
						<div className='px-2 py-1 hover:bg-gray-200 rounded cursor-pointer'>File</div>
						<div className='px-2 py-1 hover:bg-gray-200 rounded cursor-pointer'>Edit</div>
						<div className='px-2 py-1 hover:bg-gray-200 rounded cursor-pointer'>View</div>
						<div className='px-2 py-1 hover:bg-gray-200 rounded cursor-pointer'>Insert</div>
						<div className='px-2 py-1 hover:bg-gray-200 rounded cursor-pointer'>Format</div>
						<div className='px-2 py-1 hover:bg-gray-200 rounded cursor-pointer'>Tools</div>
					</div>

					{/* Divider */}
					<div className='h-6 border-l border-gray-300 mx-2'></div>

					{/* Formatting options */}
					<div className='flex items-center space-x-2'>
						{/* Font dropdown */}
						<div className='relative'>
							<select 
								className='flex items-center border border-gray-300 rounded px-2 py-1 cursor-pointer hover:bg-gray-200 appearance-none pr-8 bg-transparent'
								value={fontFamily}
								onChange={(e) => onFontFamilyChange && onFontFamilyChange(e.target.value)}
							>
								<option value="Arial">Arial</option>
								<option value="Times New Roman">Times New Roman</option>
								<option value="Courier New">Courier New</option>
								<option value="Georgia">Georgia</option>
								<option value="Verdana">Verdana</option>
							</select>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
							</svg>
						</div>

						{/* Font size dropdown */}
						<div className='relative'>
							<select 
								className='flex items-center border border-gray-300 rounded px-2 py-1 cursor-pointer hover:bg-gray-200 appearance-none pr-8 bg-transparent'
								value={fontSize}
								onChange={(e) => onFontSizeChange && onFontSizeChange(parseInt(e.target.value))}
							>
								<option value="8">8</option>
								<option value="9">9</option>
								<option value="10">10</option>
								<option value="11">11</option>
								<option value="12">12</option>
								<option value="14">14</option>
								<option value="16">16</option>
								<option value="18">18</option>
								<option value="20">20</option>
								<option value="24">24</option>
								<option value="28">28</option>
								<option value="32">32</option>
								<option value="36">36</option>
							</select>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
							</svg>
						</div>

						{/* Divider */}
						<div className='h-6 border-l border-gray-300 mx-1'></div>

						{/* Text formatting buttons */}
						<button className='p-1 rounded hover:bg-gray-200' title='Bold'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M6 12h12M6 6h12m-6 12h6'
								/>
							</svg>
						</button>
						<button className='p-1 rounded hover:bg-gray-200' title='Italic'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
								/>
							</svg>
						</button>
						<button className='p-1 rounded hover:bg-gray-200' title='Underline'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 12h16M4 18h16' />
							</svg>
						</button>

						{/* Divider */}
						<div className='h-6 border-l border-gray-300 mx-1'></div>

						{/* Alignment buttons */}
						<button className='p-1 rounded hover:bg-gray-200' title='Align Left'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M4 6h16M4 12h10M4 18h16'
								/>
							</svg>
						</button>
						<button className='p-1 rounded hover:bg-gray-200' title='Align Center'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M4 6h16M8 12h8M4 18h16'
								/>
							</svg>
						</button>
						<button className='p-1 rounded hover:bg-gray-200' title='Align Right'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M4 6h16M10 12h10M4 18h16'
								/>
							</svg>
						</button>
					</div>

					{/* Divider */}
					<div className='h-6 border-l border-gray-300 mx-2'></div>

					{/* Annotation tools */}
					<div className='flex items-center space-x-2'>
						<button
							className={`p-1 rounded ${
								isTextToolActive ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'
							}`}
							title='Text Box Tool'
							onClick={onTextToolToggle}
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7'
								/>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M18 2h-4v4h4v-4z' />
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 8H6v2h9V8z' />
							</svg>
						</button>
					</div>

					{/* Divider */}
					<div className='h-6 border-l border-gray-300 mx-2'></div>

					{/* Export PDF button */}
					<button
						onClick={onExportPdf}
						className='p-1 rounded hover:bg-gray-200 flex items-center'
						title='Export PDF with annotations'
						disabled={!pdfTitle}
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-5 w-5'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
							/>
						</svg>
						<span className='ml-1 text-sm'>Export</span>
					</button>

					{/* Divider */}
					<div className='h-6 border-l border-gray-300 mx-2'></div>

					{/* Theme toggle button */}
					<button
						onClick={toggleTheme}
						className='p-1 rounded hover:bg-gray-200 flex items-center'
						title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
					>
						{theme === 'light' ? (
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
								/>
							</svg>
						) : (
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
								/>
							</svg>
						)}
						<span className='ml-1 text-sm'>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default Toolbar;
