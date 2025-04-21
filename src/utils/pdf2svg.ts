import { invoke } from '@tauri-apps/api/core'
import { exists, mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';

export async function pdf2svg(filePath: String) {

  console.log("func file: ", filePath);

  const svgFolderExists = await exists('pdf_editor_workspace', {
    baseDir: BaseDirectory.AppLocalData
  })

  if (!svgFolderExists) {
    await mkdir('pdf_editor_workspace', {
      baseDir: BaseDirectory.AppLocalData
    })
  }

  const svg_file = await invoke('convert_pdf_to_svg', { inputFile: filePath, outputName: 'test.svg' })

  console.log("svg file: ", svg_file);

  return svg_file
}