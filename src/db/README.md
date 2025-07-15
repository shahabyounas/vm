# Database Domain Modules (`db/`)

This folder contains all Firebase-related logic, organized by domain for maintainability and scalability. Each file is responsible for a specific set of operations (auth, user, scan, rewards, settings).

## Structure

- **auth.ts**: Authentication logic (login, register, logout, subscribe to auth state)
- **user.ts**: User CRUD and user-related logic (fetch all users, fetch user realtime, update user role)
- **scan.ts**: Scan-related logic (add purchase, scan events)
- **rewards.ts**: Reward-related logic (use reward, reward history)
- **settings.ts**: Global settings CRUD (fetch and update global settings)

## Usage

Import the functions you need from the relevant file. Example:

```ts
import { loginUser, registerUser, logoutUser } from "@/db/auth";
import { fetchAllUsers, updateUserRole } from "@/db/user";
import { addPurchase } from "@/db/scan";
import { useReward } from "@/db/rewards";
import { fetchGlobalSettings, updateSettings } from "@/db/settings";
```

## Example: Login

```ts
const user = await loginUser(email, password);
```

## Example: Register

```ts
const newUser = await registerUser(name, email, password, feedback, settings);
```

## Example: Add Purchase (Scan)

```ts
await addPurchase(currentUser, settings, targetEmail, targetUid);
```

## Example: Use Reward

```ts
await useReward(currentUser);
```

## Example: Update Settings

```ts
await updateSettings(currentUser, newLimit, newMessage);
```

## Testing

- All modules are unit-testable with Jest.
- Firebase modules should be mocked to avoid real network/database calls.
- Test files should be placed in `__tests__/db/` and named after the module (e.g., `auth.test.ts`).

### Example Test (Jest)

```ts
import { loginUser } from "@/db/auth";
import { signInWithEmailAndPassword } from "firebase/auth";

jest.mock("firebase/auth");

describe("loginUser", () => {
  it("should call signInWithEmailAndPassword and return user data", async () => {
    // Arrange
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: { uid: "123" } });
    // ...mock getDoc, etc.
    // Act
    const user = await loginUser("test@example.com", "password");
    // Assert
    expect(signInWithEmailAndPassword).toHaveBeenCalled();
    expect(user).toBeDefined();
  });
});
```

## Contributing

- Add new domain files as needed for new features.
- Keep each file focused on a single domain.
- Update this README with new usage and testing instructions as the codebase evolves. 