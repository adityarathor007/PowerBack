from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")  # admin, staff, user


    feeders = relationship("Feeder", back_populates="assigned_staff")
    updates = relationship("FeederUpdate", back_populates="updated_by_user")

class Feeder(Base):
    __tablename__= "feeders"
    id=Column(Integer,primary_key=True,index=True)
    name = Column(String, nullable=False)
    area = Column(String, nullable=False)
    status = Column(String, default="Working")  # Working / Outage / Maintenance
    expected_restore = Column(DateTime, nullable=True)

    # staff assigned to manage this feeder
    staff_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # relationships
    assigned_staff = relationship("User", back_populates="feeders")
    updates = relationship("FeederUpdate", back_populates="feeder")


class UserFeederMapping(Base):
    __tablename__ = "user_feeder_mapping"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    feeder_id = Column(Integer, ForeignKey("feeders.id"))


# FEEDER UPDATES (Staff logs)
# ------------------------------------------------
class FeederUpdate(Base):
    __tablename__ = "feeder_updates"

    id = Column(Integer, primary_key=True, index=True)
    feeder_id = Column(Integer, ForeignKey("feeders.id"))
    updated_by = Column(Integer, ForeignKey("users.id"))
    status = Column(String, nullable=False)  # Outage / Maintenance / Restored
    remarks = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # relationships
    feeder = relationship("Feeder", back_populates="updates")
    updated_by_user = relationship("User", back_populates="updates")
