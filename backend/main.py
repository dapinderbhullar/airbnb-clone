from datetime import datetime, timedelta, timezone

import os
from dotenv import load_dotenv

import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from database import Base, SessionLocal, engine
from models import Booking, Listing, User, Review
from schemas import (
    BookingCreate,
    BookingResponse,
    ListingCreate,
    ListingResponse,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    ReviewCreate,
    ReviewResponse
)


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Airbnb Clone API")

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


password_hash = PasswordHash.recommended()
security = HTTPBearer()

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is missing from backend/.env")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def create_access_token(user: User) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )

        try:
            user_id_number = int(user_id)
        except (TypeError, ValueError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    user = (
        db.query(User)
        .filter(User.id == user_id_number)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


def require_host(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != "host":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Host access required",
        )

    return current_user


@app.get("/")
def root():
    return {"message": "Airbnb Clone API is running"}


# Authentication routes

@app.post(
    "/auth/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    email = user_data.email.strip().lower()
    name = user_data.name.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name is required",
        )

    if len(user_data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters",
        )

    if user_data.role not in {"guest", "host"}:
        raise HTTPException(
            status_code=400,
            detail="Role must be guest or host",
        )

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered",
        )

    new_user = User(
        name=name,
        email=email,
        password_hash=password_hash.hash(user_data.password),
        role=user_data.role,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.post("/auth/login", response_model=TokenResponse)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db),
):
    email = login_data.email.strip().lower()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    password_is_valid = password_hash.verify(
        login_data.password,
        user.password_hash,
    )

    if not password_is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(user)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@app.get("/auth/me", response_model=UserResponse)
def get_logged_in_user(
    current_user: User = Depends(get_current_user),
):
    return current_user


# Listing routes

@app.get(
    "/listings",
    response_model=list[ListingResponse],
)
def get_listings(
    db: Session = Depends(get_db),
):
    return db.query(Listing).all()


@app.get(
    "/listings/{listing_id}",
    response_model=ListingResponse,
)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
):
    listing = (
        db.query(Listing)
        .filter(Listing.id == listing_id)
        .first()
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    return listing


@app.post(
    "/listings",
    response_model=ListingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_listing(
    listing: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_host),
):
    new_listing = Listing(
        **listing.model_dump()
    )

    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)

    return new_listing


@app.put(
    "/listings/{listing_id}",
    response_model=ListingResponse,
)
def update_listing(
    listing_id: int,
    listing: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_host),
):
    existing_listing = (
        db.query(Listing)
        .filter(Listing.id == listing_id)
        .first()
    )

    if not existing_listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    existing_listing.title = listing.title
    existing_listing.location = listing.location
    existing_listing.price = listing.price
    existing_listing.image = listing.image

    db.commit()
    db.refresh(existing_listing)

    return existing_listing


@app.delete("/listings/{listing_id}")
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_host),
):
    existing_listing = (
        db.query(Listing)
        .filter(Listing.id == listing_id)
        .first()
    )

    if not existing_listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    db.query(Booking).filter(
        Booking.listing_id == listing_id
    ).delete(synchronize_session=False)

    db.delete(existing_listing)
    db.commit()

    return {"message": "Listing deleted successfully"}


# Booking routes

@app.get(
    "/bookings",
    response_model=list[BookingResponse],
)
def get_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id)
        .all()
    )


@app.post(
    "/bookings",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = (
        db.query(Listing)
        .filter(Listing.id == booking.listing_id)
        .first()
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    if booking.check_out <= booking.check_in:
        raise HTTPException(
            status_code=400,
            detail="Check-out must be after check-in",
        )

    overlapping_booking = (
        db.query(Booking)
        .filter(
            Booking.listing_id == booking.listing_id,
            Booking.check_in < booking.check_out,
            Booking.check_out > booking.check_in,
        )
        .first()
    )

    if overlapping_booking:
        raise HTTPException(
            status_code=400,
            detail="Property is unavailable for these dates",
        )

    number_of_nights = (
        booking.check_out - booking.check_in
    ).days

    total_price = number_of_nights * listing.price

    new_booking = Booking(
        **booking.model_dump(),
        user_id=current_user.id,
        total_price=total_price,
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return new_booking


@app.delete("/bookings/{booking_id}")
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.id == booking_id,
            Booking.user_id == current_user.id,
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    db.delete(booking)
    db.commit()

    return {"message": "Booking cancelled successfully"}

@app.get(
    "/listings/{listing_id}/reviews",
    response_model=list[ReviewResponse],
)
def get_reviews(
    listing_id: int,
    db: Session = Depends(get_db),
):
    return (
        db.query(Review)
        .filter(Review.listing_id == listing_id)
        .all()
    )


@app.post(
    "/reviews",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = (
        db.query(Listing)
        .filter(Listing.id == review_data.listing_id)
        .first()
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(
            status_code=400,
            detail="Rating must be between 1 and 5",
        )

    existing_review = (
        db.query(Review)
        .filter(
            Review.listing_id == review_data.listing_id,
            Review.user_id == current_user.id,
        )
        .first()
    )

    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="You have already reviewed this property",
        )

    new_review = Review(
        listing_id=review_data.listing_id,
        user_id=current_user.id,
        rating=review_data.rating,
        comment=review_data.comment.strip(),
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return new_review