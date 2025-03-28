# PDF Editor

A modern PDF viewer and editor built with React 19, TypeScript, and Vite. This application allows users to view, navigate, and interact with PDF documents in a clean, responsive interface.

## Features

- **PDF Viewing**: Upload and view PDF documents with full page rendering
- **Multi-page Navigation**: Easily navigate between pages in multi-page documents
- **Zoom Controls**: Adjust the scale/zoom level of the document
- **Dark/Light Theme**: Toggle between dark and light themes for comfortable viewing
- **Responsive Design**: Works well on various screen sizes thanks to Tailwind CSS

## Technologies Used

- **React 19**: Latest version of React with improved performance
- **TypeScript**: For type safety and better developer experience
- **Vite**: Fast, modern frontend build tool
- **react-pdf**: PDF rendering library for React
- **Tailwind CSS**: Utility-first CSS framework for styling

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- pnpm (v10.7.0 or newer)

### Installation

```bash
# Clone the repository (or download the source code)
# git clone [repository-url]

# Navigate to the project directory
cd PDF_Editor

# Install dependencies
pnpm install
```

### Development

```bash
# Start the development server
pnpm dev
```

This will start the development server at http://localhost:5173 (or another port if 5173 is in use).

### Building for Production

```bash
# Build the application
pnpm build

# Preview the production build
pnpm preview
```

## Project Structure

- `src/components/`: React components for the PDF viewer and editor interface
- `src/context/`: React context providers (e.g., ThemeContext for dark/light mode)
- `src/assets/`: Static assets like images and icons

## License

This project is licensed under the MIT License - see the LICENSE file for details.
