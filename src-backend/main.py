from sanic import Sanic
from sanic.response import json
from pandas import read_excel
import os
import numpy as np

app = Sanic("PythonBackend")

@app.get("/show-data")
async def data(request):
    try:
        path = request.args.get("path", "")
        start = int(request.args.get("start", 0))
        limit = int(request.args.get("limit", 10))
        if not path or not os.path.exists(path):
            return json({"error": "Invalid path"}, status=400)

        df = read_excel(path, engine="openpyxl")

        for col in df.select_dtypes(include=["datetime64[ns]"]).columns:
            df[col] = df[col].dt.strftime("%Y-%m-%d %H:%M:%S")

        df = df.replace({np.nan: None})

        df_slice = df.iloc[start:start+limit]

        column_labels = df.columns.tolist()

        data = [
        [cell for cell in row]
        for row in df_slice.to_numpy().tolist()
        ]
        
        range = {
            "from": 1,
            "to": len(df)
        }

        return json({"columns": column_labels, "data": data, "range": range})
    except Exception as e:
        return json({"error": str(e)}, status=500)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
