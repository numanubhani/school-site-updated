# Security Specification: EduXcel

## Data Invariants
1.   A user can only read their own profile.
2.   A Principal can read all teacher and student profiles within their school (`schoolId` match).
3.   A School document is world-readable (for validation), but writeable only by its Principal.
4.   Classes are only readable by teachers/students within the same school.
5.   Assignments are only writeable by teachers of that class.
6.   A Parent can only read profiles/progress of children linked to their `uid` or `parentId`.

## The "Dirty Dozen" Payloads (Red Team Test Cases)

1.  **Identity Theft**: Attempting to create a `users/{anyId}` document with a different `uid` than the authenticated user.
2.  **Role Escalation**: A student attempting to update their role to `principal`.
3.  **School Hijack**: A non-principal attempting to update `schools/{schoolId}/principalId`.
4.  **Ghost Class**: A teacher from School A attempting to create a class in School B.
5.  **Shadow Student**: A student attempting to add themselves to a class they don't belong to.
6.  **Admin Spoofing**: Attempting to set `role: 'admin'` or similar non-existent roles.
7.  **Data Scraping**: Attempting to `list` all users in the system without a `schoolId` filter.
8.  **Invite Code Leak**: Attempting to read `school` details of a school the user is not part of (except for public name).
9.  **Orphaned Assignment**: Creating an assignment for a class that doesn't exist.
10. **Malicious ID**: Using a 2KB string as a `schoolId`.
11. **Immortality Breach**: Attempting to change `createdAt` on an existing document.
12. **Status Shortcut**: A student attempting to mark an assignment as `graded`.

## Transition to Rules
The rules will implement these checks using `isValidUser`, `isValidSchool`, and `isValidClass` helpers.
