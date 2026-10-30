# X-Restorant API Documentation

Base URL: `http://localhost:5000`  
Frontend Base URL: `http://localhost:3001` (or `http://localhost:3000`)

---

## 🔐 Authentication Credentials

### Admin Login
- **Username**: `admin`
- **Password / PIN**: `2222`
- **Role**: `admin`
- **Portal URL**: [http://localhost:3001/login](http://localhost:3001/login)

### All Staff Credentials (Pre-seeded)
| Role | Username | PIN / Password | Phone | Redirect Route |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `2222` | `+251911000001` | `/admin` |
| **Manager** | `manager` | `9999` | `+251911000002` | `/admin` |
| **Waiter** | `waiter` | `1111` | `+251911000003` | `/waiter` |
| **Kitchen** | `kitchen` | `4444` | `+251911000004` | `/kitchen` |
| **Cashier** | `cashier` | `5555` | `+251911000005` | `/cashier` |
| **Driver** | `driver` | `3333` | `+251911000006` | `/driver` |

> In Postman, include the returned JWT as:  
> `Authorization: Bearer <token>`  
> (or send the `token` cookie set automatically on login).

---

## 📮 Postman Collection File
A ready-to-import Postman collection (v2.1.0) is saved at:
[`backend/postman_collection.json`](backend/postman_collection.json)

**How to Import into Postman:**
1. Open Postman.
2. Click **Import** (top left).
3. Select or drag-and-drop `backend/postman_collection.json`.
4. Run the **Admin Login** request. The test script will automatically save the returned JWT token to your collection variable `{{authToken}}` so subsequent protected requests authenticate automatically!

---

## 📡 API Endpoints Overview

### 1. Auth (`/api/auth`)
- **`POST /api/auth/login`**
  - **Access**: Public
  - **Body**:
    ```json
    {
      "username": "admin",
      "password": "2222"
    }
    ```
    *Alternatively, PIN-only:*
    ```json
    {
      "pin": "2222",
      "role": "admin"
    }
    ```
  - **Response**: `{ "success": true, "token": "...", "user": { ... } }`

- **`GET /api/auth/me`**
  - **Access**: Private (Bearer Token)
  - **Response**: Current user object

- **`POST /api/auth/logout`**
  - **Access**: Private
  - **Response**: Clears token cookie

- **`GET /api/auth/staff`**
  - **Access**: Private (`admin`, `manager`)
  - **Response**: Array of staff users (excluding PINs)

- **`POST /api/auth/staff`**
  - **Access**: Private (`admin`)
  - **Body**:
    ```json
    {
      "name": "Kidist (Waiter)",
      "username": "kidist",
      "role": "waiter",
      "pin": "1212",
      "phone": "+251911998877"
    }
    ```

---

### 2. Menu & Categories (`/api/menu`)
- **`GET /api/menu`**
  - **Access**: Public
  - **Response**: Bilingual menu categories with items grouped under each category

- **`POST /api/menu/items`**
  - **Access**: Private (`admin`, `manager`)
  - **Body**:
    ```json
    {
      "name": { "en": "Shekla Tibs", "am": "የሸክላ ጥብስ" },
      "description": { "en": "Sizzling beef in hot clay dish", "am": "በሙቅ የሸክላ ሳህን የሚቀርብ ልዩ የከብት ጥብስ" },
      "price": 500,
      "category": "<categoryId>",
      "spiceLevel": "Medium",
      "isFasting": false,
      "prepTimeMinutes": 15,
      "imageUrl": "https://..."
    }
    ```

- **`PUT /api/menu/items/:id`**
  - **Access**: Private (`admin`, `manager`)
  - **Body**: Any updated MenuItem fields

- **`PATCH /api/menu/items/:id/toggle`**
  - **Access**: Private (`admin`, `manager`, `kitchen`)
  - **Action**: Toggles item availability (in-stock / 86'd) & broadcasts via WebSocket

- **`DELETE /api/menu/items/:id`**
  - **Access**: Private (`admin`)

---

### 3. Tables (`/api/tables`)
- **`GET /api/tables/:number`**
  - **Access**: Public (Customer QR Code scan)
  - **Response**: Table info & active unpaid orders

- **`POST /api/tables/:number/call`**
  - **Access**: Public
  - **Action**: Alerts floor waiters with buzzer/toast notification

- **`POST /api/tables/:number/bill`**
  - **Access**: Public
  - **Action**: Requests bill; notifies waiter & cashier

- **`GET /api/tables`**
  - **Access**: Private (Staff)
  - **Response**: Floor view of all tables with occupancy & active orders

- **`POST /api/tables/:number/clear`**
  - **Access**: Private (`admin`, `manager`, `waiter`, `cashier`)
  - **Action**: Resets table status to `available`

---

### 4. Orders (`/api/orders`)
- **`POST /api/orders`**
  - **Access**: Public
  - **Body**:
    ```json
    {
      "type": "dine_in",
      "tableNumber": 1,
      "customer": {
        "name": "Customer Name",
        "phone": "+251911223344"
      },
      "items": [
        {
          "menuItemId": "<menuItemId>",
          "qty": 2,
          "notes": "Mild spice"
        }
      ],
      "payment": {
        "method": "telebirr",
        "status": "pending"
      }
    }
    ```

- **`GET /api/orders`**
  - **Access**: Private (Staff)
  - **Query Params**: `?status=pending&type=dine_in&limit=50`

- **`PATCH /api/orders/:id/status`**
  - **Access**: Private (Staff)
  - **Body**:
    ```json
    { "status": "approved" }
    ```
    *Allowed statuses*: `pending`, `approved`, `preparing`, `ready`, `served`, `delivered`, `settled`, `cancelled`

- **`POST /api/orders/:id/settle`**
  - **Access**: Private (`cashier`, `admin`, `manager`)
  - **Body**:
    ```json
    {
      "method": "telebirr",
      "referenceCode": "TEL12345678",
      "splits": []
    }
    ```

- **`POST /api/orders/:id/driver-location`**
  - **Access**: Private (`driver`, `admin`)
  - **Body**:
    ```json
    {
      "lat": 9.0249,
      "lng": 38.7469
    }
    ```

---

### 5. Settings (`/api/settings`)
- **`GET /api/settings`**
  - **Access**: Public
  - **Response**: Restaurant brand info, WiFi passwords, and Telebirr/Bank payment details

- **`PUT /api/settings`**
  - **Access**: Private (`admin`, `manager`)
  - **Body**: Update restaurant name, banks, WiFi, and direct kitchen routing toggle

---

### 6. Health Check (`/api/health`)
- **`GET /api/health`**
  - **Access**: Public
  - **Response**: `{ "ok": true, "status": "operational" }`
