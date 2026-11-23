# Software requirements (IEC 62304 §5.2, ISO 13485 §7.3.3)

> Practice dataset. These requirements were derived from the existing scenarios so the traceability matrix has something real to trace. In a real project, requirements come first and tests are written to verify them.

Each requirement must be verifiable. `scripts/build-traceability.mjs` reads the table below. Keep one requirement per row and keep the ID in the first column.

| ID | Requirement | Risks | Status |
|---|---|---|---|
| REQ-001 | Only signed-in users can open the catalog, cart and checkout pages. Signing out ends access. | RISK-002 | Approved |
| REQ-002 | A failed sign-in shows a message that names the reason: locked account, wrong credentials, or a missing field. | RISK-006 | Approved |
| REQ-003 | The catalog lists every product with its correct price. | RISK-005 | Approved |
| REQ-004 | Users can sort products by name (A to Z, Z to A) and by price (low to high, high to low). The default is name A to Z. | | Approved |
| REQ-005 | The cart shows exactly the products added, with quantity and price. It stays the same after navigation and page reload. | RISK-003 | Approved |
| REQ-006 | A product's details page matches its catalog entry. An unknown product ID shows a not found page. | RISK-005 | Approved |
| REQ-007 | Checkout cannot continue without first name, last name and postal code. | RISK-004 | Approved |
| REQ-008 | The order overview shows the item total, tax at 8% of the item total, and an order total that equals item total plus tax. | RISK-001 | Approved |
| REQ-009 | Finishing an order shows a confirmation and empties the cart. Cancelling keeps the cart. | RISK-003 | Approved |
| REQ-010 | The menu offers All Items, Reset App State (empties the cart) and an About link to Sauce Labs. | | Approved |
