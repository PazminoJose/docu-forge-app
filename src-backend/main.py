from sanic import Sanic, Request, Websocket
from services.service import get_mapper_data, get_mapper_range, get_docx_fields,get_docx_file
from websockets_events.websocket import process_docx
from config.cors import add_cors_headers

app = Sanic("PythonBackend")

app.register_middleware(add_cors_headers, "response")

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
    
@app.websocket("/process-docx")
async def process_docx_route(_: Request, ws: Websocket):
    await process_docx(ws)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=False, fast=False, workers=1)
