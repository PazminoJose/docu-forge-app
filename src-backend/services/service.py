from sanic import Request
from sanic.response import json
import pandas as pd
import os
from datetime import datetime
import numpy as np

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