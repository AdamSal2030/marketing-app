import { UserModel } from '../lib/models';

async function createAdminUser() {
  try {
    console.log('🔄 Creating admin user...');

    const email = 'admin@digitalagency.com';
    const password = 'Admin123!';

    // Check if admin already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      console.log('✅ Admin user already exists!');
      console.log('Email:', email);
      return;
    }

    // Create admin user
    const admin = await UserModel.create({
      email,
      password,
      role: 'admin',
      first_name: 'Admin',
      last_name: 'User'
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🆔 User ID:', admin.id);
    console.log('');
    console.log('⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  createAdminUser();
}

export default createAdminUser;