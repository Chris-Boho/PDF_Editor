// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::process::Command;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn convert_pdf_to_svg(input_file: &str, output_name: &str) {
    let mut pdf2svg = Command::new("pdf2svg");
    pdf2svg.arg(input_file).arg(output_name);

    // Execute the command and handle the result
    match pdf2svg.status() {
        Ok(status) => {
            if status.success() {
                println!("Successfully converted PDF to SVG");
            } else {
                eprintln!("pdf2svg command failed with exit code: {:?}", status.code());
            }
        }
        Err(e) => {
            eprintln!("Failed to execute pdf2svg: {}", e);
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, convert_pdf_to_svg])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
