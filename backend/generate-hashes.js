const bcrypt = require('bcrypt');
async function main() {
  const adminHash = await bcrypt.hash('Admin@DIVI2024!', 10);
  const staffHash = await bcrypt.hash('Staff@DIVI2024!', 10);
  console.log('ADMIN_HASH=' + adminHash);
  console.log('STAFF_HASH=' + staffHash);
  // verify
  const adminOk = await bcrypt.compare('Admin@DIVI2024!', adminHash);
  const staffOk = await bcrypt.compare('Staff@DIVI2024!', staffHash);
  console.log('admin verified:', adminOk);
  console.log('staff verified:', staffOk);
}
main();
