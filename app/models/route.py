from sqlalchemy import (
    Column,
    String,
    Float,
    Boolean,
    DateTime
)

from datetime import datetime

from app.database import Base


class Route(Base):

    __tablename__ = "routes"

    route_id = Column(
        String(20),
        primary_key=True
    )

    origin = Column(
        String(3),
        nullable=False
    )

    destination = Column(
        String(3),
        nullable=False
    )

    weight = Column(
        Float,
        nullable=False
    )

    active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )