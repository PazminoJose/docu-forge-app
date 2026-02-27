from sanic import Sanic, Request, Websocket
from services.service import get_mapper_data, get_mapper_range, get_docx_fields,get_docx_file,get_unique_combinations
from websockets_events.websocket import process_docx, process_multiple_docx
from sanic_ext import Extend

app = Sanic("PythonBackend")

app.config.CORS_ORIGINS = "*"
app.config.CORS_METHODS = ["GET", "POST", "OPTIONS"]
app.config.OAS = False
app.config.SWAGGER_UI_CONFIGURATION = {"displayOperationId": False}

Extend(app)

@app.get("/get-docx-fields")
async def get_docx_fields_route(request: Request):
    return await get_docx_fields(request)

@app.get("/get-docx-file")
async def get_docx_file_route(request: Request):
    return await get_docx_file(request)

@app.get("/get-data")
async def get_data(request: Request):
    return await get_mapper_data(request)

@app.get("/get-range")
async def get_range(request: Request):
    return await get_mapper_range(request)

@app.post("/unique-combinations")
async def unique_combinations_route(request: Request):
    return await get_unique_combinations(request)
    
@app.websocket("/process-docx")
async def process_docx_route(_: Request, ws: Websocket):
    await process_docx(ws)

@app.websocket("/process-multiple-docx")
async def process_multiple_docx_route(_: Request, ws: Websocket):
    await process_multiple_docx(ws)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=False, fast=False, workers=1)
