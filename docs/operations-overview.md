# Fuel-Pro — Operational Overview

A plain-language summary of what the system does and how people use it day to day.
This is **not** a technical guide — it describes features and workflows, not code.

---

## What this system is

Fuel-Pro is a management dashboard for fuel-station businesses. One business
account can own **multiple stations**, and the system keeps each station's data
separate while giving owners a combined view across all of them.

Everything runs in the web browser. Users sign in, pick the station they want to
work on, and the screens update to show that station's information.

---

## Signing in

- Users log in with an **email and password**.
- There are two kinds of sign-in:
  - **Regular users** (station staff, managers, accountants, owners).
  - **Super Admin** (the platform-level administrator), who signs in through a
    separate admin login.
- If a user isn't signed in, the app sends them to the login screen
  automatically. Signing out clears their session and returns them to login.

---

## Choosing a station

- A **station selector** sits at the top of every screen.
- Picking a station scopes the whole app to that station — lists, forms, the
  dashboard widgets, and the people directory all show information for the
  selected station only.
- Choosing **"All stations"** gives owners a combined, business-wide view where
  that makes sense (for example, on the main dashboard).
- Some pages require a specific station before they'll show data. If no single
  station is chosen, those pages display a friendly "select a station" notice
  instead of an error.

---

## Who can see and do what (roles)

Access is controlled by **role**. Each role sees only the parts of the system it
needs, and can only perform the actions it's allowed to:

- **Super Admin** — full platform access.
- **Business Owner** — broad access across all of their stations.
- **Station Manager** — day-to-day management of their station(s).
- **Accountant** — financial and billing-focused access.
- **Cashier** — sales and basic customer entry.
- **Pump Attendant** — meter readings, shifts, and basic sales entry.

When a role isn't allowed to open a page, the menu item is hidden or shown as
**locked**, and the page itself politely blocks access rather than showing a
broken screen.

### Locked modules

To keep the current rollout focused, most modules are intentionally **locked**.
Today the system is open to:

- **Dashboard**
- **Stations**
- **Fuel Inventory** (including purchasing, fuel audits, invoice entry)
- **Catalog** (Items and Brands)
- **People (Persons)**

Locked items still appear in the sidebar with a small lock icon, so users can see
what's coming, but they can't open them yet. Locking can be relaxed centrally as
more modules are rolled out.

---

## The main dashboard

The dashboard is the business-wide snapshot, designed so an owner can understand
fuel costs and volumes at a glance.

- **Current supplier prices** — each gas supplier's latest per-gallon price,
  shown in large, bold numbers with a daily up/down change indicator.
- **Weekly price trends** — a line graph of prices over the last 7 days, with
  **price values labeled down the side**. Users can switch between the
  **market average** and **each individual supplier** to compare how that
  supplier's prices moved across all fuel grades (Regular, Plus, Premium,
  Diesel).
- **Supplier price comparison** — a pie chart that compares suppliers' current
  prices for a chosen grade, highlighting the **lowest-priced** supplier.
- **Totals to date** — total amount paid, total gallons purchased, number of
  suppliers, and stations served.
- **Gallons by grade** — how purchased volume splits across Regular, Plus,
  Premium, and Diesel.
- **Supplier → station map** — which supplier serves which stations.
- **Per-station board** — pick a station to see its own today's price, gallons,
  and amount paid.

---

## Stations

- A list of all stations with search, sorting, and paging.
- Owners/managers can **add, edit, and remove** stations (subject to their role).
- The station **code is generated automatically** — staff don't enter it.
- A **station details** page shows an overview of the selected station,
  including its fuel volumes, amount paid, supplier, and today's prices per
  grade. Opening it from the sidebar uses whichever station is currently selected
  at the top.

---

## Fuel Inventory

The fuel module covers the purchasing and auditing side of fuel:

- **Fuel Audits** — the heart of invoice checking. For each fuel invoice the page
  shows the date, invoice number, due date, amount, grade, quality, payment type
  and terms, and payment status. Alongside that it runs three at-a-glance checks
  and marks each as **Match** or **Mismatch**:
  1. **Amount vs. the day's quote** — did the invoiced price match the market
     quote for that grade?
  2. **Quality vs. BOL** — does the invoice quality match the bill of lading?
  3. **Debited vs. invoice** — was the amount actually debited the same as the
     invoice?
  A "today's quote" reference card and summary tiles make discrepancies easy to
  spot.
- **Invoice Entry** — staff upload supplier invoices (choosing fuel or retail,
  the vendor, invoice number, and amount) and can attach a **PDF or image** that
  can then be **viewed**.
- Supporting areas for purchase invoices, reports, and audit configuration sit in
  the same module.

---

## Catalog — Items & Brands

- **Items** and **Brands** are managed per station.
- Users must have a station selected to add or view them; the system reminds them
  if they haven't.
- Items can be **Fuel** or **Retail**; retail items require a product code (SKU),
  while fuel items don't.

---

## People (Persons)

Customers, suppliers, and employees used to be three separate pages. They're now
**one unified "Persons" directory**.

- When adding a person, the user first chooses a **person type** — Customer,
  Supplier, Employee, Labor, or Vendor — and the form adapts to that choice.
- Each person record captures the essentials: name, contact details, address,
  tax identifiers (CNIC, NTN, GST, DSL where relevant), and an optional
  **opening balance** (with a date) that the system can use to start their
  account.
- The list shows everyone for the selected station, with their **type**, phone,
  ID, opening balance, and status. It supports search, filtering by type or
  status, sorting, and paging.
- From the **3-dots menu** on each row, authorized users can:
  - **Edit** the person's details,
  - **Activate / Deactivate** the person (a single toggle that flips their
    status on or off), and
  - **Delete** the person.
- People are always tied to the station that's currently selected, so records
  stay correctly separated between stations.

---

## How information stays accurate and separated

- Every action is tied to the **logged-in account** and the **selected station**,
  so one station's data never leaks into another's.
- If a required station is missing, the system clearly says so instead of saving
  bad data.
- Success and error messages appear as brief **pop-up toasts**, so users get
  immediate confirmation of what happened (saved, deleted, activated, and so on).

---

## Demo vs. live data

The system can run in two modes:

- **Live mode** — talks to the real backend and shows real records.
- **Demo mode** — uses built-in sample data so the screens can be explored and
  presented without a live connection.

Switching between the two is a single setting, and the screens look and behave
the same either way.

---

## In short

Fuel-Pro gives a fuel-station business a single place to:

1. **See costs and volumes** across all stations (dashboard).
2. **Manage each station** and its catalog.
3. **Check fuel invoices** against quotes, quality, and bank debits (audits).
4. **Keep one tidy directory of everyone** — customers, suppliers, and staff —
   with the ability to activate, deactivate, edit, or remove them.

All of it is scoped by station and gated by role, so each person sees exactly
what they should.
