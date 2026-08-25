from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    DateTime,
    ForeignKey
)

from app.database import Base


class FareObservation(Base):

    __tablename__ = "fare_observations"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    source_id = Column(
        Integer,
        ForeignKey("sources.id"),
        nullable=False
    )

    route_id = Column(
        String(20),
        ForeignKey("routes.route_id"),
        nullable=False
    )

    airline = Column(
        String(100),
        nullable=False
    )

    flight_number = Column(
        String(30),
        nullable=True
    )

    scraped_at = Column(
        DateTime,
        nullable=False
    )

    travel_date = Column(
        Date,
        nullable=False
    )

    booking_window = Column(
        Integer,
        nullable=False
    )

    fare_class = Column(
        String(100),
        nullable=True
    )

    base_fare = Column(
        Float,
        nullable=True
    )

    taxes = Column(
        Float,
        nullable=True
    )

    user_development_fee = Column(
        Float,
        nullable=True
    )

    convenience_fee = Column(
        Float,
        nullable=True
    )

    other_charges = Column(
        Float,
        nullable=True
    )

    total_fare = Column(
        Float,
        nullable=True
    )

    currency = Column(
        String(3),
        default="INR"
    )

    availability = Column(
        String(30),
        nullable=False
    )

    quality_score = Column(
        Float,
        nullable=True
    )