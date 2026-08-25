from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Time,
    Boolean
)

from app.database import Base


class Flight(Base):

    __tablename__ = "flights"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    airline = Column(
        String(100),
        nullable=False
    )

    flight_number = Column(
        String(30),
        nullable=False
    )

    origin = Column(
        String(3),
        nullable=False
    )

    destination = Column(
        String(3),
        nullable=False
    )

    travel_date = Column(
        Date,
        nullable=False
    )

    departure_time = Column(
        Time,
        nullable=True
    )

    arrival_time = Column(
        Time,
        nullable=True
    )

    stops = Column(
        Integer,
        default=0
    )

    active = Column(
        Boolean,
        default=True
    )