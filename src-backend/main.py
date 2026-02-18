from sanic import Sanic, Request, Websocket
from services.service import get_mapper_data, get_mapper_range
from websockets_events.websocket import process_docx

app = Sanic("PythonBackend")

@app.get("/get-data")
async def get_data(request: Request):
    return await get_mapper_data(request)

@app.get("/get-range")
async def get_range(request: Request):
    return await get_mapper_range(request)
    
@app.websocket("/process-docx")
async def process_ws(_: Request, ws: Websocket):
    await process_docx(ws)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=False, fast=False, workers=1)
