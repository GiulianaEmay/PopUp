"""
Backend API tests for Pop Up e-commerce.
Covers: auth, products (list/filters/detail/CRUD w/ admin guard), orders (guest create, admin list/update).
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://pastel-boutique-6.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@popup.com"
ADMIN_PASSWORD = "popup2026"


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and data["user"]["role"] == "admin"
    return data["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ---------- Health ----------
class TestHealth:
    def test_root(self):
        r = requests.get(f"{API}/", timeout=10)
        assert r.status_code == 200
        assert r.json().get("status") == "ok"


# ---------- Auth ----------
class TestAuth:
    def test_login_success(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
        assert r.status_code == 200
        body = r.json()
        assert isinstance(body["token"], str) and len(body["token"]) > 20
        assert body["user"]["email"] == ADMIN_EMAIL
        assert body["user"]["role"] == "admin"

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=10)
        assert r.status_code == 401

    def test_login_unknown_user(self):
        r = requests.post(f"{API}/auth/login", json={"email": "nobody@popup.com", "password": "xxx"}, timeout=10)
        assert r.status_code == 401

    def test_me_requires_auth(self):
        r = requests.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 401

    def test_me_with_valid_token(self, admin_headers):
        r = requests.get(f"{API}/auth/me", headers=admin_headers, timeout=10)
        assert r.status_code == 200
        body = r.json()
        assert body["email"] == ADMIN_EMAIL
        assert body["role"] == "admin"

    def test_me_with_invalid_token(self):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer bogus.token.here"}, timeout=10)
        assert r.status_code == 401


# ---------- Products ----------
class TestProducts:
    def test_list_products_seeded(self):
        r = requests.get(f"{API}/products", timeout=10)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 12, f"Expected >=12 seeded products, got {len(items)}"
        # validate schema of first item
        p = items[0]
        for key in ["id", "name", "price", "category", "sizes", "images", "stock", "created_at"]:
            assert key in p, f"Missing key {key} in product"

    def test_filter_by_category(self):
        r = requests.get(f"{API}/products?category=vestidos", timeout=10)
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        for p in items:
            assert p["category"] == "vestidos"

    def test_filter_featured(self):
        r = requests.get(f"{API}/products?featured=true", timeout=10)
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        for p in items:
            assert p["featured"] is True

    def test_filter_by_size(self):
        r = requests.get(f"{API}/products?size=M", timeout=10)
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        for p in items:
            assert "M" in p["sizes"]

    def test_filter_price_range(self):
        r = requests.get(f"{API}/products?min_price=100&max_price=200", timeout=10)
        assert r.status_code == 200
        items = r.json()
        for p in items:
            assert 100 <= p["price"] <= 200

    def test_search_by_name(self):
        r = requests.get(f"{API}/products?search=Vestido", timeout=10)
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        for p in items:
            assert "vestido" in p["name"].lower()

    def test_get_product_detail(self):
        r = requests.get(f"{API}/products", timeout=10)
        pid = r.json()[0]["id"]
        r2 = requests.get(f"{API}/products/{pid}", timeout=10)
        assert r2.status_code == 200
        assert r2.json()["id"] == pid

    def test_get_product_404(self):
        r = requests.get(f"{API}/products/does-not-exist", timeout=10)
        assert r.status_code == 404

    def test_create_product_unauth(self):
        payload = {"name": "x", "description": "y", "price": 10.0, "category": "blusas"}
        r = requests.post(f"{API}/products", json=payload, timeout=10)
        assert r.status_code == 401

    def test_admin_product_crud(self, admin_headers):
        payload = {
            "name": "TEST_Product_Pytest",
            "description": "test desc",
            "price": 55.5,
            "category": "blusas",
            "sizes": ["S", "M"],
            "images": ["https://example.com/i.jpg"],
            "stock": 7,
            "featured": True,
            "is_new": True,
        }
        # Create
        r = requests.post(f"{API}/products", json=payload, headers=admin_headers, timeout=10)
        assert r.status_code == 200, r.text
        created = r.json()
        pid = created["id"]
        assert created["name"] == payload["name"]
        assert created["price"] == 55.5
        assert created["stock"] == 7

        # GET to verify persisted
        r2 = requests.get(f"{API}/products/{pid}", timeout=10)
        assert r2.status_code == 200
        assert r2.json()["name"] == payload["name"]

        # Update
        r3 = requests.put(f"{API}/products/{pid}", json={"price": 77.0, "stock": 3}, headers=admin_headers, timeout=10)
        assert r3.status_code == 200
        assert r3.json()["price"] == 77.0
        assert r3.json()["stock"] == 3

        # Verify update persisted
        r4 = requests.get(f"{API}/products/{pid}", timeout=10)
        assert r4.json()["price"] == 77.0

        # Delete
        r5 = requests.delete(f"{API}/products/{pid}", headers=admin_headers, timeout=10)
        assert r5.status_code == 200
        assert r5.json().get("ok") is True

        # Verify deletion
        r6 = requests.get(f"{API}/products/{pid}", timeout=10)
        assert r6.status_code == 404


# ---------- Orders ----------
class TestOrders:
    @pytest.fixture(scope="class")
    def sample_items(self):
        r = requests.get(f"{API}/products", timeout=10)
        prods = r.json()[:2]
        return [
            {
                "product_id": p["id"],
                "name": p["name"],
                "price": p["price"],
                "size": p["sizes"][0],
                "quantity": 2,
                "image": p["images"][0] if p["images"] else "",
            }
            for p in prods
        ]

    def test_create_order_guest(self, sample_items):
        payload = {
            "customer_name": "TEST Cliente",
            "email": "test_cliente@example.com",
            "phone": "555-0000",
            "address": "Av. Siempre Viva 123",
            "city": "Lima",
            "district": "Miraflores",
            "notes": "test order",
            "items": sample_items,
        }
        r = requests.post(f"{API}/orders", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        body = r.json()
        expected_total = round(sum(i["price"] * i["quantity"] for i in sample_items), 2)
        assert body["total"] == expected_total
        assert body["status"] == "pending"
        assert body["customer_name"] == payload["customer_name"]
        assert "id" in body
        TestOrders.created_id = body["id"]

    def test_create_order_empty_items(self):
        payload = {
            "customer_name": "Empty",
            "email": "e@e.com",
            "phone": "1",
            "address": "a",
            "city": "c",
            "items": [],
        }
        r = requests.post(f"{API}/orders", json=payload, timeout=10)
        assert r.status_code == 400

    def test_list_orders_unauth(self):
        r = requests.get(f"{API}/orders", timeout=10)
        assert r.status_code == 401

    def test_list_orders_admin(self, admin_headers):
        r = requests.get(f"{API}/orders", headers=admin_headers, timeout=10)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 1

    def test_update_order_status(self, admin_headers):
        # Ensure at least one order exists
        order_id = getattr(TestOrders, "created_id", None)
        if not order_id:
            orders = requests.get(f"{API}/orders", headers=admin_headers, timeout=10).json()
            assert orders, "No orders to update"
            order_id = orders[0]["id"]

        r = requests.patch(
            f"{API}/orders/{order_id}",
            json={"status": "confirmed"},
            headers=admin_headers,
            timeout=10,
        )
        assert r.status_code == 200
        assert r.json()["status"] == "confirmed"

        # Invalid status
        r2 = requests.patch(
            f"{API}/orders/{order_id}",
            json={"status": "bogus"},
            headers=admin_headers,
            timeout=10,
        )
        assert r2.status_code == 400

    def test_update_order_unauth(self):
        r = requests.patch(f"{API}/orders/any", json={"status": "confirmed"}, timeout=10)
        assert r.status_code == 401
