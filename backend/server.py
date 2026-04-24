from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr


# ---------- Setup ----------
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ['ADMIN_EMAIL']
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Pop Up API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ---------- Models ----------
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    category: str  # vestidos | blusas | faldas | pantalones | conjuntos
    sizes: List[str] = Field(default_factory=lambda: ["S", "M", "L"])
    images: List[str] = Field(default_factory=list)
    stock: int = 10
    featured: bool = False
    is_new: bool = False


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    sizes: Optional[List[str]] = None
    images: Optional[List[str]] = None
    stock: Optional[int] = None
    featured: Optional[bool] = None
    is_new: Optional[bool] = None


class Product(ProductBase):
    id: str
    created_at: datetime


class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    size: str
    quantity: int
    image: str


class OrderCreate(BaseModel):
    customer_name: str
    email: EmailStr
    phone: str
    address: str
    city: str
    district: Optional[str] = ""
    notes: Optional[str] = ""
    items: List[OrderItem]


class Order(BaseModel):
    id: str
    customer_name: str
    email: str
    phone: str
    address: str
    city: str
    district: Optional[str] = ""
    notes: Optional[str] = ""
    items: List[OrderItem]
    total: float
    status: str = "pending"
    created_at: datetime


class OrderStatusUpdate(BaseModel):
    status: str  # pending | confirmed | shipped | delivered | cancelled


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    email: str
    name: str
    role: str


# ---------- Auth Helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ---------- Auth Endpoints ----------
@api_router.post("/auth/login")
async def login(data: LoginRequest):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
    token = create_access_token(user["id"], user["email"], user["role"])
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]},
    }


@api_router.get("/auth/me", response_model=UserPublic)
async def me(current: dict = Depends(get_current_admin)):
    return UserPublic(id=current["id"], email=current["email"], name=current["name"], role=current["role"])


@api_router.post("/auth/logout")
async def logout(current: dict = Depends(get_current_admin)):
    return {"ok": True}


# ---------- Product Endpoints ----------
@api_router.get("/products", response_model=List[Product])
async def list_products(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    size: Optional[str] = None,
    limit: int = Query(100, le=200),
):
    query: dict = {}
    if category and category != "all":
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if size:
        query["sizes"] = size
    if min_price is not None or max_price is not None:
        price_q: dict = {}
        if min_price is not None:
            price_q["$gte"] = min_price
        if max_price is not None:
            price_q["$lte"] = max_price
        query["price"] = price_q
    cursor = db.products.find(query, {"_id": 0}).sort("created_at", -1).limit(limit)
    items = await cursor.to_list(limit)
    for p in items:
        if isinstance(p.get("created_at"), str):
            p["created_at"] = datetime.fromisoformat(p["created_at"])
    return items


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    p = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if isinstance(p.get("created_at"), str):
        p["created_at"] = datetime.fromisoformat(p["created_at"])
    return p


@api_router.post("/products", response_model=Product)
async def create_product(data: ProductCreate, current: dict = Depends(get_current_admin)):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    doc["created_at"] = datetime.fromisoformat(doc["created_at"])
    return doc


@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, data: ProductUpdate, current: dict = Depends(get_current_admin)):
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="Nada que actualizar")
    result = await db.products.update_one({"id": product_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    p = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(p.get("created_at"), str):
        p["created_at"] = datetime.fromisoformat(p["created_at"])
    return p


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current: dict = Depends(get_current_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"ok": True}


# ---------- Order Endpoints ----------
@api_router.post("/orders", response_model=Order)
async def create_order(data: OrderCreate):
    if not data.items:
        raise HTTPException(status_code=400, detail="El carrito está vacío")
    total = sum(item.price * item.quantity for item in data.items)
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["total"] = round(total, 2)
    doc["status"] = "pending"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.orders.insert_one(doc)
    doc.pop("_id", None)
    doc["created_at"] = datetime.fromisoformat(doc["created_at"])
    return doc


@api_router.get("/orders", response_model=List[Order])
async def list_orders(current: dict = Depends(get_current_admin)):
    cursor = db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(500)
    items = await cursor.to_list(500)
    for o in items:
        if isinstance(o.get("created_at"), str):
            o["created_at"] = datetime.fromisoformat(o["created_at"])
    return items


@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current: dict = Depends(get_current_admin)):
    o = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not o:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    if isinstance(o.get("created_at"), str):
        o["created_at"] = datetime.fromisoformat(o["created_at"])
    return o


@api_router.patch("/orders/{order_id}", response_model=Order)
async def update_order_status(order_id: str, data: OrderStatusUpdate, current: dict = Depends(get_current_admin)):
    if data.status not in ["pending", "confirmed", "shipped", "delivered", "cancelled"]:
        raise HTTPException(status_code=400, detail="Estado inválido")
    result = await db.orders.update_one({"id": order_id}, {"$set": {"status": data.status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    o = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if isinstance(o.get("created_at"), str):
        o["created_at"] = datetime.fromisoformat(o["created_at"])
    return o


# ---------- Health ----------
@api_router.get("/")
async def root():
    return {"app": "Pop Up", "status": "ok"}


# ---------- Seed ----------
SEED_PRODUCTS = [
    # Vestidos
    {
        "name": "Vestido Midi Rosa Empolvado",
        "description": "Vestido midi en tono rosa empolvado con silueta fluida, perfecto para ocasiones especiales. Tela liviana y caída elegante.",
        "price": 189.00,
        "category": "vestidos",
        "sizes": ["XS", "S", "M", "L"],
        "images": [
            "https://images.unsplash.com/photo-1653286431693-2bbde8b10e14?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd29tZW4lMjBkcmVzcyUyMHBhc3RlbHxlbnwwfHx8fDE3NzcwNTE2OTJ8MA&ixlib=rb-4.1.0&q=85",
            "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&q=85",
        ],
        "stock": 15,
        "featured": True,
        "is_new": True,
    },
    {
        "name": "Vestido Floral Bloom",
        "description": "Vestido de inspiración romántica con estampado floral delicado. Mangas abullonadas y cintura entallada.",
        "price": 159.00,
        "category": "vestidos",
        "sizes": ["S", "M", "L"],
        "images": [
            "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=900&q=85",
            "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&q=85",
        ],
        "stock": 12,
        "featured": True,
    },
    {
        "name": "Vestido Slip Satinado",
        "description": "Vestido slip en satén con tirantes finos. Elegante, minimalista y versátil.",
        "price": 215.00,
        "category": "vestidos",
        "sizes": ["XS", "S", "M"],
        "images": [
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=85",
        ],
        "stock": 8,
        "is_new": True,
    },
    # Blusas
    {
        "name": "Blusa Pastel Drape",
        "description": "Blusa en rosa pastel con drapeado frontal suave. Tejido fluido y acabado prolijo.",
        "price": 119.00,
        "category": "blusas",
        "sizes": ["XS", "S", "M", "L"],
        "images": [
            "https://static.prod-images.emergentagent.com/jobs/0b23cfd5-8cc1-479c-83ea-8b020088f0be/images/e567ae3faca490a10a29e55330f17000c495275f5aaf1289445a7f2d34b22f67.png",
        ],
        "stock": 20,
        "featured": True,
    },
    {
        "name": "Top Knit Suave",
        "description": "Top de punto fino color crema. Cómodo, elástico y fácil de combinar.",
        "price": 89.00,
        "category": "blusas",
        "sizes": ["S", "M", "L"],
        "images": [
            "https://images.unsplash.com/photo-1564257577-2d3d1c56adf2?w=900&q=85",
        ],
        "stock": 25,
    },
    {
        "name": "Camisa Oversized Blanca",
        "description": "Camisa oversized en algodón blanco puro. Corte relajado, ideal para estilismos casuales o formales.",
        "price": 139.00,
        "category": "blusas",
        "sizes": ["XS", "S", "M", "L", "XL"],
        "images": [
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&q=85",
        ],
        "stock": 18,
        "is_new": True,
    },
    # Faldas
    {
        "name": "Falda Midi Rose Plissé",
        "description": "Falda midi plisada en tono rosa. Cinturilla elástica y vuelo fluido al caminar.",
        "price": 149.00,
        "category": "faldas",
        "sizes": ["S", "M", "L"],
        "images": [
            "https://static.prod-images.emergentagent.com/jobs/0b23cfd5-8cc1-479c-83ea-8b020088f0be/images/ebbe02c69cdea875ef6b1acd5aeed509c783df10684487cda2658e09147fc21f.png",
        ],
        "stock": 14,
        "featured": True,
    },
    {
        "name": "Falda Mini A-Line",
        "description": "Falda mini corte A en tono beige. Combinable con cualquier top.",
        "price": 99.00,
        "category": "faldas",
        "sizes": ["XS", "S", "M"],
        "images": [
            "https://images.unsplash.com/photo-1583496661160-fb5886a13d44?w=900&q=85",
        ],
        "stock": 16,
    },
    # Pantalones
    {
        "name": "Pantalón Wide Leg Crema",
        "description": "Pantalón de pierna ancha en tono crema. Caída elegante y cintura alta.",
        "price": 179.00,
        "category": "pantalones",
        "sizes": ["XS", "S", "M", "L"],
        "images": [
            "https://images.unsplash.com/photo-1496865534669-25ec2a3a0fd3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGZhc2hpb24lMjBtb2RlbCUyMHBhc3RlbCUyMG1pbmltYWx8ZW58MHx8fHwxNzc3MDUxNjkyfDA&ixlib=rb-4.1.0&q=85",
        ],
        "stock": 22,
        "featured": True,
    },
    {
        "name": "Jean Mom Fit",
        "description": "Jean mom fit en denim suave. Tiro alto y calce cómodo.",
        "price": 169.00,
        "category": "pantalones",
        "sizes": ["S", "M", "L"],
        "images": [
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&q=85",
        ],
        "stock": 19,
        "is_new": True,
    },
    # Conjuntos
    {
        "name": "Conjunto Blazer Pastel",
        "description": "Conjunto de blazer y pantalón en rosa pastel. Elegante, moderno y femenino.",
        "price": 329.00,
        "category": "conjuntos",
        "sizes": ["S", "M", "L"],
        "images": [
            "https://images.pexels.com/photos/7691223/pexels-photo-7691223.jpeg",
            "https://images.pexels.com/photos/7872805/pexels-photo-7872805.jpeg",
        ],
        "stock": 10,
        "featured": True,
        "is_new": True,
    },
    {
        "name": "Conjunto Knit Loungewear",
        "description": "Conjunto de punto en dos piezas. Top y pantalón cómodos para looks relajados.",
        "price": 219.00,
        "category": "conjuntos",
        "sizes": ["XS", "S", "M", "L"],
        "images": [
            "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=900&q=85",
        ],
        "stock": 13,
    },
]


async def seed_admin():
    existing = await db.users.find_one({"email": ADMIN_EMAIL.lower()})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL.lower(),
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Admin Pop Up",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin seeded: %s", ADMIN_EMAIL)
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one(
            {"email": ADMIN_EMAIL.lower()},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
        )
        logger.info("Admin password updated")


async def seed_products():
    count = await db.products.count_documents({})
    if count > 0:
        return
    now = datetime.now(timezone.utc).isoformat()
    docs = []
    for p in SEED_PRODUCTS:
        docs.append({
            **p,
            "id": str(uuid.uuid4()),
            "created_at": now,
        })
    if docs:
        await db.products.insert_many(docs)
        logger.info("Seeded %d products", len(docs))


@app.on_event("startup")
async def startup_event():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("category")
    await db.products.create_index("id", unique=True)
    await db.orders.create_index("id", unique=True)
    await seed_admin()
    await seed_products()


@app.on_event("shutdown")
async def shutdown_event():
    client.close()


# ---------- Finalize ----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
