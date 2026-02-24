from sanic import Request
from sanic.response import json, file, raw
import pandas as pd
from docx import Document
import os
import re
from datetime import datetime
import numpy as np
import asyncio


async def get_docx_file(request: Request):
    try:
        # Obtenemos el path de los parámetros de la URL
        path = request.args.get("path")

        if not os.path.exists(path):
            return json({"error": "File not found"}, status=404)

        with open(path, "rb") as f:
            file_bytes = f.read()

        # Usamos raw para enviar bytes puros
        # El content_type es vital para que el navegador no intente leerlo como texto
        return raw(
            file_bytes, 
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )

    except Exception as e:
        print(f"ERROR AL SERVIR ARCHIVO: {e}")
        return json({"error": "Error interno al leer el archivo"}, status=500)


async def get_docx_fields(request: Request):
    try:
        path = request.args.get("path", "")
        
        if not path or not os.path.exists(path):
            return json({"error": "Invalid path or file not found"}, status=400)

        # Exec the extraction in a separate thread to avoid blocking Sanic's event loop
        fields = await asyncio.to_thread(_extract_fields, path)

        return json({"fields": fields})
        
    except Exception as e:
        print(f"DEBUG ERROR: {e}")
        return json({"error": str(e)}, status=500)
    
def _extract_fields(path: str) -> list[str]:
    doc = Document(path)
    placeholders = set()
    regex = r"\$\{([^}]+)\}"

    # Search for matches in a list of paragraphs 
    def find_in_paragraphs(paragraphs):
        for p in paragraphs:
            matches = re.findall(regex, p.text)
            for m in matches:
                placeholders.add(m)

    # 1. Main body paragraphs
    find_in_paragraphs(doc.paragraphs)

    # 2. Tables paragraphs
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                find_in_paragraphs(cell.paragraphs)
                
    # 3. Headers and footers paragraphs
    for section in doc.sections:
        find_in_paragraphs(section.header.paragraphs)
        find_in_paragraphs(section.footer.paragraphs)

    return list(placeholders)

async def get_mapper_data(request: Request):
    try:
        path = request.args.get("path", "")
        start = int(request.args.get("start", 0))
        limit = int(request.args.get("limit", 10))
        
        if not path or not os.path.exists(path):
            return json({"error": "Invalid path"}, status=400)

        # Leer sin encabezados
        df = pd.read_excel(path, engine="openpyxl", header=None)

        # Reemplazar NaN por None (para que sea null en JSON)
        df = df.replace({np.nan: None})

        # Tomar el slice (paginación)
        df_slice = df.iloc[start : start + limit]

        # Convertir a lista de listas
        raw_rows = df_slice.values.tolist()

        # LIMPIEZA MANUAL: Convertir cualquier objeto datetime a string
        clean_data = []
        for row in raw_rows:
            clean_row = []
            for cell in row:
                # 1. Manejar fechas
                if isinstance(cell, (datetime, pd.Timestamp)):
                    clean_row.append(cell.strftime("%Y-%m-%d %H:%M:%S"))
                # 2. Manejar nulos (NaN / None)
                elif pd.isna(cell): 
                    clean_row.append("NA") # O "" si prefieres string vacío en lugar de null
                else:
                    clean_row.append(cell)
            clean_data.append(clean_row)


        return json({"data": clean_data})
        
    except Exception as e:
        # Imprimir el error en consola para debugging
        print(f"DEBUG ERROR: {e}")
        return json({"error": str(e)}, status=500)
    
    
async def get_mapper_range(request: Request):
    try:
        path = request.args.get("path", "")
        
        if not path or not os.path.exists(path):
            return json({"error": "Invalid path"}, status=400)

        df = pd.read_excel(path, engine="openpyxl", header=None)
        total_rows = len(df)

        data_range = {
            "from": 1,
            "to": total_rows
        }

        return json({"range": data_range})
    except Exception as e:
        print(f"DEBUG ERROR: {e}")
        return json({"error": str(e)}, status=500)