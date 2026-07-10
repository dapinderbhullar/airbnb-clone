from pydantic import BaseModel, ConfigDict

from datetime import date


class BookingCreate(BaseModel):
    listing_id: int
    guest_name: str
    check_in: date
    check_out: date


class BookingResponse(BookingCreate):
    id: int
    total_price: float

    model_config = ConfigDict(from_attributes=True)


class ListingBase(BaseModel):
    title: str
    location: str
    price: float
    image: str


class ListingCreate(ListingBase):
    pass


class ListingResponse(ListingBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "guest"


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ReviewCreate(BaseModel):
    listing_id: int
    rating: int
    comment: str


class ReviewResponse(ReviewCreate):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)