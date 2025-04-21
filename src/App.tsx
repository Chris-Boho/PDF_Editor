import { useState } from 'react'
import PDFViewer from './components/PDFViewer'
import Toolbar from './components/Toolbar'
import { ThemeProvider } from './context/ThemeContext'
import { useTheme } from './context/ThemeContext'

const AppContent = () => {
  const { theme } = useTheme();
  const [pdfTitle, setPdfTitle] = useState<string | null>(null);

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} p-8 pt-16 pb-16`}>
      <Toolbar pdfTitle={pdfTitle} />
      <div className="mt-8 flex justify-center">
        <PDFViewer onFileChange={(file) => setPdfTitle(file ? file.name : null)} />
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
