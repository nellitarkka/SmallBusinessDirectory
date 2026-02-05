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

deliverable-III-database
### MVP Implementation
All files related to the MVP implementation can be found in the **deliverable-II branch**:

🔗 https://github.com/nellitarkka/SmallBusinessDirectory/tree/deliverable-II  

This branch contains the source code and README files in the respective folders describing:
- database setup,
- frontend execution,
- backend execution.

---

## Architecture Overview

This document provides a high-level overview of the system architecture:
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

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
## Frontend Structure

The frontend folder structure and component organization are documented in: 
```
frontend/README.md
```

---

## Deployment

The application follows a three-tier architecture and is fully deployed using free cloud platforms.  
The frontend, built with Vite and React, is deployed on Cloudflare Pages, providing fast global static hosting. The backend, implemented with Node.js and Express, is deployed as a web service on Render. It connects to a PostgreSQL database hosted on Supabase and integrates email functionality via Gmail SMTP.

Environment variables are used to securely configure database access, authentication secrets, and API communication between the frontend and backend. The deployed system is fully functional and publicly accessible.

- Deployment links: http://smallbusinessdirectory.francecentral.cloudapp.azure.com , http://20.199.16.127

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
=======
All files related to the MVP can be found in the [deliverable-II](https://github.com/nellitarkka/SmallBusinessDirectory/tree/deliverable-II) branch
, as well as README files in the respective folders that describe how to set up the database and how to run the frontend and backend.

### Berin Venedik:

#### Deliverable I – Requirements Engineering
- Actively participated in requirements elicitation and clarification discussions.
- Designed and implemented UML sequence diagrams for core system interactions, supporting the formalization of user flows and system behavior.
- Contributed to defining system actors and user roles (customer, vendor, admin), as well as their interaction logic.
- Supported the structuring and refinement of the requirements documentation that served as the foundation for subsequent deliverables.
#### Deliverable II – System Design & Frontend Architecture
- Designed the overall frontend architecture of the application using React and TypeScript, following a modular structure aligned with the system design.
- Implemented the full frontend of the project, including authentication flows, dashboards, vendor listings, and detail views.
- Translated system and database requirements into frontend data models and API interaction logic.
- Ensured consistency between UI behavior, system requirements, and backend functionality.
- Contributed to design decisions related to usability, maintainability, and overall system coherence.
#### Deliverable III – Security, Testing & Documentation Support
- Contributed minor security-related updates in support of Deliverable III.
- Assisted with frontend-level security considerations and validation logic.
- Designed and implemented frontend unit and integration-style tests using Vitest and React Testing Library, including mocked backend interactions.
- Supported the preparation and refinement of technical documentation related to implemented frontend features.
#### Collaboration & Presentation
- Acted as the primary contributor for all frontend-related development and coordination.
- Contributed to the preparation and structuring of project presentations.
- Ensured consistency across requirements, implementation, documentation, and presentation materials.

### Tun Wellens:

#### Deliverable I – Requirements Engineering & UML Modeling
- Designed and implemented UML class and sequence diagrams to formalize system structure and behavioral flows.
- Contributed to requirements clarification and system modeling activities.
- Translated stakeholder requirements into detailed UML diagrams supporting subsequent design and implementation phases.

#### Deliverable II – Image Upload Feature & Frontend-Backend Integration
- Implemented the complete image upload functionality for vendor listings, including file handling, validation, and storage integration.
- Refactored frontend data stores and service layer to establish proper integration with backend API endpoints.
- Implemented additional backend routes and debugged API contract mismatches to ensure consistent communication between frontend and backend.
- Conducted extensive integration work to establish functional communication between all system layers.
- Ensured seamless transition from prototype to a fully functional, API-driven application across all features.

#### Deliverable III – End-to-End Testing & Refactoring
- Conducted comprehensive end-to-end testing across all system features to validate functionality and identify edge cases.
- Performed significant refactoring work to improve code consistency, maintainability, and alignment across frontend and backend.
- Removed dead code, unused imports, and redundant logic to improve overall code quality.
- Restructured inconsistent patterns and naming conventions to establish unified coding standards throughout the application.
- Improved error handling and validation logic to ensure robust system behavior.

#### Collaboration & System Integration
- Played a critical role in system integration, ensuring seamless communication between frontend, backend, and database layers.
- Identified and resolved architectural and implementation issues that prevented system functionality.
- Collaborated with team members to establish working API contracts and integration standards.
- Supported overall system stability and correctness through iterative testing and refinement.

### Nelli Tarkka:

#### Deliverable I – Requirements Engineering
- Contributed to the creation and refinement of system documentation through the design of high-level architectural and conceptual diagrams.
- Developed diagrams illustrating system components, data flow, and interactions between the frontend, backend, and database.
- Supported the clarification of system scope and structure by visually modeling key functional elements and their relationships.

#### Deliverable II – Authentication & Login Functionality
- Contributed to the Implementing and configuring the user authentication and login functionality of the application.
- Worked on integrating secure login flows between the frontend and backend, ensuring correct handling of user credentials and authentication logic.
- Ensured that authentication-related features were correctly connected to backend endpoints and aligned with system requirements.

#### Deliverable III – Deployment & System Configuration
- Took full responsibility for deploying the complete application.
- Deployed the backend as a Node.js web service on Render and the frontend as a static application on Cloudflare Pages.
- Configured environment variables for secure communication between frontend, backend, database, and email services.
- Connected the backend to the Supabase PostgreSQL database and set up email functionality using SMTP.
- Verified that the deployed system was fully functional, publicly accessible, and ready for demonstration and evaluation.

#### Collaboration & Presentation
- Actively collaborated with team members throughout all project phases, particularly during system design, implementation, and deployment stages.
- Communicated deployment requirements, configuration details, and technical constraints to ensure smooth integration between frontend, backend, and database components.
- Supported the preparation and refinement of project documentation and presentation materials, with a focus on deployment architecture and system setup.
- Assisted in ensuring consistency between implemented features, technical documentation, and the final project presentation.
