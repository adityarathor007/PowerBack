from pydantic import BaseModel
from typing import Optional, Literal

class UserCreate(BaseModel):
    name: str
    phone: str
    password: str
    role: str="user" #default user

class UserLogin(BaseModel):
    phone: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    phone: str
    role: str

    class Config:
        orm_mode = True

# --------------------------------------------------------------------
# Pydantic Schemas
# --------------------------------------------------------------------
class FeederCreate(BaseModel):
    name: str
    area: str
    status: Literal["Working", "Outage", "Maintenance"] = "Working"
    expected_restore: Optional[str] = None

class FeederStatusUpdate(BaseModel):
    feeder_id: int
    status: Literal["Working", "Outage", "Maintenance"]
    remarks: Optional[str] = None
    expected_restore: Optional[str] = None

class FeederAssignRequest(BaseModel):
    feeder_id: int
    staff_id: int

class UserAssignRequest(BaseModel):
    feeder_id: int
    user_id: int

class FeederDeleteRequest(BaseModel):
    feeder_id: int


class StaffResponse(BaseModel):
    id: int
    name: str
    phone: str

    class Config:
        orm_mode = True


class FeederResponse(BaseModel):
    id: int
    name: str
    area: str
    status: str
    expected_restore: Optional[str] = None
    staff: Optional[StaffResponse] = None

    class Config:
        orm_mode = True
