from sanic import Websocket
import pandas as pd
from openpyxl import load_workbook
from openpyxl.utils import column_index_from_string
from docx import Document
import os
from datetime import datetime
import json as py_json
import asyncio

async def process_docx(ws: Websocket):
    try:
        # Get initial config message from Frontend
        raw_msg = await ws.recv()
        data = py_json.loads(raw_msg)
        
        if data.get("action") == "start":
            # Params
            docx_path = data.get("docx_path")
            xlsx_path = data.get("xlsx_path")
            output_folder = data.get("output_folder")
            fields = data.get("fields", [])
            skip_header = data.get("skip_header", False)
            range_config = data.get("range", {})
            start_row = int(range_config.get("from", 1))
            end_row = int(range_config.get("to", 1))
            
            # Skip header adjustment
            if skip_header:
                start_row += 1
            
            total_rows_to_process = end_row - start_row + 1

            # 2. Load Excel
            if not os.path.exists(xlsx_path):
                await ws.send(py_json.dumps({"status": "error", "message": "Archivo Excel no encontrado"}))
                return

            wb = load_workbook(xlsx_path, data_only=True)
            sheet = wb.active

            if not os.path.exists(output_folder):
                os.makedirs(output_folder, exist_ok=True)

            # --- 3. Row Processing Loop ---
            for i, row_idx in enumerate(range(start_row, end_row + 1)):
                # A. CHECK FOR CANCELLATION
                try:
                    # Ultra-fast attempt to see if there's a message from the client
                    client_msg = await asyncio.wait_for(ws.recv(), timeout=0.0001)
                    parsed_client_msg = py_json.loads(client_msg)
                    if parsed_client_msg.get("action") == "cancel":
                        print(f"DEBUG: Proceso cancelado en fila {row_idx}")
                        await ws.send(py_json.dumps({"status": "cancelled"}))
                        return 
                except (asyncio.TimeoutError, Exception):
                    pass # Seguimos si no hay mensaje

                # B. LOAD DOCX AND PROCESS FIELDS
                doc = Document(docx_path)
                was_modified = False
                custom_filename = None
                
                for field in fields:
                    identifier = f"${{{field['identifier']}}}"
                    col_letter = field.get('mappedToColumn', 'A')
                    col_idx = column_index_from_string(col_letter)
                    
                    cell_value = sheet.cell(row=row_idx, column=col_idx).value
                    
                    # Replacement formatting (Dates, Strings, Nulls)
                    if isinstance(cell_value, (datetime, pd.Timestamp)):
                        replacement = cell_value.strftime("%Y-%m-%d")
                    elif cell_value is None:
                        replacement = ""
                    else:
                        replacement = str(cell_value)
                    
                    # Dynamic filename capture
                    if field.get('useAsName', False) and replacement.strip():
                        custom_filename = "".join(c for c in replacement if c.isalnum() or c in (' ', '_', '-')).strip()

                    # Clean replacement
                    if _replace_cleanly(doc, identifier, replacement):
                        was_modified = True

                # C. Save if modified
                if was_modified:
                    filename = f"{custom_filename}.docx" if custom_filename else f"Resultado_{row_idx}.docx"
                    save_path = os.path.join(output_folder, filename)
                    doc.save(save_path)

                # D. Report Progress
                percent = int(((i + 1) / total_rows_to_process) * 100)
                await ws.send(py_json.dumps({
                    "status": "progress",
                    "percent": percent,
                    "current": i + 1,
                    "total": total_rows_to_process
                }))

                # Small pause to allow WebSocket to process the send
                await asyncio.sleep(0.01)

            # 4. FINALIZATION
            await ws.send(py_json.dumps({"status": "completed"}))

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"CRITICAL ERROR:\n{error_details}")
        try:
            await ws.send(py_json.dumps({"status": "error", "message": str(e)}))
        except:
            pass
  
def _replace_cleanly(doc, old_text, new_text):
    found = False
    # Función auxiliar para procesar párrafos de forma uniforme
    def process_p(p):
        nonlocal found
        if old_text in p.text:
            _combine_runs(p)  # Paso 1: Sanear el párrafo
            for run in p.runs: # Paso 2: Reemplazo limpio
                if old_text in run.text:
                    run.text = run.text.replace(old_text, new_text)
                    found = True

    for p in doc.paragraphs:
        process_p(p)
            
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    process_p(p)
    return found

def _combine_runs(paragraph):
    if len(paragraph.runs) < 2:
        return
    # iterar de atrás hacia adelante para poder eliminar runs sin romper el índice
    for i in range(len(paragraph.runs) - 1, 0, -1):
        r1 = paragraph.runs[i-1]
        r2 = paragraph.runs[i]
        # Si tienen el mismo formato se combinan
        if r1.bold == r2.bold and r1.italic == r2.italic and r1.underline == r2.underline and r1.font.name == r2.font.name:
            r1.text += r2.text
            # Eliminar el run r2 (técnicamente se elimina el elemento XML)
            r2._element.getparent().remove(r2._element)

# def process_template_docx(request: Request):
#     # --- 1. Obtención de Parámetros Raíz ---
#     docx_path = request.json.get("docx_path")
#     xlsx_path = request.json.get("xlsx_path")
#     output_folder = request.json.get("output_folder")
#     fields = request.json.get("fields")
#     skip_header = request.json.get("skip_header")
#     range = request.json.get("range")
#     start_row = int(range.get("from"))
#     end_row = int(range.get("to"))
    
#     # Ajuste por encabezado
#     if skip_header:
#         start_row += 1
#     try:
#         # data_only=True es vital para traer valores y no fórmulas
#         wb = load_workbook(xlsx_path, data_only=True)
#         sheet = wb.active
        
#         if not os.path.exists(output_folder):
#             os.makedirs(output_folder)
#     except Exception as e:
#         return json({"error": f"Error al acceder a archivos: {str(e)}"}, status=400)

#     # --- 3. Procesamiento por Filas ---
#     for row_idx in range(start_row, end_row + 1):
#         doc = Document(docx_path)
#         was_modified = False
#         custom_filename = None
        
#         for field in fields:
#             identifier = f"${{{field['identifier']}}}"
#             col_letter = field.get('mappedToColumn', 'A')
#             col_idx = column_index_from_string(col_letter)
            
#             cell_value = sheet.cell(row=row_idx, column=col_idx).value
            
#             # Formateo de reemplazo (Strings, fechas y nulos)
#             if isinstance(cell_value, (datetime, pd.Timestamp)):
#                 replacement = cell_value.strftime("%Y-%m-%d")
#             else:
#                 replacement = str(cell_value) if cell_value is not None else ""
            
#             # Nombre de archivo dinámico
#             if field.get('useAsName', False) and replacement.strip():
#                 # Sanitization de caracteres para Windows/Linux
#                 custom_filename = "".join(c for c in replacement if c.isalnum() or c in (' ', '_', '-')).strip()

#             # Reemplazo con protección de Runs (Mantiene Negritas/Cursivas)
#             if _replace_cleanly(doc, identifier, replacement):
#                 was_modified = True

#         # --- 4. Guardado ---
#         if was_modified:
#             final_name = f"{custom_filename}.docx" if custom_filename else f"Resultado_Fila_{row_idx}.docx"
#             save_path = os.path.join(output_folder, final_name)
#             doc.save(save_path)
            
#     return json({"status": "success", "message": "Procesamiento completado"})