# Authentication System Documentation

This authentication system provides secure, password-based authentication for the portfolio website's edit mode. It includes session management, failed attempt tracking, and React context integration.

## Features

- **Password-based Authentication**: Simple password protection for edit mode
- **Session Management**: Automatic session timeout with extension capability
- **Security Features**: Failed attempt tracking, account lockout, and secure password hashing
- **React Integration**: Context provider and hooks for easy component integration
- **Protected Components**: Higher-order component for protecting routes/content

## Quick Start

### 1. Wrap your app with AuthProvider

```tsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
    return (
        <AuthProvider>
            {/* Your app content */}
        </AuthProvider>
    );
}
```

### 2. Use authentication in components

```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
    const { isAuthenticated, login, logout } = useAuth();
    
    if (isAuthenticated) {
        return <button onClick={logout}>Logout</button>;
    }
    
    return <LoginForm onSuccess={() => console.log('Logged in!')} />;
}
```

### 3. Protect components

```tsx
import { withAuth } from './contexts/AuthContext';

const ProtectedComponent = withAuth(MyEditComponent, {
    fallback: <div>Please log in to edit content</div>
});
```

## API Reference

### AuthService

The core authentication service that handles password validation, session management, and security features.

#### Methods

- `authenticate(password: string)`: Authenticate with password
- `isAuthenticated()`: Check if user is currently authenticated
- `logout()`: Clear current session
- `extendSession()`: Extend current session timeout
- `getSessionTimeRemaining()`: Get remaining session time in milliseconds
- `getLockoutInfo()`: Get account lockout status and remaining time

#### Configuration

```tsx
import { authService } from './services/AuthService';

// Update configuration
authService.updateConfig({
    sessionTimeout: 60 * 60 * 1000, // 1 hour
    maxLoginAttempts: 3,
    lockoutDuration: 30 * 60 * 1000 // 30 minutes
});
```

### AuthContext

React context that provides authentication state and methods to components.

#### useAuth Hook

```tsx
const {
    isAuthenticated,      // boolean: Current auth status
    isLoading,           // boolean: Loading state
    sessionTimeRemaining, // number: Time remaining in ms
    lockoutInfo,         // object: Lockout status
    login,               // function: Login with password
    logout,              // function: Logout user
    extendSession        // function: Extend current session
} = useAuth();
```

#### withAuth HOC

```tsx
const ProtectedComponent = withAuth(Component, {
    fallback: <CustomFallback /> // Optional custom fallback
});
```

### Components

#### LoginForm

Pre-built login form component with error handling and lockout support.

```tsx
<LoginForm 
    onSuccess={() => console.log('Login successful')}
    className="custom-styles"
/>
```

#### SessionStatus

Displays current session status with time remaining and logout button.

```tsx
<SessionStatus 
    showTimeRemaining={true}
    className="custom-styles"
/>
```

## Security Configuration

### Changing the Default Password

**Important**: Change the default password in production!

1. Open `src/services/AuthService.ts`
2. Update the `PASSWORD_HASH` constant with a new hash
3. Generate a new hash using the `hashPassword` method

```tsx
// In AuthService.ts, replace this line:
private readonly PASSWORD_HASH = 'e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3';

// With your new password hash
private readonly PASSWORD_HASH = 'your-new-password-hash-here';
```

### Security Best Practices

1. **Change Default Password**: Always change the default password in production
2. **Use HTTPS**: Ensure your site uses HTTPS to protect password transmission
3. **Regular Updates**: Update the password regularly
4. **Monitor Access**: Check browser developer tools for any authentication errors
5. **Session Management**: Configure appropriate session timeouts for your use case

## Example Usage

See `src/examples/AuthExample.tsx` for a complete working example that demonstrates:

- Authentication status display
- Login form integration
- Protected content
- Session management
- Error handling

## Testing

The authentication system includes comprehensive tests:

- **AuthService Tests**: Unit tests for all authentication logic
- **AuthContext Tests**: React component and hook tests
- **Integration Tests**: End-to-end authentication flows

Run tests with:
```bash
npm test AuthService
npm test AuthContext
```

## Troubleshooting

### Common Issues

1. **"useAuth must be used within an AuthProvider"**
   - Ensure your component is wrapped with `<AuthProvider>`

2. **Session expires too quickly**
   - Adjust `sessionTimeout` in AuthService configuration

3. **Account locked out**
   - Wait for lockout duration to expire or clear localStorage
   - Adjust `maxLoginAttempts` and `lockoutDuration` as needed

4. **Password not working**
   - Verify the password hash matches in AuthService
   - Check browser console for authentication errors

### Development Tips

- Use browser developer tools to inspect localStorage for session data
- Check console for authentication-related error messages
- Use the AuthExample component to test authentication flows
- Monitor network requests to ensure no sensitive data is transmitted

## Browser Compatibility

The authentication system uses modern browser APIs:
- `crypto.subtle` for password hashing
- `localStorage` for session storage
- `setInterval` for session management

Supported browsers:
- Chrome 37+
- Firefox 34+
- Safari 7+
- Edge 12+