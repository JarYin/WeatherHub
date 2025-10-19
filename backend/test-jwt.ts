// Test script to decode and verify JWT token
import jwt from 'jsonwebtoken';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM1NWFiZjVkLWUwNDUtNGMzMi05ZjIxLTRiY2VhOWIzNmEwYiIsImVtYWlsIjoiZGVtb0BleGFtcGxlLmNvbSIsImlhdCI6MTc2MDg4MDA2NywiZXhwIjoxNzYxNDg0ODY3fQ.Ae0JmnGE4CbTkuu91UlcyYQkkdCrN87H6oHYAHNumzg';
const secret = 'your_super_secret_jwt_key_change_this_in_production';

console.log('🔍 Testing JWT Token Decoding');
console.log('================================');

try {
    // Decode without verification (to see payload)
    const decoded = jwt.decode(token);
    console.log('📄 Decoded payload (unverified):');
    console.log(JSON.stringify(decoded, null, 2));
    
    // Verify with secret
    const verified = jwt.verify(token, secret);
    console.log('\n✅ Verified payload:');
    console.log(JSON.stringify(verified, null, 2));
    
    console.log('\n🎉 Token is valid!');
    console.log(`👤 User ID: ${(verified as any).id}`);
    console.log(`📧 Email: ${(verified as any).email}`);
    
} catch (error: any) {
    console.error('❌ Token verification failed:', error.message);
}