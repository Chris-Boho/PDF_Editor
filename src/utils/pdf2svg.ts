/**
 * Configuration for MuPDF WASM
 */
interface MuPdfWasm {
  openDocumentFromBuffer: (data: Uint8Array) => Promise<MuPdfDocument>;
  ready: Promise<void>;
  wasmPath?: string;
}

interface MuPdfDocument {
  countPages: () => Promise<number>;
  loadPage: (pageIndex: number) => Promise<MuPdfPage>;
  destroy: () => Promise<void>;
}

interface MuPdfPage {
  toSVG: () => Promise<string>;
  destroy: () => Promise<void>;
}

declare global {
  interface Window {
    mupdf?: MuPdfWasm;
  }
}

/**
 * Converts a PDF file to SVG format using MuPDF WASM
 * 
 * @param pdfFile - The PDF file to convert
 * @returns Promise that resolves to an array of SVG strings, one for each page
 */
export const convertPdfToSvg = async (pdfFile: File): Promise<string[]> => {
  // Make sure MuPDF is initialized
  if (!window.mupdf?.ready) {
    throw new Error('MuPDF WASM is not initialized. Make sure to call initMuPdfWasm() first.');
  }

  await window.mupdf.ready;

  // Read the PDF file
  const arrayBuffer = await pdfFile.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  // Process with MuPDF
  const doc = await window.mupdf.openDocumentFromBuffer(data);
  const pageCount = await doc.countPages();

  // Convert each page to SVG
  const svgPages: string[] = [];
  for (let i = 0; i < pageCount; i++) {
    const page = await doc.loadPage(i);
    const svgString = await page.toSVG();
    svgPages.push(svgString);

    // Clean up page resources
    await page.destroy();
  }

  // Clean up document resources
  await doc.destroy();

  return svgPages;
};

/**
 * Initialize MuPDF WASM library
 * This should be called once when your application starts
 * 
 * @param wasmPath - Path to the directory containing mupdf-wasm.js and mupdf-wasm.wasm files
 */
export const initMuPdfWasm = async (wasmPath: string = '/public/wasm/'): Promise<void> => {
  // Skip if already initialized
  if (window.mupdf?.ready) {
    return window.mupdf.ready;
  }

  return new Promise((resolve, reject) => {
    try {
      // Create a script element to load MuPDF
      const script = document.createElement('script');
      script.src = `${wasmPath}mupdf.js`;  // Use mupdf.js instead of mupdf.min.js

      script.onload = () => {
        if (!window.mupdf) {
          reject(new Error('MuPDF failed to initialize properly'));
          return;
        }

        // Set the path to find the WASM file
        window.mupdf.wasmPath = wasmPath;

        // Wait for WASM initialization to complete
        window.mupdf.ready
          .then(() => {
            console.log('MuPDF WASM loaded successfully');
            resolve();
          })
          .catch(reject);
      };

      script.onerror = () => {
        reject(new Error(`Failed to load MuPDF WASM script from ${wasmPath}mupdf.js`));
      };

      // Append the script to the document
      document.head.appendChild(script);
    } catch (error) {
      reject(error);
    }
  });
};
