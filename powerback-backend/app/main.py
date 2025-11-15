from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from .database import Base, engine
from .routes import users, feeders

#orm way of saying to sync my python models -> into real databases tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:5173",  # React dev server
    "http://127.0.0.1:5173",  # sometimes React runs on this
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Origins allowed to make requests
    allow_credentials=True,
    allow_methods=["*"],            # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],            # Allow all headers
)


app.include_router(users.router)
app.include_router(feeders.router)

@app.get("/")
def root():
    return {"message": "PowerBack API is running 🚀"}
