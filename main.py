from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import os

app = FastAPI()

# Get the directory of the current script
current_dir = os.path.dirname(os.path.abspath(__file__))

# Mount the exported Next.js static files
app.mount("/_next", StaticFiles(directory=os.path.join(current_dir, "rbac", "out", "_next")), name="static")


@app.get("/")
async def root():
    return FileResponse(os.path.join(current_dir, "rbac", "out", "index.html"))

if __name__ == '__main__':
    uvicorn.run("main:app", host='0.0.0.0', port=3000, reload=True)
