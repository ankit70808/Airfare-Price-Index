from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime
)

from datetime import datetime

from app.database import Base


class Source(Base):

    __tablename__ = "sources"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    name = Column(
        String(100),
        nullable=False,
        unique=True
    )

    source_type = Column(
        String(20),
        nullable=False
    )

    domain = Column(
        String(255),
        nullable=False
    )

    enabled = Column(
        Boolean,
        default=True
    )

    robots_checked = Column(
        Boolean,
        default=False
    )

    last_success = Column(
        DateTime,
        nullable=True
    )

    last_failure = Column(
        DateTime,
        nullable=True
    )