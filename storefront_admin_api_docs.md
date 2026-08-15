# Storefront & Contact Us API Documentation

This document provides the API contracts for managing the storefront's public content (hero section, footer, contact info, about us) from the Admin Panel, as well as handling Contact Us form submissions.

---

## 🛡️ Admin Panel APIs

All Admin APIs require a valid `Bearer Token` in the `Authorization` header (`Authorization: Bearer <token>`). The user must have the necessary catalog/storefront permissions.

> [!IMPORTANT]
> The backend automatically infers the `organizationId` from the authenticated admin's JWT token!

---

### 1. Storefront Config (`/api/v1/admin/catalog/config`)

#### Get Storefront Config
- **Endpoint:** `GET /api/v1/admin/catalog/config`
- **Description:** Retrieves the public storefront content configuration.
- **Response:**
```json
{
  "success": true,
  "data": {
    "navItems": [
      { "name": "Home", "url": "/", "order": 1 },
      { "name": "Shop", "url": "/shop", "order": 2 },
      { "name": "About Us", "url": "/about", "order": 3 },
      { "name": "Contact", "url": "/contact", "order": 4 }
    ],
    "heroSection": {
      "banners": [
        {
          "image": "https://example.com/banner1.jpg",
          "title": "Summer Sale",
          "subtitle": "Up to 50% off",
          "link": "/sale",
          "ctaText": "Shop Now",
          "isActive": true
        }
      ],
      "featuredProductIds": ["64a1b2c3d4e5f60001a1b1c1"]
    },
    "aboutUs": {
      "title": "About Northwind",
      "description": "Premium products since 1999.",
      "image": "https://example.com/about.jpg"
    },
    "footer": {
      "quickLinks": [
        { "name": "Privacy Policy", "url": "/privacy" },
        { "name": "Terms of Service", "url": "/terms" }
      ],
      "contactUs": {
        "address": "123 Main St, New York, NY",
        "phone": "+1 (555) 010-0100",
        "email": "support@northwind.io",
        "hours": "Mon - Fri, 9am - 5pm"
      },
      "copyrightText": "© 2026 Northwind. All rights reserved."
    },
    "socialLinks": [
      { "platform": "Instagram", "url": "https://instagram.com/northwind" },
      { "platform": "Twitter", "url": "https://twitter.com/northwind" }
    ]
  }
}
```

#### Update Storefront Config
- **Endpoint:** `PUT /api/v1/admin/catalog/config`
- **Description:** Updates the storefront content configuration.
- **Request Body (Partial or Full):**
> **Note on Arrays (`navItems`, `socialLinks`, `banners`):** Sending an array replaces the entire existing array in the database. To **add** or **remove** items, simply send the complete updated list.
```json
{
  "navItems": [
    { "name": "Home", "url": "/", "order": 1 },
    { "name": "Products", "url": "/products", "order": 2 }
  ],
  "aboutUs": {
    "title": "About Northwind",
    "description": "Updated description text."
  },
  "footer": {
    "contactUs": {
      "phone": "+1 (800) 123-4567"
    }
  },
  "socialLinks": [
    { "platform": "Facebook", "url": "https://facebook.com/northwind" }
  ]
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Storefront config updated successfully",
  "data": { ...updated config... }
}
```

---

### 2. Contact Submissions (`/api/v1/admin/catalog/contact-submissions`)

#### List Contact Submissions
- **Endpoint:** `GET /api/v1/admin/catalog/contact-submissions`
- **Description:** Retrieve a paginated list of all contact inquiries submitted from the public site.
- **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 50)
  - `status` (enum: 'pending', 'read', 'replied', 'any'. default: 'any')
- **Response:**
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "_id": "64a1b2c3d4e5f60001a1b1c2",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "+1 (555) 111-2222",
        "subject": "Order Issue",
        "message": "I haven't received my tracking number yet.",
        "status": "pending",
        "createdAt": "2026-07-31T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

#### Update Submission Status
- **Endpoint:** `PATCH /api/v1/admin/catalog/contact-submissions/:id/status`
- **Description:** Mark a contact inquiry as read or replied.
- **Request Body:**
```json
{
  "status": "read" 
}
```
*(Valid statuses: `pending`, `read`, `replied`)*

- **Response:**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "data": { ...updated submission... }
}
```

---

## 🛍️ Public / Storefront APIs

These APIs do not require Admin authentication, but they do require the `x-organization-id` header (or `?organizationId=` query param) to identify which store the customer is interacting with.

---

### 1. Submit Contact Us Form
- **Endpoint:** `POST /api/v1/storefront/contact-us`
- **Description:** Submit a message from the storefront. Automatically triggers an email notification to the `adminNotificationEmail` configured in the store settings.
- **Request Body:**
```json
{
  "organizationId": "org_123",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1 (555) 111-2222",
  "subject": "Question about shipping",
  "message": "Do you ship internationally?"
}
```
*(Note: `phone` and `subject` are optional. `organizationId` can be omitted from body if provided in header or query).*

- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f60001a1b1c2",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "status": "pending",
    "createdAt": "2026-07-31T10:00:00.000Z"
  }
}
```
