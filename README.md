# SmallBusinessDirectory

A web-based Small Business Vendor Directory where vendors can post listings for their products or services, and users can search, filter, and contact them. Admins manage listings and categories to ensure quality and reliability.

---

## Team Members
1. Nelli Jemina Tuulikki Tarkka  
2. Sevil Nik  
3. Berin Venedik  
4. Bianca-Gabriela Leoveanu  
5. Tun Wellens  

---

## Repository Structure & Documentation

### Project Documentation
All analysis and design documents are available in the **Docs branch** of the repository:

🔗 https://github.com/nellitarkka/SmallBusinessDirectory/tree/Docs  

Each document provides detailed information about specific aspects of the system analysis and design.  
If a document does not render directly in GitHub’s preview, it can be downloaded and opened locally using any standard PDF reader.

### MVP Implementation
All files related to the MVP implementation can be found in the **deliverable-II branch**:

🔗 https://github.com/nellitarkka/SmallBusinessDirectory/tree/deliverable-II  

This branch contains the source code and README files in the respective folders describing:
- database setup,
- frontend execution,
- backend execution.

---

## 📄 Database Documentation

Detailed documentation of the database design and implementation can be found in the following locations:

### Database Design & Schema (Deliverables II–III)
```
database/README.md
```
Describes the relational schema, core tables, relationships, SQL views, and database-level security and inquiry mechanisms.

### Database Migrations
```
database/migrations/
```
Contains all versioned SQL migrations used to evolve the database across deliverables, including security, messaging, and inquiry support.

### Database Testing & Validation
- **Deliverable II** (schema and relational integrity):
```
tests/
```
- **Deliverable III** (security, messaging, and inquiry validation):
```docs/database_manual_tests.md```

Together, these documents provide a complete overview of the database layer, its evolution across deliverables, and the testing performed to validate its behavior.

---

## Individual Contributions

### Bianca-Gabriela Leoveanu

#### Deliverable I – Requirements Engineering
- Participated in requirements elicitation activities.
- Contributed to identifying and structuring functional and non-functional requirements.
- Supported the creation of the requirements documentation used as the basis for subsequent deliverables.

#### Deliverable II – Database Design
- Contributed to the design and implementation of the relational database schema.
- Worked on table definitions, relationships, constraints, and indexing.
- Supported the development of SQL views and database testing materials.

#### Deliverable III – Database Security & Inquiry Support
- Designed and implemented database-level mechanisms for security, messaging, and inquiries.
- Developed SQL migrations introducing email verification enforcement, rate limiting, inquiry workflows, and trust-related features.
- Implemented abuse-prevention logic and inquiry lifecycle handling.
- Performed manual database validation and documented testing procedures.

#### Collaboration & Presentation
- Supported team coordination and communication throughout the project.
- Contributed to the preparation and structuring of the project presentation.
- Helped ensure consistency between documentation, implementation, and presentation content.
