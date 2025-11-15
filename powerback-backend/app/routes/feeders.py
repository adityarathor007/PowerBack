from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from .. import models, database
from ..routes.users import get_current_user
from app.schemas import (
    FeederCreate,
    FeederStatusUpdate,
    FeederAssignRequest,
    UserAssignRequest,
    FeederDeleteRequest,
    StaffResponse,
    FeederResponse
)

router = APIRouter(prefix="/feeders", tags=["Feeders"])

# --------------------------------------------------------------------
# Database dependency
# --------------------------------------------------------------------
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()



# --------------------------------------------------------------------
# GET /feeders → View feeders
# --------------------------------------------------------------------
@router.get("/", summary="View feeders (User, Staff, Admin)")
def get_feeders(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    role = current_user.role

    # ---------- USER ----------
    if role == "user":
        mapping = db.query(models.UserFeederMapping).filter_by(user_id=current_user.id).first()
        if not mapping:
            return {"message": "You are not mapped to any feeder yet."}

        feeder = db.query(models.Feeder).filter_by(id=mapping.feeder_id).first()
        staff = db.query(models.User).filter_by(id=feeder.staff_id).first()

        return {
            "id": feeder.id,
            "name": feeder.name,
            "area": feeder.area,
            "status": feeder.status,
            "expected_restore": feeder.expected_restore,
            "staff": {
                "id": staff.id,
                "name": staff.name,
                "phone": staff.phone
            } if staff else None
        }

    # ---------- STAFF ----------
    if role == "staff":
        feeders = db.query(models.Feeder).filter_by(staff_id=current_user.id).all()

        response = []
        for feeder in feeders:
            response.append({
                "id": feeder.id,
                "name": feeder.name,
                "area": feeder.area,
                "status": feeder.status,
                "expected_restore": feeder.expected_restore,
                "staff": {
                    "id": current_user.id,
                    "name": current_user.name,
                    "phone": current_user.phone
                }
            })
        return response

    # ---------- ADMIN ----------
    if role == "admin":
        feeders = db.query(models.Feeder).all()

        response = []
        for feeder in feeders:
            staff = db.query(models.User).filter_by(id=feeder.staff_id).first()

            response.append({
                "id": feeder.id,
                "name": feeder.name,
                "area": feeder.area,
                "status": feeder.status,
                "expected_restore": feeder.expected_restore,
                "staff": {
                    "id": staff.id,
                    "name": staff.name,
                    "phone": staff.phone
                } if staff else None
            })
        return response

    raise HTTPException(status_code=403, detail="Invalid role access.")




@router.delete("/delete", summary="Delete a feeder (Admin only)")
def delete_feeder(
    request_data: FeederDeleteRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can delete feeders.")

    feeder = db.query(models.Feeder).filter_by(id=request_data.feeder_id).first()
    if not feeder:
        raise HTTPException(status_code=404, detail="Feeder not found.")

    # Optionally delete user-feeder mappings
    db.query(models.UserFeederMapping).filter_by(feeder_id=feeder.id).delete()

    # Delete associated feeder updates
    db.query(models.FeederUpdate).filter_by(feeder_id=feeder.id).delete()

    db.delete(feeder)
    db.commit()

    return {"message": f"Feeder '{feeder.name}' deleted successfully."}


# --------------------------------------------------------------------
# POST /feeders → Add new feeder (Admin only)
# --------------------------------------------------------------------
@router.post("/", summary="Add a new feeder (Admin only)")
def create_feeder(
    feeder_data: FeederCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can create feeders.")

    feeder = models.Feeder(
        name=feeder_data.name,
        area=feeder_data.area,
        status=feeder_data.status,
        expected_restore=datetime.fromisoformat(feeder_data.expected_restore)
        if feeder_data.expected_restore
        else None,
    )
    db.add(feeder)
    db.commit()
    db.refresh(feeder)

    return {"message": f"Feeder '{feeder.name}' added successfully.", "feeder_id": feeder.id}

# --------------------------------------------------------------------
# PATCH /feeders/status → Update feeder status (Staff only)
# --------------------------------------------------------------------
@router.patch("/update-status", summary="Update feeder status (Staff only)")
def update_feeder_status(
    update_data: FeederStatusUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "staff":
        raise HTTPException(status_code=403, detail="Only staff can update feeder status.")

    feeder = db.query(models.Feeder).filter_by(id=update_data.feeder_id, staff_id=current_user.id).first()
    if not feeder:
        raise HTTPException(status_code=404, detail="Feeder not found or not assigned to you.")

    feeder.status = update_data.status
    if update_data.expected_restore:
        try:
            feeder.expected_restore = datetime.fromisoformat(update_data.expected_restore)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid datetime format. Use ISO format.")
    db.commit()

    # Log this update
    new_update = models.FeederUpdate(
        feeder_id=feeder.id,
        updated_by=current_user.id,
        status=update_data.status,
        remarks=update_data.remarks or "",
    )
    db.add(new_update)
    db.commit()

    return {"message": f"Feeder '{feeder.name}' status updated successfully."}

# --------------------------------------------------------------------
# PATCH /feeders/assign → Assign staff to feeder (Admin only)
# --------------------------------------------------------------------
@router.patch("/assign", summary="Assign feeder to staff (Admin only)")
def assign_feeder(
    request_data: FeederAssignRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can assign feeders.")

    feeder = db.query(models.Feeder).filter_by(id=request_data.feeder_id).first()
    if not feeder:
        raise HTTPException(status_code=404, detail="Feeder not found.")

    staff = db.query(models.User).filter_by(id=request_data.staff_id, role="staff").first()
    if not staff:
        raise HTTPException(status_code=400, detail="Invalid staff ID or user is not a staff.")

    feeder.staff_id = staff.id
    db.commit()

    return {"message": f"Feeder '{feeder.name}' successfully assigned to {staff.name}."}

# --------------------------------------------------------------------
# PATCH /feeders/assign-user → Assign user to feeder (Admin or Staff)
# --------------------------------------------------------------------
@router.patch("/assign-user", summary="Assign user to feeder (Admin or Staff)")
def assign_user_to_feeder(
    request_data: UserAssignRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Only admin or staff can assign users to feeders.")

    feeder = db.query(models.Feeder).filter_by(id=request_data.feeder_id).first()
    if not feeder:
        raise HTTPException(status_code=404, detail="Feeder not found.")

    user = db.query(models.User).filter_by(id=request_data.user_id, role="user").first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid user ID or user is not a normal user.")

    existing = db.query(models.UserFeederMapping).filter_by(user_id=user.id).first()
    if existing:
        existing.feeder_id = feeder.id
    else:
        new_mapping = models.UserFeederMapping(user_id=user.id, feeder_id=feeder.id)
        db.add(new_mapping)

    db.commit()

    return {"message": f"User '{user.name}' assigned to feeder '{feeder.name}'."}
