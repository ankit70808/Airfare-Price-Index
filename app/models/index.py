from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    DateTime
)

from app.database import Base


class IndexValue(Base):

    __tablename__ = "index_values"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    index_date = Column(
        Date,
        nullable=False
    )

    frequency = Column(
        String(20),
        nullable=False
    )

    booking_window = Column(
        Integer,
        nullable=True
    )

    index_value = Column(
        Float,
        nullable=False
    )

    base_period = Column(
        String(20),
        nullable=False
    )

    basket_version = Column(
        String(50),
        nullable=False
    )

    methodology_version = Column(
        String(50),
        nullable=False
    )

    status = Column(
        String(20),
        default="PROVISIONAL"
    )

    created_at = Column(
        DateTime
    )