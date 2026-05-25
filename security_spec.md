# security_spec.md

## 1. Data Invariants
- A **User** document must match their authentication payload: `request.auth.uid == userId` and the recorded email matches their verified email.
- A **Document** must be owned by the authenticated creator: `ownerId == request.auth.uid`.
- Document names and bodies must be bounded (e.g. `title` length ≤ 150 characters, `content` length ≤ 100,000 characters).
- Optional `isFavorite` must be standard boolean.
- Dynamic tags cannot exceed 10 items.
- Timestamps must correspond strictly to server-side `request.time`.

## 2. The Dirty Dozen Payloads (Vulnerability Scenarios)
1. **Identity Spoofing on Create**: Attempting to create a document in `/users/alice/documents/doc1` with `ownerId: "bob"`. (Blocked by rules checking ownerId).
2. **PII Isolation Leak on Read**: User "alice" trying to read `/users/bob/documents/doc1`. (Blocked by path userId matching `request.auth.uid`).
3. **Ghost Field Update**: Modifying a document and adding a field `shadyField: true`. (Blocked by strict `affectedKeys()` during update).
4. **State Shortcutting / Improper Timestamps**: Submitting a custom client timestamp `createdAt: "1970-01-01T00:00:00Z"`. (Blocked by `request.time` enforcement).
5. **Denial of Wallet (Huge Payload)**: Creating a document with a `title` that is 1MB large. (Blocked by string `.size() <= 150` check).
6. **Denial of Wallet (Huge Tags Array)**: Storing 20,000 tags. (Blocked by array size `<= 10` check).
7. **Privilege Escalation on user document**: Setting `role: "admin"` directly inside the User schema. (No role field exist or permitted).
8. **Immutability Bypass**: Changing the `ownerId` or `createdAt` of an existing document. (Blocked by `incoming().ownerId == existing().ownerId` and `incoming().createdAt == existing().createdAt`).
9. **Anonymous / Unverified Writes**: Writing without a verified email. (Blocked by `request.auth.token.email_verified == true`).
10. **Malicious ID injection**: Writing to document ID `"../../junk-id-hack-long-chars"`. (Blocked by `isValidId` size and regex check on path).
11. **Spoofed Admin Check**: Setting a custom claim to bypass checks. (Blocked by reading real database roles if applicable).
12. **Conflict Manipulation**: Attempting to bypass validations during updates with unsafe partial edits. (Blocked by `isValidDocument` wrapping updates).

## 3. The Firebase Rules Draft (DRAFT_firestore.rules)
Created safely to assert mathematical safety gates.
