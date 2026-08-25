from app.database import engine, Base

from app.models.route import Route
from app.models.source import Source
from app.models.flight import Flight
from app.models.fare import FareObservation
from app.models.index import IndexValue


Base.metadata.create_all(bind=engine)

print("Database tables created successfully.")