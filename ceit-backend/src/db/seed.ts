import { db } from './index';
import { departments } from './schema';

const departmentsList = [
  { name: 'DIT' },
  { name: 'DIET' },
  { name: 'DAFE' },
  { name: 'DCEE' },
  { name: 'DCEA' },
];

async function seed() {
  console.log('Seeding departments...');
  for (const dept of departmentsList) {
    await db.insert(departments).values(dept).onConflictDoNothing();
  }
  console.log('Seeding completed.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
