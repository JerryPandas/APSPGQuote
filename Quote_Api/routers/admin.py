from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import APSPGQuoteUser
from schemas import UserInfo
from auth import get_current_user, get_password_hash

router = APIRouter(prefix="/api/admin", tags=["Admin"])


def require_admin(current_user: APSPGQuoteUser = Depends(get_current_user)):
    if current_user.Role != "Admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/users", response_model=List[UserInfo])
def list_users(db: Session = Depends(get_db),
               admin: APSPGQuoteUser = Depends(require_admin)):
    users = db.query(APSPGQuoteUser).all()
    return users


@router.put("/users/{user_id}/role")
def update_role(user_id: int, role: str, db: Session = Depends(get_db),
                admin: APSPGQuoteUser = Depends(require_admin)):
    if role not in ("Admin", "Manager", "Member"):
        raise HTTPException(status_code=400, detail="Invalid role")
    user = db.query(APSPGQuoteUser).filter(APSPGQuoteUser.Id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.Role = role
    db.commit()
    return {"message": f"User {user.UserName} role updated to {role}"}


@router.put("/users/{user_id}/status")
def toggle_status(user_id: int, is_active: bool, db: Session = Depends(get_db),
                  admin: APSPGQuoteUser = Depends(require_admin)):
    user = db.query(APSPGQuoteUser).filter(APSPGQuoteUser.Id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.Id == admin.Id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    user.IsActive = is_active
    db.commit()
    return {"message": f"User {user.UserName} active status set to {is_active}"}


@router.put("/users/{user_id}")
def update_user(user_id: int, email: str = None, job: str = None,
                db: Session = Depends(get_db),
                admin: APSPGQuoteUser = Depends(require_admin)):
    user = db.query(APSPGQuoteUser).filter(APSPGQuoteUser.Id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if email is not None:
        user.Email = email
    if job is not None:
        user.Job = job
    db.commit()
    return {"message": f"User {user.UserName} updated"}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db),
                admin: APSPGQuoteUser = Depends(require_admin)):
    user = db.query(APSPGQuoteUser).filter(APSPGQuoteUser.Id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.Id == admin.Id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    db.delete(user)
    db.commit()
    return {"message": f"User {user.UserName} deleted"}
