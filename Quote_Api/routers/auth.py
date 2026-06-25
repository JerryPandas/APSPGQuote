from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from database import get_db
from models import APSPGQuoteUser
from schemas import LoginRequest, Token, UserInfo
from auth import verify_password, create_access_token, create_refresh_token, verify_token, get_password_hash, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(APSPGQuoteUser).filter(APSPGQuoteUser.UserName == req.username).first()
    if not user or not verify_password(req.password, user.PassWordHash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    if user.IsActive != True:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    access_token = create_access_token(data={"sub": user.UserName, "user_id": user.Id, "role": user.Role})
    refresh_token = create_refresh_token(data={"sub": user.UserName, "user_id": user.Id, "role": user.Role})

    user.RefreshToken = refresh_token
    user.RefreshTokenExpiry = datetime.now(timezone.utc).replace(tzinfo=None) + __import__("datetime").timedelta(days=1)
    db.commit()

    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=Token)
def refresh(refresh_token: str, db: Session = Depends(get_db)):
    token_data = verify_token(refresh_token, "refresh")
    if token_data is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user = db.query(APSPGQuoteUser).filter(APSPGQuoteUser.Id == token_data.user_id).first()
    if not user or user.RefreshToken != refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token mismatch")

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if user.RefreshTokenExpiry and user.RefreshTokenExpiry < now:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

    new_access = create_access_token(data={"sub": user.UserName, "user_id": user.Id, "role": user.Role})
    new_refresh = create_refresh_token(data={"sub": user.UserName, "user_id": user.Id, "role": user.Role})

    user.RefreshToken = new_refresh
    user.RefreshTokenExpiry = datetime.now(timezone.utc).replace(tzinfo=None) + __import__("datetime").timedelta(days=1)
    db.commit()

    return Token(access_token=new_access, refresh_token=new_refresh)


@router.get("/me", response_model=UserInfo)
def get_me(current_user: APSPGQuoteUser = Depends(get_current_user)):
    return current_user


@router.post("/register", response_model=UserInfo)
def register(req: LoginRequest, db: Session = Depends(get_db)):
    existing = db.query(APSPGQuoteUser).filter(APSPGQuoteUser.UserName == req.username).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")

    new_user = APSPGQuoteUser(
        UserName=req.username,
        PassWordHash=get_password_hash(req.password),
        Role="Member",
        Job="1",
        IsActive=True,
        CreatedAt=datetime.now(timezone.utc).replace(tzinfo=None)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
